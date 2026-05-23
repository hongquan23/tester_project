from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel

from api.deps import get_db
from core.config import settings
from crud import user_attempt as attempt_crud

router = APIRouter()

SKILL_VI = {
    "listening": "Listening",
    "reading": "Reading",
    "speaking": "Speaking",
    "writing": "Writing",
}


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    user_id: int | None = None
    message: str
    history: list[ChatMessage] = []


def build_system_prompt(ctx: dict, weak_data: dict) -> str:
    lines = [
        "Bạn là trợ lý học TOEIC thông minh của nền tảng LearnWithMe.\n",
        "Nhiệm vụ:",
        "1. Trả lời câu hỏi về TOEIC — cấu trúc đề, chiến lược làm bài, từ vựng, ngữ pháp",
        "2. Phân tích kết quả và đưa lời khuyên CÁ NHÂN HÓA dựa trên dữ liệu thực của học viên",
        "3. Giải thích đáp án, cung cấp ví dụ minh họa tiếng Anh có nghĩa tiếng Việt",
        "4. Động viên, đề xuất lộ trình và bài tập cụ thể\n",
        "Quy tắc:",
        "- Trả lời bằng tiếng Việt, rõ ràng, thân thiện",
        "- Dùng emoji phù hợp",
        "- Tối đa 350 từ (trừ khi được yêu cầu chi tiết)",
        "- Chỉ hỗ trợ trong phạm vi học tiếng Anh và TOEIC",
        "- LUÔN đề cập đến dữ liệu cụ thể của học viên khi trả lời câu hỏi về điểm yếu, lộ trình, hay tiến độ",
        "",
    ]

    # ── Hồ sơ học tập ──────────────────────────────────────────────────────────
    if ctx.get("has_data"):
        lines.append("=" * 50)
        lines.append("HỒ SƠ HỌC VIÊN (dữ liệu thực từ hệ thống)")
        lines.append("=" * 50)

        total_s = ctx["total_sessions"]
        avg = ctx["avg_score_pct"]
        most = SKILL_VI.get(ctx.get("most_practiced_skill", ""), "")
        skill_counts = ctx.get("skill_session_counts", {})

        lines.append(f"• Tổng số lần làm bài: {total_s} phiên")
        lines.append(f"• Điểm trung bình tổng thể: {avg}%")
        if most:
            lines.append(f"• Kỹ năng luyện nhiều nhất: {most}")

        if skill_counts:
            dist = ", ".join(
                f"{SKILL_VI.get(k, k)}: {v} lần"
                for k, v in sorted(skill_counts.items(), key=lambda x: -x[1])
            )
            lines.append(f"• Phân bổ luyện tập: {dist}")

        # Lịch sử 5 phiên gần nhất
        recent = ctx.get("recent_sessions", [])
        if recent:
            lines.append("")
            lines.append("5 phiên làm bài gần nhất (mới nhất trước):")
            for s in recent:
                skill_label = SKILL_VI.get(s["skill"], s["skill"])
                status = "✅" if s["percent"] >= 70 else ("⚠️" if s["percent"] >= 50 else "❌")
                lines.append(
                    f"  {status} [{s['date']}] {s['section_name']} ({skill_label})"
                    f" — {s['score']}/{s['total']} câu = {s['percent']}%"
                )

        # Xu hướng
        trend = ctx.get("trend")
        if trend:
            arrow = "📈 Đang cải thiện" if trend["improving"] else "📉 Chưa cải thiện"
            lines.append("")
            lines.append(
                f"Xu hướng: {arrow} "
                f"(nửa đầu: {trend['first_avg']}% → nửa sau: {trend['second_avg']}%,"
                f" thay đổi: {'+' if trend['delta'] >= 0 else ''}{trend['delta']}%)"
            )

        # Phiên tốt nhất / tệ nhất
        best = ctx.get("best_session")
        worst = ctx.get("worst_session")
        if best and worst and best != worst:
            lines.append(
                f"Tốt nhất: {best['section_name']} ({best['percent']}%) | "
                f"Cần cải thiện nhất: {worst['section_name']} ({worst['percent']}%)"
            )

    else:
        lines.append("Học viên chưa có dữ liệu làm bài nào trên hệ thống.")

    # ── Phân tích điểm yếu từ câu hỏi MCQ ─────────────────────────────────────
    if weak_data.get("skill_accuracy") or weak_data.get("weak_areas"):
        lines.append("")
        lines.append("PHÂN TÍCH CHUYÊN SÂU TỪNG KỸ NĂNG (dựa trên từng câu MCQ)")
        total_mcq = weak_data.get("total_mcq_attempts", 0)
        lines.append(f"(Tổng {total_mcq} câu MCQ đã trả lời)")

        weak = weak_data.get("weak_areas", [])
        skill_acc = weak_data.get("skill_accuracy", {})

        for skill, stat in skill_acc.items():
            pct = round(stat["accuracy"] * 100)
            label = SKILL_VI.get(skill, skill)
            rating = "✅ Tốt" if pct >= 70 else ("⚠️ Cần cải thiện" if pct >= 50 else "❌ Yếu")
            lines.append(f"  {label}: {pct}% ({stat['correct']}/{stat['total']} câu) — {rating}")

        if weak:
            lines.append("")
            lines.append("Phần cụ thể cần ưu tiên ôn:")
            for area in weak:
                pct = round(area["accuracy"] * 100)
                lines.append(
                    f"  ❗ {area['part_label']}: {pct}% "
                    f"({area['correct']}/{area['total_attempts']} câu đúng)"
                )

    lines.append("")
    lines.append(
        "QUAN TRỌNG: Khi học viên hỏi về tiến độ, điểm yếu hoặc lộ trình, "
        "hãy TRÍCH DẪN dữ liệu cụ thể ở trên (tên đề thi, ngày, điểm số thực) "
        "thay vì trả lời chung chung."
    )

    return "\n".join(lines)


@router.post("/chat")
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    from groq import Groq

    ctx: dict = {"has_data": False}
    weak_data: dict = {"weak_areas": [], "skill_accuracy": {}, "total_mcq_attempts": 0}

    if request.user_id:
        try:
            ctx = attempt_crud.get_chatbot_context(db, request.user_id)
        except Exception:
            pass
        try:
            weak_data = attempt_crud.get_weak_areas(db, request.user_id)
        except Exception:
            pass

    client = Groq(api_key=settings.GROQ_API_KEY)
    system_prompt = build_system_prompt(ctx, weak_data)

    messages = [{"role": "system", "content": system_prompt}]
    for msg in request.history[-10:]:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": request.message})

    def generate():
        stream = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            stream=True,
            max_tokens=1024,
            temperature=0.7,
        )
        for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta

    return StreamingResponse(
        generate(),
        media_type="text/plain; charset=utf-8",
        headers={"X-Content-Type-Options": "nosniff"},
    )

import React from "react";

const OPTION_KEYS   = ["A", "B", "C", "D"];
const OPTION_FIELDS = ["option_a", "option_b", "option_c", "option_d"];


const statusBadge = (item) => {
  if (item.is_correct) return { label: "Đúng",   bg: "#dcfce7", color: "#16a34a", border: "#86efac",  icon: "✓" };
  if (item.user_ans)   return { label: "Sai",    bg: "#fee2e2", color: "#dc2626", border: "#fca5a5",  icon: "✗" };
  return                      { label: "Bỏ qua", bg: "#fef9c3", color: "#b45309", border: "#fcd34d",  icon: "—" };
};

const ExamResult = ({ result, test, onBack, onRetry }) => {
  if (!result) return null;

  const score    = result.score ?? 0;
  const total    = result.total ?? 0;
  const answered = (result.results || []).length;
  const wrong    = answered - score;
  const skipped  = total - answered;
  const timeTaken = result.timeTaken ?? null;
  const fmtTime  = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };
  const testName = test?.title || test?.name || "Bài thi";
  const dateStr  = result.created_at
    ? new Date(result.created_at).toLocaleString("vi-VN")
    : "";

  const answerMap = {};
  (result.results || []).forEach(r => { answerMap[r.question_id] = r; });

  const allItems = (result.questions || []).map(q => {
    const ans = answerMap[q.id];
    return {
      ...q,
      user_ans:       ans?.user_ans       ?? null,
      correct_answer: ans?.correct_answer ?? q.correct_answer ?? "",
      is_correct:     ans?.is_correct     ?? false,
    };
  });

  allItems.sort((a, b) => {
    const pa = a.part_number ?? a.part ?? 1;
    const pb = b.part_number ?? b.part ?? 1;
    if (pa !== pb) return pa - pb;
    return (a.question_number ?? 9999) - (b.question_number ?? 9999);
  });

  const partGroups = allItems.reduce((acc, item) => {
    const p = item.part_number ?? item.part ?? 1;
    if (!acc[p]) acc[p] = [];
    acc[p].push(item);
    return acc;
  }, {});

  return (
    <div style={S.page}>
      <div style={S.inner}>

        {/* ── TOP BAR ── */}
        <div style={S.topBar}>
          <div style={S.topLeft}>
            <button style={S.btnBack} onClick={onBack}>← Về trang chủ</button>
            <button style={S.btnRetry} onClick={onRetry}>↻ Làm lại</button>
          </div>
          {dateStr && <span style={S.dateChip}>⏰ {dateStr}</span>}
        </div>

        {/* ── STATS ROW ── */}
        <div style={S.statsBar}>
          <div style={S.statItem}>
            <span style={S.statVal}>{total}</span>
            <span style={S.statLbl}>Tổng câu</span>
          </div>
          <div style={S.statDivider} />
          <div style={S.statItem}>
            <span style={{ ...S.statVal, color: "#16a34a" }}>{score}</span>
            <span style={S.statLbl}>✅ Đúng</span>
          </div>
          <div style={S.statDivider} />
          <div style={S.statItem}>
            <span style={{ ...S.statVal, color: "#dc2626" }}>{wrong}</span>
            <span style={S.statLbl}>❌ Sai</span>
          </div>
          <div style={S.statDivider} />
          <div style={S.statItem}>
            <span style={{ ...S.statVal, color: "#b45309" }}>{skipped}</span>
            <span style={S.statLbl}>⚠️ Chưa làm</span>
          </div>
          {timeTaken !== null && (
            <>
              <div style={S.statDivider} />
              <div style={S.statItem}>
                <span style={{ ...S.statVal, color: "#6366f1" }}>{fmtTime(timeTaken)}</span>
                <span style={S.statLbl}>⏱ Thời gian</span>
              </div>
            </>
          )}
        </div>

        {/* ── QUESTION LIST grouped by part ── */}
        {allItems.length > 0 && (
          <div style={S.section}>
            <div style={S.sectionHeader}>📘 Chi tiết đáp án</div>

            {Object.entries(partGroups)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([part, items]) => {
                const partCorrect = items.filter(i => i.is_correct).length;
                const partWrong   = items.filter(i => i.user_ans && !i.is_correct).length;
                const partSkipped = items.filter(i => !i.user_ans).length;
                return (
                  <div key={part} style={S.partBlock}>

                    {/* Part header */}
                    <div style={S.partHeader}>
                      <span style={S.partBadge}>Part {part}</span>
                      <div style={S.partStats}>
                        <span style={S.partStat}>{items.length} câu</span>
                        <span style={{ ...S.partStat, color: "#16a34a", background: "#f0fdf4" }}>✓ {partCorrect} đúng</span>
                        <span style={{ ...S.partStat, color: "#dc2626", background: "#fff1f2" }}>✗ {partWrong} sai</span>
                        {partSkipped > 0 && (
                          <span style={{ ...S.partStat, color: "#b45309", background: "#fefce8" }}>— {partSkipped} bỏ qua</span>
                        )}
                      </div>
                    </div>

                    {/* Questions */}
                    <div style={S.qList}>
                      {items.map((item, idx) => {
                        const badge = statusBadge(item);
                        const opts  = OPTION_KEYS
                          .map((k, i) => ({ k, v: item[OPTION_FIELDS[i]] }))
                          .filter(o => o.v);

                        return (
                          <div key={item.id ?? idx} style={{ ...S.qCard, borderLeft: `4px solid ${badge.border}` }}>

                            {/* Header */}
                            <div style={S.qHeader}>
                              <div style={{ ...S.qNum, background: badge.bg, color: badge.color, border: `2px solid ${badge.border}` }}>
                                {item.question_number ?? idx + 1}
                              </div>

                              <div style={S.qMeta}>
                                <div style={S.qText}>
                                  {item.sentence
                                    ? item.sentence.replace('-------', '______')
                                    : (item.question || `Câu ${idx + 1}`)}
                                </div>
                                <div style={S.qSub}>
                                  <span>Đáp án đúng:&nbsp;
                                    <strong style={{ color: "#15803d" }}>{item.correct_answer}</strong>
                                  </span>
                                  {item.user_ans && item.user_ans !== item.correct_answer && (
                                    <span style={{ color: "#dc2626" }}>&nbsp;· Bạn chọn: {item.user_ans}</span>
                                  )}
                                  {!item.user_ans && (
                                    <span style={{ color: "#b45309" }}>&nbsp;· Bỏ qua</span>
                                  )}
                                </div>
                              </div>

                              <span style={{ ...S.badge, background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                                {badge.icon} {badge.label}
                              </span>
                            </div>

                            {/* Passage - only show for non-RC (passage too long for result view) */}
                            {item.passage && !item.part_number && (
                              <div style={S.passage}>
                                <span style={S.passageLabel}>
                                  {test?.skill === 'Reading' ? 'Passage' : 'Transcript'}
                                </span>
                                <p style={S.passageText}>{item.passage}</p>
                              </div>
                            )}

                            {/* Options */}
                            {opts.length > 0 && (
                              <div style={S.optGrid}>
                                {opts.map(opt => {
                                  const isCorrect = opt.k === item.correct_answer;
                                  const isUser    = opt.k === item.user_ans;
                                  return (
                                    <div
                                      key={opt.k}
                                      style={{
                                        ...S.opt,
                                        ...(isCorrect ? S.optCorrect : {}),
                                        ...(isUser && !isCorrect ? S.optWrong : {}),
                                      }}
                                    >
                                      <span style={{
                                        ...S.optKey,
                                        background: isCorrect ? "#16a34a" : isUser ? "#dc2626" : "#e2e8f0",
                                        color: (isCorrect || isUser) ? "white" : "#475569",
                                      }}>
                                        {opt.k}
                                      </span>
                                      <span style={{ flex: 1, fontSize: 14, color: isCorrect ? "#15803d" : isUser ? "#b91c1c" : "#334155" }}>
                                        {opt.v}
                                      </span>
                                      {isCorrect && <span style={{ fontSize: 13, fontWeight: 700, color: "#16a34a", flexShrink: 0 }}>✓ Đúng</span>}
                                      {isUser && !isCorrect && <span style={{ fontSize: 13, fontWeight: 700, color: "#dc2626", flexShrink: 0 }}>✗ Sai</span>}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        )}

      </div>
    </div>
  );
};

const S = {
  /* ── Page ── */
  page: {
    minHeight: "100vh",
    backgroundColor: "#f1f5f9",
    fontFamily: "'Plus Jakarta Sans','Inter','Segoe UI',sans-serif",
    color: "#0f172a",
    padding: "28px 20px 60px",
  },

  inner: {
    maxWidth: 880,
    margin: "0 auto",
  },

  /* ── Top bar ── */
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 10,
  },

  topLeft: {
    display: "flex",
    gap: 10,
  },

  btnBack: {
    border: "1px solid #e2e8f0",
    padding: "9px 20px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    color: "#475569",
    cursor: "pointer",
    background: "white",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },

  btnRetry: {
    border: "none",
    padding: "9px 20px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 700,
    color: "white",
    cursor: "pointer",
    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
    boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
  },

  dateChip: {
    fontSize: 13,
    fontWeight: 600,
    color: "#64748b",
    background: "white",
    padding: "7px 14px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
  },

  /* ── Stats bar ── */
  statsBar: {
    display: "flex",
    alignItems: "center",
    background: "white",
    borderRadius: 14,
    padding: "14px 24px",
    marginBottom: 16,
    boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
    border: "1px solid #f1f5f9",
    gap: 0,
  },

  statItem: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },

  statVal: {
    fontSize: 22,
    fontWeight: 800,
    color: "#0f172a",
    lineHeight: 1,
  },

  statLbl: {
    fontSize: 12,
    fontWeight: 600,
    color: "#94a3b8",
  },

  statDivider: {
    width: 1,
    height: 32,
    background: "#e2e8f0",
    flexShrink: 0,
  },

  /* ── Answer section ── */
  section: {
    background: "white",
    borderRadius: 20,
    padding: "24px 28px",
    boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
    border: "1px solid #f1f5f9",
  },

  sectionHeader: {
    fontSize: 15,
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: 20,
    paddingBottom: 14,
    borderBottom: "1px solid #f1f5f9",
  },

  /* Part grouping */
  partBlock: { marginBottom: 28 },

  partHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
    flexWrap: "wrap",
  },

  partBadge: {
    fontSize: 12,
    fontWeight: 700,
    color: "#6366f1",
    background: "#eef2ff",
    border: "1px solid #c7d2fe",
    padding: "4px 12px",
    borderRadius: 20,
    flexShrink: 0,
  },

  partStats: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
  },

  partStat: {
    fontSize: 12,
    fontWeight: 600,
    color: "#64748b",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    padding: "3px 10px",
    borderRadius: 20,
  },

  /* Question list */
  qList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  qCard: {
    background: "#fafafa",
    borderRadius: 14,
    padding: "16px 18px",
    border: "1px solid #e2e8f0",
  },

  qHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },

  qNum: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 14,
    flexShrink: 0,
  },

  qMeta: { flex: 1, minWidth: 0 },

  qText: {
    fontSize: 14,
    fontWeight: 600,
    color: "#1e293b",
    lineHeight: 1.5,
    marginBottom: 4,
  },

  qSub: { fontSize: 13, color: "#64748b" },

  badge: {
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
    whiteSpace: "nowrap",
  },

  /* Passage */
  passage: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: 10,
    padding: "10px 14px",
    marginBottom: 12,
  },

  passageLabel: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: "#3b82f6",
    display: "block",
    marginBottom: 4,
  },

  passageText: {
    fontSize: 13,
    lineHeight: 1.65,
    color: "#1e40af",
    margin: 0,
    whiteSpace: "pre-line",
  },

  /* Options */
  optGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
  },

  opt: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 12px",
    borderRadius: 10,
    background: "white",
    border: "1.5px solid #e2e8f0",
  },

  optCorrect: {
    background: "#f0fdf4",
    border: "1.5px solid #86efac",
    fontWeight: 600,
  },

  optWrong: {
    background: "#fff1f2",
    border: "1.5px solid #fca5a5",
    fontWeight: 600,
  },

  optKey: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 800,
    flexShrink: 0,
  },
};

export default ExamResult;

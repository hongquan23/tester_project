import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Ticket, Users, FileText, Smile, Play } from "lucide-react";
import InfoModal from "./InfoModal";

const ContestPage = () => {
  const navigate  = useNavigate();
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div style={S.page}>

      {/* ── HEADER BAR ── */}
      <div style={S.headerBar}>
        <button style={S.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} style={{ marginRight: 6 }} />
          Quay lại
        </button>
      </div>

      {/* ── HERO ── */}
      <div style={S.hero}>
        <div style={S.heroInner}>

          {/* Left */}
          <div style={S.heroLeft}>
            <div style={S.dateBadge}>
              <Calendar size={14} style={{ marginRight: 6 }} />
              Đăng ký mở đến&nbsp;<strong>31/03/2026</strong>
            </div>

            <h1 style={S.heroTitle}>
              English<br />
              <span style={S.heroAccent}>Contest 2026</span>
            </h1>

            <p style={S.heroDesc}>
              Cuộc thi tiếng Anh toàn quốc kiến tạo tương lai.
              Hãy sẵn sàng tỏa sáng và chinh phục những giải thưởng giá trị nhất!
            </p>

            <div style={S.ctaRow}>
              <button style={S.ctaPrimary}>
                <Ticket size={18} style={{ marginRight: 8 }} />
                Đăng ký ngay
              </button>
              <button style={S.ctaSecondary} onClick={() => setShowInfo(true)}>
                <Play size={16} fill="#6366f1" color="#6366f1" style={{ marginRight: 8 }} />
                Xem thông tin
              </button>
            </div>

            {/* Stats */}
            <div style={S.statsRow}>
              {[
                { icon: <Users size={18} color="#6366f1" />, val: "12,480", lbl: "Thí sinh" },
                { icon: <FileText size={18} color="#0891b2" />, val: "50+",    lbl: "Đề thi" },
                { icon: <Smile size={18} color="#16a34a" />,  val: "98%",    lbl: "Hài lòng" },
              ].map(s => (
                <div key={s.lbl} style={S.statItem}>
                  <div style={S.statIcon}>{s.icon}</div>
                  <div style={S.statVal}>{s.val}</div>
                  <div style={S.statLbl}>{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — image */}
          <div style={S.heroRight}>
            <div style={S.imgFrame}>
              <img
                src="https://haycafe.vn/wp-content/uploads/2022/04/Hinh-nen-anh-quyet-tam-on-thi-cute.jpg"
                alt="Contest"
                style={S.heroImg}
              />
              <div style={S.imgOverlay} />
              <div style={S.imgCaption}>
                "Education is the most powerful weapon..."
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── INFO CARDS ── */}
      <div style={S.infoSection}>
        {[
          { emoji: "🏆", title: "Giải thưởng hấp dẫn", desc: "Tổng giá trị giải thưởng lên đến 500 triệu đồng cùng học bổng du học." },
          { emoji: "📝", title: "Hình thức thi", desc: "Thi trực tuyến, gồm các phần Listening, Reading, Writing và Speaking." },
          { emoji: "📅", title: "Lịch thi", desc: "Vòng sơ khảo: 15/02 · Bán kết: 01/03 · Chung kết: 20/03/2026." },
          { emoji: "🎯", title: "Đối tượng tham gia", desc: "Học sinh, sinh viên và người đi làm từ 15 tuổi trở lên trên toàn quốc." },
        ].map(card => (
          <div key={card.title} style={S.infoCard}>
            <div style={S.infoEmoji}>{card.emoji}</div>
            <div style={S.infoTitle}>{card.title}</div>
            <div style={S.infoDesc}>{card.desc}</div>
          </div>
        ))}
      </div>

      <InfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />
    </div>
  );
};

const S = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f1f5f9",
    fontFamily: "'Plus Jakarta Sans','Inter',sans-serif",
    color: "#0f172a",
  },

  /* Header bar */
  headerBar: {
    backgroundColor: "white",
    borderBottom: "1px solid #e2e8f0",
    padding: "0 24px",
    height: 56,
    display: "flex",
    alignItems: "center",
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    padding: "7px 16px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    background: "white",
    fontSize: 14,
    fontWeight: 600,
    color: "#475569",
    cursor: "pointer",
  },

  /* Hero */
  hero: {
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #a78bfa 100%)",
    padding: "48px 24px",
  },
  heroInner: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 48,
    alignItems: "center",
  },
  heroLeft: {},

  dateBadge: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: 13,
    fontWeight: 600,
    color: "#c7d2fe",
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.2)",
    padding: "6px 16px",
    borderRadius: 20,
    marginBottom: 24,
  },

  heroTitle: {
    fontSize: 52,
    fontWeight: 900,
    color: "white",
    lineHeight: 1.1,
    margin: "0 0 18px",
    letterSpacing: "-1px",
  },
  heroAccent: {
    background: "linear-gradient(135deg, #fbbf24, #f97316)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroDesc: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 1.7,
    marginBottom: 32,
  },

  ctaRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 36,
  },
  ctaPrimary: {
    display: "flex",
    alignItems: "center",
    background: "linear-gradient(135deg, #f97316, #ef4444)",
    color: "white",
    border: "none",
    padding: "13px 28px",
    borderRadius: 14,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(249,115,22,0.35)",
  },
  ctaSecondary: {
    display: "flex",
    alignItems: "center",
    background: "white",
    color: "#6366f1",
    border: "none",
    padding: "13px 24px",
    borderRadius: 14,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },

  /* Stats */
  statsRow: {
    display: "flex",
    gap: 0,
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 18,
    overflow: "hidden",
  },
  statItem: {
    flex: 1,
    padding: "18px 12px",
    textAlign: "center",
    borderRight: "1px solid rgba(255,255,255,0.15)",
  },
  statIcon: { marginBottom: 6 },
  statVal: { fontSize: 22, fontWeight: 900, color: "white", marginBottom: 4 },
  statLbl: { fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.06em" },

  /* Right image */
  heroRight: {},
  imgFrame: {
    position: "relative",
    borderRadius: 24,
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    aspectRatio: "4/3",
  },
  heroImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  imgOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to top, rgba(99,102,241,0.5) 0%, transparent 60%)",
  },
  imgCaption: {
    position: "absolute",
    bottom: 16,
    left: 20,
    right: 20,
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontStyle: "italic",
    fontWeight: 500,
  },

  /* Info cards */
  infoSection: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "32px 24px 48px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 16,
  },
  infoCard: {
    background: "white",
    borderRadius: 18,
    padding: "24px 20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    border: "1px solid #f1f5f9",
  },
  infoEmoji: { fontSize: 28, marginBottom: 12 },
  infoTitle: { fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 8 },
  infoDesc:  { fontSize: 13, color: "#64748b", lineHeight: 1.65 },
};

export default ContestPage;

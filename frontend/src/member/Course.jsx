import React, { useState } from "react";
import { Search, BookOpen, Star, Clock, Globe, Filter, ChevronRight, Sparkles } from "lucide-react";

const englishCourses = [
  {
    id: 1,
    title: "IELTS Breakthrough: 7.5+ Masterclass",
    level: "Advanced",
    image: "https://down-vn.img.susercontent.com/file/sg-11134201-22120-tom8vbdj51kvc1",
    price: "$99.99",
    rating: "4.9",
    students: "8.5k",
    duration: "45h",
    tag: "Exam Prep",
    tagColor: "#6366f1",
    tagBg: "#eef2ff",
  },
  {
    id: 2,
    title: "Business English for Professionals",
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
    price: "$59.99",
    rating: "4.8",
    students: "12k",
    duration: "30h",
    tag: "Business",
    tagColor: "#0369a1",
    tagBg: "#e0f2fe",
  },
  {
    id: 3,
    title: "English Pronunciation & Accent Training",
    level: "All Levels",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
    price: "Free",
    rating: "4.7",
    students: "25k",
    duration: "12h",
    tag: "Speaking",
    tagColor: "#15803d",
    tagBg: "#dcfce7",
  },
  {
    id: 4,
    title: "TOEIC 900+: Intensive Training",
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173",
    price: "$45.00",
    rating: "4.9",
    students: "5.2k",
    duration: "60h",
    tag: "Exam Prep",
    tagColor: "#6366f1",
    tagBg: "#eef2ff",
  },
];

const TABS = ["Tất cả", "Miễn phí", "Trả phí"];

const Course = () => {
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [search, setSearch] = useState("");

  const filtered = englishCourses.filter(c => {
    const matchTab =
      activeTab === "Tất cả" ||
      (activeTab === "Miễn phí" && c.price === "Free") ||
      (activeTab === "Trả phí" && c.price !== "Free");
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div style={S.page}>

      {/* ── HERO ── */}
      <div style={S.hero}>
        <div style={S.heroInner}>
          <div style={S.heroChip}>
            <Sparkles size={12} style={{ marginRight: 6 }} />
            Khóa học tiếng Anh
          </div>
          <h1 style={S.heroTitle}>Làm chủ tiếng Anh,<br />mở ra thế giới</h1>
          <p style={S.heroSub}>
            Học theo lộ trình chuẩn quốc tế. Tự tin chinh phục chứng chỉ và giao tiếp như người bản xứ.
          </p>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={S.main}>
        <div style={S.layout}>

          {/* SIDEBAR */}
          <aside style={S.sidebar}>
            <div style={S.sideCard}>
              <div style={S.sideTitle}>
                <Filter size={14} style={{ marginRight: 6, color: "#6366f1" }} />
                Bộ lọc
              </div>

              <div style={S.searchWrap}>
                <Search size={15} style={S.searchIcon} />
                <input
                  type="text"
                  placeholder="Tìm khóa học..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={S.searchInput}
                />
              </div>

              <div style={S.filterGroup}>
                <div style={S.filterLabel}>Danh mục</div>
                {["IELTS", "TOEIC", "Speaking", "Business"].map(cat => (
                  <label key={cat} style={S.checkRow}>
                    <input type="checkbox" style={{ accentColor: "#6366f1" }} />
                    <span style={S.checkLabel}>{cat}</span>
                  </label>
                ))}
              </div>

              <div style={S.filterGroup}>
                <div style={S.filterLabel}>Trình độ</div>
                {["Beginner", "Intermediate", "Advanced"].map(lv => (
                  <label key={lv} style={S.checkRow}>
                    <input type="checkbox" style={{ accentColor: "#6366f1" }} />
                    <span style={S.checkLabel}>{lv}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* COURSE LIST */}
          <div style={S.courseArea}>
            <div style={S.courseHeader}>
              <h2 style={S.courseHeading}>
                Khóa học nổi bật
                <span style={S.courseCount}>{filtered.length} khóa</span>
              </h2>
              <div style={S.tabs}>
                {TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      ...S.tab,
                      ...(activeTab === tab ? S.tabActive : {}),
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div style={S.empty}>Không tìm thấy khóa học phù hợp.</div>
            ) : (
              <div style={S.grid}>
                {filtered.map(course => (
                  <div key={course.id} style={S.card}>
                    {/* Image */}
                    <div style={S.imgWrap}>
                      <img src={course.image} alt={course.title} style={S.img} />
                      <span style={{ ...S.imgTag, color: course.tagColor, background: course.tagBg }}>
                        {course.tag}
                      </span>
                    </div>

                    {/* Body */}
                    <div style={S.cardBody}>
                      <div style={S.cardMeta}>
                        <span style={S.metaItem}><Clock size={12} style={{ marginRight: 4 }} />{course.duration}</span>
                        <span style={S.metaItem}><Globe size={12} style={{ marginRight: 4 }} />{course.level}</span>
                      </div>

                      <h3 style={S.cardTitle}>{course.title}</h3>

                      <div style={S.ratingRow}>
                        <Star size={13} fill="#f59e0b" color="#f59e0b" />
                        <span style={S.ratingVal}>{course.rating}</span>
                        <span style={S.ratingCount}>({course.students} học viên)</span>
                      </div>

                      <div style={S.cardFooter}>
                        <span style={S.price}>
                          {course.price === "Free"
                            ? <span style={{ color: "#16a34a", fontWeight: 800 }}>Miễn phí</span>
                            : course.price}
                        </span>
                        <button style={S.joinBtn}>
                          Tham gia <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
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

  /* Hero */
  hero: {
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    padding: "52px 24px 64px",
  },
  heroInner: {
    maxWidth: 640,
    margin: "0 auto",
    textAlign: "center",
  },
  heroChip: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "#c7d2fe",
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.2)",
    padding: "5px 14px",
    borderRadius: 20,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 900,
    color: "white",
    margin: "0 0 14px",
    lineHeight: 1.2,
    letterSpacing: "-0.5px",
  },
  heroSub: {
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 1.7,
    margin: 0,
  },

  /* Main layout */
  main: {
    maxWidth: 1200,
    margin: "-28px auto 0",
    padding: "0 24px 48px",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    gap: 24,
    alignItems: "start",
  },

  /* Sidebar */
  sidebar: { position: "sticky", top: 16 },
  sideCard: {
    background: "white",
    borderRadius: 20,
    padding: "20px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    border: "1px solid #f1f5f9",
  },
  sideTitle: {
    display: "flex",
    alignItems: "center",
    fontSize: 13,
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  searchWrap: {
    position: "relative",
    marginBottom: 20,
  },
  searchIcon: {
    position: "absolute",
    left: 10,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94a3b8",
  },
  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "8px 10px 8px 34px",
    fontSize: 13,
    outline: "none",
    color: "#334155",
    background: "#f8fafc",
  },
  filterGroup: { marginBottom: 16 },
  filterLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: 10,
  },
  checkRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    cursor: "pointer",
  },
  checkLabel: { fontSize: 13, color: "#475569", fontWeight: 500 },

  /* Course area */
  courseArea: {},
  courseHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 10,
  },
  courseHeading: {
    fontSize: 18,
    fontWeight: 800,
    color: "#0f172a",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  courseCount: {
    fontSize: 12,
    fontWeight: 600,
    color: "#6366f1",
    background: "#eef2ff",
    border: "1px solid #c7d2fe",
    padding: "2px 10px",
    borderRadius: 20,
  },
  tabs: {
    display: "flex",
    background: "white",
    borderRadius: 12,
    padding: 4,
    border: "1px solid #e2e8f0",
    gap: 2,
  },
  tab: {
    padding: "6px 16px",
    borderRadius: 9,
    fontSize: 12,
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
    background: "transparent",
    color: "#64748b",
    transition: "all 0.15s",
  },
  tabActive: {
    background: "#6366f1",
    color: "white",
  },
  empty: {
    textAlign: "center",
    padding: 60,
    color: "#94a3b8",
    fontSize: 14,
    background: "white",
    borderRadius: 16,
  },

  /* Grid */
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: 20,
  },

  /* Card */
  card: {
    background: "white",
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    border: "1px solid #f1f5f9",
    transition: "box-shadow 0.2s, transform 0.2s",
  },
  imgWrap: {
    position: "relative",
    height: 160,
    overflow: "hidden",
    background: "#e2e8f0",
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  imgTag: {
    position: "absolute",
    top: 10,
    left: 10,
    fontSize: 10,
    fontWeight: 700,
    padding: "3px 10px",
    borderRadius: 20,
    letterSpacing: "0.04em",
  },
  cardBody: { padding: "16px 18px" },
  cardMeta: {
    display: "flex",
    gap: 14,
    marginBottom: 10,
    color: "#94a3b8",
    fontSize: 12,
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    fontWeight: 600,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#0f172a",
    lineHeight: 1.45,
    marginBottom: 10,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  ratingRow: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    marginBottom: 14,
  },
  ratingVal: { fontSize: 13, fontWeight: 700, color: "#0f172a" },
  ratingCount: { fontSize: 12, color: "#94a3b8" },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTop: "1px solid #f1f5f9",
  },
  price: { fontSize: 16, fontWeight: 800, color: "#0f172a" },
  joinBtn: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "#6366f1",
    color: "white",
    border: "none",
    padding: "7px 14px",
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
};

export default Course;

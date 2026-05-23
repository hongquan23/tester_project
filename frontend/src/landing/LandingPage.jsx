import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./landing.module.css";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>

      {/* ── NAVBAR ── */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <span className={styles.navLogoIcon}>🎓</span>
          <span className={styles.navLogoText}>StudyWithMe</span>
        </div>
        <div className={styles.navActions}>
          <button className={styles.navLogin} onClick={() => navigate("/auth")}>
            Đăng nhập
          </button>
          <button className={styles.navRegister} onClick={() => navigate("/auth?mode=signup")}>
            Đăng ký miễn phí
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <span className={styles.heroBadge}>✨ Nền tảng học thi #1 Việt Nam</span>
          <h1 className={styles.heroTitle}>
            Chinh phục<br />
            <span className={styles.heroHighlight}>TOEIC & kỳ thi</span><br />
            dễ dàng hơn bao giờ hết
          </h1>
          <p className={styles.heroSub}>
            Hàng trăm đề thi thực chiến, kết quả tức thì, lộ trình học cá nhân hoá
            giúp bạn tự tin đạt điểm cao.
          </p>
        </div>

        <div className={styles.heroVisual}>
          <img
            src="https://aten.edu.vn/wp-content/uploads/2022/02/hinh-anh-hoc-tieng-anh-online-cho-nguoi-mat-goc-so-1-1.jpg"
            alt="Học tiếng Anh online"
            className={styles.heroImage}
          />
          <div className={styles.blob1} />
          <div className={styles.blob2} />
        </div>
      </section>


{/* ── FEATURES ── */}
      <section className={styles.featuresSection}>
        <h2 className={styles.sectionTitle}>Tất cả những gì bạn cần</h2>
        <p className={styles.sectionSub}>Từ luyện đề đến kỳ thi chính thức, chúng tôi đồng hành cùng bạn.</p>

        <div className={styles.bento}>

          {/* Card lớn — chiếm 2 hàng bên trái */}
          <div className={`${styles.bentoCard} ${styles.bentoBig} ${styles.bentoBlue}`}>
            <span className={styles.bentoIcon}>📝</span>
            <div>
              <h3>Bài thi TOEIC</h3>
              <p>Hàng trăm đề thi cập nhật theo định dạng mới nhất, kèm giải thích chi tiết từng câu hỏi giúp bạn hiểu sâu và ghi nhớ lâu.</p>
            </div>
            <span className={styles.bentoTag}>Listening · Reading</span>
          </div>

          {/* Card nhỏ — góc trên phải */}
          <div className={`${styles.bentoCard} ${styles.bentoViolet}`}>
            <span className={styles.bentoIcon}>🏆</span>
            <h3>Kỳ thi thử</h3>
            <p>Contest theo thời gian thực, bảng xếp hạng trực tiếp.</p>
            <span className={styles.bentoTag}>Live · Ranking</span>
          </div>

          {/* Card nhỏ — góc dưới phải */}
          <div className={`${styles.bentoCard} ${styles.bentoGreen}`}>
            <span className={styles.bentoIcon}>📚</span>
            <h3>Khoá học</h3>
            <p>Lộ trình từ 0 lên 900+ do giảng viên chuyên nghiệp biên soạn.</p>
            <span className={styles.bentoTag}>Video · Bài tập</span>
          </div>

          {/* Card ngang — chiếm full hàng dưới */}
          <div className={`${styles.bentoCard} ${styles.bentoWide} ${styles.bentoOrange}`}>
            <span className={styles.bentoIcon}>📊</span>
            <div className={styles.bentoWideContent}>
              <h3>Phân tích kết quả cá nhân</h3>
              <p>Biểu đồ tiến trình theo tuần, chỉ ra điểm yếu từng kỹ năng và đề xuất bài luyện phù hợp — như có gia sư riêng.</p>
            </div>
            <span className={styles.bentoTag}>AI · Analytics</span>
          </div>

        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Sẵn sàng chinh phục mục tiêu?</h2>
          <p className={styles.ctaSub}>Tạo tài khoản miễn phí và bắt đầu luyện tập ngay hôm nay.</p>
        </div>
        <div className={styles.ctaBlob} />
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <span className={styles.footerLogo}>🎓 StudyWithMe</span>
        <span className={styles.footerCopy}>© 2025 StudyWithMe. All rights reserved.</span>
      </footer>

    </div>
  );
};

export default LandingPage;

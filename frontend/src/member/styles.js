const styles = {
   container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    margin: 0,
    padding: 0,
    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
    overflow: 'hidden',
    backgroundColor: '#f8fafc', // Slate 50
  },
  header: {
    backgroundColor: '#ffffff',
    padding: '12px 40px',
    borderBottom: '1px solid #eef2f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  logo: {
    width: '42px',
    height: '42px',
    background: 'linear-gradient(135deg, #ff8a00 0%, #ff5200 100%)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '22px',
    boxShadow: '0 4px 10px rgba(255, 82, 0, 0.2)',
  },
  headerTitle: {
    fontSize: '22px',
    fontWeight: '800',
    background: 'linear-gradient(to right, #ff8a00, #ff5200)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
  },
  badge: {
  position: 'absolute',
  top: '12px',
  right: '12px',
  padding: '4px 10px',
  fontSize: '10px',
  fontWeight: '700',
  borderRadius: '999px',
  letterSpacing: '0.5px',
  },
  searchWrapper: {
    display: 'flex',
    alignItems: 'center',
    background: 'white',
    borderRadius: '999px',
    padding: '8px',
    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.06)',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(0,0,0,0.05)',
  },
 searchBar: {
  flex: 1,
  border: 'none',
  outline: 'none',
  padding: '14px 18px',
  fontSize: '15px',
  background: 'transparent',
  },
  searchButton: {
    background: 'linear-gradient(to right, #ff8a00, #ff5200)',
    color: 'white',
    border: 'none',
    padding: '12px 32px',
    borderRadius: '999px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    boxShadow: '0 8px 20px rgba(255, 100, 0, 0.25)',
  },
  // Thẻ kỹ năng
   skillCard: {
    backgroundColor: 'white',
    borderRadius: '24px',
    padding: '32px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '2px solid transparent',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  skillIcon: {
    width: '70px',
    height: '70px',
    borderRadius: '20px',
    margin: '0 auto 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 15px rgba(0,0,0,0.05)',
  },
  // Thẻ bài thi
  testCard: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '20px',
    border: '1px solid #f1f5f9',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  tag: {
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  footer: {
    backgroundColor: '#ffffff',
    borderTop: '1px solid #eef2f6',
    padding: '60px 40px 30px',
    marginTop: 'auto',
  },
  footerGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr',
    gap: '40px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  footerLogo: {
    fontSize: '24px',
    fontWeight: '800',
    background: 'linear-gradient(to right, #ff8a00, #ff5200)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '16px',
    display: 'block'
  },
  footerText: {
    color: '#64748b',
    fontSize: '14px',
    lineHeight: '1.6',
    marginBottom: '20px',
  },
  footerTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '20px',
  },
  footerLink: {
    color: '#64748b',
    fontSize: '14px',
    display: 'block',
    marginBottom: '12px',
    textDecoration: 'none',
    transition: 'color 0.2s',
    cursor: 'pointer'
  },
  // ─── EXAM PAGE ──────────────────────────────────────────────────────────────
  testExam: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#f0f4f8',
    fontFamily: "'Inter', sans-serif",
    overflow: 'hidden',
  },

  examHeader: {
    height: '56px',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    borderBottom: '1px solid #e8edf4',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    flexShrink: 0,
    gap: '12px',
  },

  examTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    marginRight: '12px',
  },

  examNav: {
    backgroundColor: '#ffffff',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    borderBottom: '1px solid #e8edf4',
    overflowX: 'auto',
    flexShrink: 0,
    minHeight: '44px',
  },

  navTab: {
    padding: '5px 14px',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    color: '#64748b',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    border: '1.5px solid #e2e8f0',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s',
    flexShrink: 0,
  },

  navTabActive: {
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    borderColor: '#93c5fd',
  },

  examContent: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    padding: '14px 16px',
    gap: '14px',
  },

  // Cột trái: nội dung câu hỏi
  examLeft: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '28px 32px',
    boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
    border: '1px solid #e8edf4',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },

  // Cột phải: timer + danh sách câu
  examRight: {
    width: '250px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    overflowY: 'auto',
  },

  // ─── NỘI DUNG CÂU HỎI ───────────────────────────────────────────────────────
  questionContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },

  questionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '14px',
    borderBottom: '2px solid #f1f5f9',
  },

  questionType: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#2563eb',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    padding: '4px 10px',
    backgroundColor: '#eff6ff',
    borderRadius: '6px',
    border: '1px solid #bfdbfe',
  },

  questionText: {
    fontSize: '15px',
    lineHeight: '1.75',
    color: '#334155',
    marginBottom: '16px',
    padding: '16px 20px',
    borderRadius: '10px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e8edf4',
  },

  examImage: {
    maxWidth: '100%',
    maxHeight: '300px',
    objectFit: 'contain',
    borderRadius: '10px',
    marginBottom: '18px',
    alignSelf: 'center',
    boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
    border: '1px solid #e8edf4',
  },

  // ─── WRITING ────────────────────────────────────────────────────────────────
  textarea: {
    width: '100%',
    minHeight: '200px',
    padding: '16px 18px',
    borderRadius: '10px',
    border: '2px solid #e2e8f0',
    fontSize: '15px',
    lineHeight: '1.7',
    fontFamily: 'inherit',
    outline: 'none',
    backgroundColor: '#fff',
    resize: 'vertical',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },

  wordCount: {
    fontSize: '12px',
    color: '#94a3b8',
    marginTop: '6px',
    textAlign: 'right',
    fontWeight: '600',
    fontVariantNumeric: 'tabular-nums',
  },

  // ─── SIDEBAR: TIMER ─────────────────────────────────────────────────────────
  timerBox: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '16px 14px',
    textAlign: 'center',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #e8edf4',
    flexShrink: 0,
  },

  timerLabel: {
    fontSize: '10px',
    color: '#94a3b8',
    marginBottom: '4px',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: '0.8px',
  },

  timerValue: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: '2px',
    fontVariantNumeric: 'tabular-nums',
  },

  // ─── SIDEBAR: DANH SÁCH CÂU ─────────────────────────────────────────────────
  questionsBox: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '16px 14px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #e8edf4',
    flex: 1,
    overflowY: 'auto',
    minHeight: 0,
  },

  questionsTitle: {
    fontSize: '11px',
    fontWeight: '700',
    marginBottom: '10px',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
  },

  questionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '5px',
  },

  questionNumber: {
    aspectRatio: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '7px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    border: '1.5px solid transparent',
  },

  questionNumberActive: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.35)',
    border: '1.5px solid #1d4ed8',
  },

  // ─── BUTTONS ────────────────────────────────────────────────────────────────
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    border: 'none',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },

  buttonPrimary: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
  },

  buttonSecondary: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1.5px solid #e2e8f0',
  },

  // ─── SPEAKING: RECORD ───────────────────────────────────────────────────────
  recordButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '11px 28px',
    width: 'fit-content',
    minWidth: '150px',
    margin: '16px auto',
    borderRadius: '50px',
    border: 'none',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  recordActive: {
    boxShadow: '0 0 0 4px rgba(220, 38, 38, 0.15), 0 4px 14px rgba(220, 38, 38, 0.35)',
  },

  // ─── SUBMIT (WRITING/SPEAKING) ───────────────────────────────────────────────
  submitBtn: {
    background: 'linear-gradient(135deg, #16a34a, #15803d)',
    color: '#fff',
    border: 'none',
    padding: '10px 22px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(22, 163, 74, 0.2)',
    position: 'relative',
  },

  submitBtnHover: {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
  },

  submitBtnActive: {
    transform: 'translateY(0)',
  },

  submitBtnDisabled: {
    background: '#cbd5e1',
    cursor: 'not-allowed',
    boxShadow: 'none',
    transform: 'none',
  },

  submitBtnLoading: {
    paddingLeft: '40px',
  },

  spinner: {
    position: 'absolute',
    left: '13px',
    top: '50%',
    width: '15px',
    height: '15px',
    border: '2.5px solid rgba(255,255,255,0.4)',
    borderTop: '2.5px solid #fff',
    borderRadius: '50%',
    transform: 'translateY(-50%)',
    animation: 'spin 0.8s linear infinite',
  },

  // ─── RESULT MODAL (SPEAKING/WRITING) ────────────────────────────────────────
  resultModalOverlay: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100vw', height: '100vh',
    background: 'rgba(15, 23, 42, 0.45)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
  },

  resultModal: {
    position: 'relative',
    width: '100%',
    maxWidth: '700px',
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
    padding: '28px 32px',
    maxHeight: '88vh',
    overflowY: 'auto',
  },

  resultHeader: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '16px',
    paddingBottom: '14px',
    borderBottom: '1px solid #f1f5f9',
  },

  resultAudio: {
    margin: '12px 0',
    padding: '12px 14px',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e8edf4',
  },

  resultAIBox: {
    background: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '10px',
    padding: '14px 16px',
    marginTop: '12px',
    fontSize: '14px',
    lineHeight: '1.75',
    color: '#0c4a6e',
  },

  resultActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px',
    paddingTop: '16px',
    borderTop: '1px solid #f1f5f9',
  },

  closeBtn: {
    position: 'absolute',
    top: '14px',
    right: '16px',
    border: 'none',
    background: '#f1f5f9',
    borderRadius: '8px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#64748b',
    fontWeight: '700',
    transition: 'all 0.15s',
  },

  // ─── EXIT EXAM CONFIRM MODAL ───────────────────────────────────────────────
  exitModalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.55)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '20px',
    animation: 'fadeIn 0.2s ease-out',
  },

  exitModal: {
    width: '100%',
    maxWidth: '420px',
    background: '#ffffff',
    borderRadius: '20px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    padding: '32px 28px 24px',
    textAlign: 'center',
    border: '1px solid #f1f5f9',
    animation: 'zoomIn 0.25s ease-out',
  },

  exitModalIconWrap: {
    width: '64px',
    height: '64px',
    margin: '0 auto 20px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
    border: '1px solid #fed7aa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  exitModalTitle: {
    margin: '0 0 10px',
    fontSize: '20px',
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 1.4,
  },

  exitModalMessage: {
    margin: '0 0 28px',
    fontSize: '14px',
    lineHeight: 1.65,
    color: '#64748b',
  },

  exitModalActions: {
    display: 'flex',
    gap: '12px',
  },

  exitModalCancelBtn: {
    flex: 1,
    padding: '12px 20px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    color: '#475569',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },

  exitModalConfirmBtn: {
    flex: 1,
    padding: '12px 20px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)',
    transition: 'all 0.15s ease',
  },

  // legacy aliases (kept for compatibility)
  aiBox: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '12px',
    padding: '20px',
    marginTop: '16px',
    color: '#166534',
    fontSize: '15px',
    lineHeight: '1.6',
  },
  primaryBtn: { backgroundColor: '#2563eb', color: '#ffffff' },
  secondaryBtn: { backgroundColor: '#f1f5f9', color: '#475569' },
  submitButton: { backgroundColor: '#10b981', color: 'white', padding: '14px 28px', borderRadius: '10px', border: 'none', fontWeight: '700', cursor: 'pointer' }

};

export default styles;
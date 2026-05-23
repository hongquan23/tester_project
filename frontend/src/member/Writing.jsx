import React from 'react';
import { 
  Search, Star, Eye, Clock, ChevronDown, BookOpen, 
  Crown, ArrowLeft, Facebook, Youtube, Mail, Phone 
} from 'lucide-react';
import { useNavigate } from "react-router-dom";

const WritingTests = ({
  user,
  styles,
  hoveredCard,
  setHoveredCard,
  writingTests = [],
  showUserMenu,
  setShowUserMenu,
  handleLogout,
  handleTestClick,
  currentUser,      
  loadingUser
}) => {
   const getUserInitials = (name) => {
    if (!name) return "U";
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };
  const navigate = useNavigate();

  // Hàm lấy chữ cái đầu của tên user cho Avatar
  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
  };

  return (
    <div 
    style={styles.container}
    className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-white"
  >
      {/* HEADER ĐỒNG BỘ CHUYÊN NGHIỆP */}
      <header style={styles.header}>
        <div className="flex items-center gap-4 cursor-pointer">
          <div style={styles.logo}><BookOpen size={22} /></div>
          <h1 style={styles.headerTitle}>LearnWithMe</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600 mr-4">
            <span className="relative cursor-pointer group text-orange-600">Khám phá
              <span className="absolute left-0 -bottom-1 h-[2px] w-full bg-orange-500"></span>
            </span>
            <span className="hover:text-orange-600 cursor-pointer transition-colors">Thư viện</span>
            <span className="hover:text-orange-600 cursor-pointer transition-colors">Lộ trình</span>
          </nav>

          <button className="relative flex items-center gap-2 px-5 py-2.5 
            bg-gradient-to-r from-orange-500 to-red-500 
            text-white rounded-full font-bold text-xs 
            shadow-md hover:shadow-xl 
            transition-all duration-300 
            hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 rounded-full blur-lg opacity-30 bg-orange-400"></div>
            <Crown size={14} className="relative text-yellow-300" />
            <span className="relative">NÂNG CẤP PRO</span>
          </button>

          <div className="relative group">
            <div 
              className="flex items-center gap-2 cursor-pointer p-1 pr-3 bg-slate-50 rounded-full hover:bg-slate-100 transition-all"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-red-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {loadingUser ? "..." : getUserInitials(currentUser?.name)}
                </div>
              <ChevronDown size={14} className="text-slate-400" />
            </div>

            {showUserMenu && (
              <div
                className="absolute right-0 mt-3 w-72
                          bg-white/95 backdrop-blur-xl
                          rounded-2xl
                          shadow-[0_20px_60px_rgba(0,0,0,0.08)]
                          border border-slate-200/60
                          z-50 overflow-hidden
                          
                          opacity-0 invisible
                          translate-y-2
                    
                          
                          group-hover:opacity-100
                          group-hover:visible
                          group-hover:translate-y-0
                          group-hover:pointer-events-auto
                          
                          transition-all duration-200"
              >

                {/* Header */}
                <div className="px-5 py-4 bg-gradient-to-br from-slate-50 to-white border-b border-slate-200/60">
                  <div
                    className="flex items-center gap-2 cursor-pointer p-1 pr-3 
                              bg-slate-50 rounded-full 
                              hover:bg-slate-100 
                              transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-full 
                                    bg-gradient-to-tr from-orange-400 to-red-500 
                                    text-white flex items-center justify-center 
                                    font-bold text-xs shadow-sm">
                      {loadingUser ? "..." : getUserInitials(currentUser?.name)}
                    </div>

                    <ChevronDown
                      size={14}
                      className="text-slate-400 transition-transform duration-200 
                                group-hover:rotate-180"
                    />
                  </div>

                  <div className="flex items-center gap-2 mt-3 text-slate-500">
                    <Mail size={13} />
                    <span className="text-xs truncate">
                      member@toeic.com
                    </span>
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-2 space-y-1">

                  <button className="group w-full text-left px-3 py-2.5 
                                    text-sm font-medium text-slate-700 
                                    hover:bg-orange-50 
                                    hover:text-orange-600 
                                    rounded-xl transition-all duration-200 
                                    flex items-center gap-3">

                    <div className="w-8 h-8 rounded-lg 
                                    bg-slate-100 
                                    flex items-center justify-center 
                                    group-hover:bg-white 
                                    group-hover:shadow-sm 
                                    transition-all">
                      👤
                    </div>

                    Hồ sơ cá nhân
                  </button>

                  <button className="group w-full text-left px-3 py-2.5 
                                    text-sm font-medium text-slate-700 
                                    hover:bg-orange-50 
                                    hover:text-orange-600 
                                    rounded-xl transition-all duration-200 
                                    flex items-center gap-3">

                    <div className="w-8 h-8 rounded-lg 
                                    bg-slate-100 
                                    flex items-center justify-center 
                                    group-hover:bg-white 
                                    group-hover:shadow-sm 
                                    transition-all">
                      📊
                    </div>

                    Lịch sử bài làm
                  </button>

                  <div className="h-px bg-slate-200 my-2 mx-2" />

                  <button
                    onClick={handleLogout}
                    className="group w-full text-left px-3 py-2.5 
                              text-sm font-semibold text-red-500 
                              hover:bg-red-50 
                              rounded-xl transition-all duration-200 
                              flex items-center gap-3">

                    <div className="w-8 h-8 rounded-lg 
                                    bg-red-100/70 
                                    flex items-center justify-center 
                                    group-hover:bg-white 
                                    transition-all">
                      🚪
                    </div>

                    Đăng xuất
                  </button>

                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="px-6 py-10 md:px-20">
          {/* NAVIGATION & TITLE */}
          <div className="mb-10">
            <button 
              onClick={() => navigate('/member/dashboard')}
              className="flex items-center gap-2 text-slate-500 hover:text-orange-600 font-semibold text-sm transition-colors mb-4"
            >
              <ArrowLeft size={18} /> Quay lại trang chủ
            </button>
            <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
              <span className="w-2 h-10 bg-orange-500 rounded-full"></span>
              Kỹ năng Writing
            </h2>
            <p className="text-slate-500 mt-2 italic text-sm">Hệ thống AI tự động chấm điểm và sửa lỗi ngữ pháp ngay lập tức.</p>
          </div>

          {/* GRID WRITING TESTS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {writingTests.map(test => (
              <div
                key={test.id}
                style={{
                  ...styles.testCard,
                  boxShadow: hoveredCard === test.id 
                    ? '0 30px 60px rgba(255,138,0,0.25)'
                    : '0 10px 25px rgba(0,0,0,0.04)',

                  borderColor: hoveredCard === test.id 
                    ? '#ff8a00'
                    : '#f1f5f9',
                }}
                onMouseEnter={() => setHoveredCard(test.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className="relative rounded-3xl border transition-all duration-300 group"
              >
                <div className="flex gap-2 mb-3">
                  <span className="flex items-center gap-1 
                text-[11px] font-semibold 
                px-3 py-1 
                bg-orange-50 text-orange-600 
                rounded-full 
                shadow-sm">#TOEIC Writing</span>
                  <span style={{ ...styles.tag, backgroundColor: '#f0fdf4', color: '#16a34a' }}>#Free</span>
                </div>
                
                <h4 className="text-lg font-bold text-slate-800 line-clamp-2 min-h-[3.5rem] leading-tight hover:text-purple-600 transition-colors cursor-pointer">
                  {test.title || test.name || "Untitled Writing Test"}
                </h4>

                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold py-2 border-y border-slate-50">
                  <span className="flex items-center gap-1"><Clock size={14} /> {test.duration || test.time_limit || 0} phút</span>
                  <span className="flex items-center gap-1"><Eye size={14} /> {test.views > 1000 ? `${(test.views/1000).toFixed(1)}k` : (test.views || 0)}</span>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="text-[11px] font-bold text-slate-500">
                    {(test.questions?.length ?? test.question_count ?? 0)} phần thi
                  </div>
                  <div className="text-[11px] text-orange-600 font-bold">AI Feedback</div>
                </div>

                <button 
                  style={{ ...styles.searchButton, background: 'linear-gradient(to right, #ff8a00, #ff5858)' }}
                  className="w-full mt-4 !py-3 shadow-lg shadow-orange-100 active:scale-95 transition-all"
                  onClick={() => handleTestClick(test)}
                >
                  Bắt đầu thi
                </button>
              </div>
            ))}

            {writingTests.length === 0 && (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">Chưa có đề Writing nào được cập nhật.</p>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER ĐỒNG BỘ */}
      <footer className="mt-0">

        {/* ===== TOP FOOTER ===== */}
        <div className="bg-gradient-to-b from-white via-slate-50 to-slate-100/70 
                        border-t border-slate-200/60">

          <div className="max-w-[1200px] mx-auto px-6 py-16 
                          grid grid-cols-1 md:grid-cols-4 gap-12">

            {/* Cột 1 */}
            <div>
              <span className="text-2xl font-bold text-orange-600">
                LearnWithMe
              </span>

              <p className="mt-4 text-slate-600 text-sm leading-relaxed">
                Nền tảng luyện thi TOEIC trực tuyến hàng đầu Việt Nam. 
                Chúng tôi giúp bạn chinh phục mục tiêu điểm số một cách 
                thông minh và hiệu quả nhất.
              </p>

              {/* Social icons */}
              <div className="flex gap-4 mt-6">
                <div className="p-2 bg-orange-50 text-orange-500 rounded-full 
                                cursor-pointer transition-all duration-300
                                hover:bg-orange-500 hover:text-white 
                                hover:scale-110 hover:shadow-md">
                  <Facebook size={18} />
                </div>

                <div className="p-2 bg-orange-50 text-orange-500 rounded-full 
                                cursor-pointer transition-all duration-300
                                hover:bg-orange-500 hover:text-white 
                                hover:scale-110 hover:shadow-md">
                  <Youtube size={18} />
                </div>

                <div className="p-2 bg-orange-50 text-orange-500 rounded-full 
                                cursor-pointer transition-all duration-300
                                hover:bg-orange-500 hover:text-white 
                                hover:scale-110 hover:shadow-md">
                  <Mail size={18} />
                </div>
              </div>
            </div>

            {/* Cột 2 */}
            <div>
              <h4 className="text-sm font-semibold text-slate-800 mb-4">
                Khám phá
              </h4>

              <div className="flex flex-col gap-3 text-sm text-slate-600">
                <span className="hover:text-orange-500 hover:translate-x-1 transition-all cursor-pointer">
                  Thư viện đề thi
                </span>
                <span className="hover:text-orange-500 hover:translate-x-1 transition-all cursor-pointer">
                  Lộ trình học
                </span>
                <span className="hover:text-orange-500 hover:translate-x-1 transition-all cursor-pointer">
                  Thi thử Online
                </span>
                <span className="hover:text-orange-500 hover:translate-x-1 transition-all cursor-pointer">
                  Bảng xếp hạng
                </span>
              </div>
            </div>

            {/* Cột 3 */}
            <div>
              <h4 className="text-sm font-semibold text-slate-800 mb-4">
                Hỗ trợ
              </h4>

              <div className="flex flex-col gap-3 text-sm text-slate-600">
                <span className="hover:text-orange-500 hover:translate-x-1 transition-all cursor-pointer">
                  Hướng dẫn sử dụng
                </span>
                <span className="hover:text-orange-500 hover:translate-x-1 transition-all cursor-pointer">
                  Chính sách bảo mật
                </span>
                <span className="hover:text-orange-500 hover:translate-x-1 transition-all cursor-pointer">
                  Điều khoản dịch vụ
                </span>
                <span className="hover:text-orange-500 hover:translate-x-1 transition-all cursor-pointer">
                  Câu hỏi thường gặp
                </span>
              </div>
            </div>

            {/* Cột 4 */}
            <div>
              <h4 className="text-sm font-semibold text-slate-800 mb-4">
                Liên hệ
              </h4>

              <div className="flex items-center gap-3 text-slate-600 mb-3 text-sm font-medium">
                <Phone size={16} className="text-orange-500" />
                0987.654.321
              </div>

              <div className="flex items-center gap-3 text-slate-600 mb-3 text-sm font-medium">
                <Mail size={16} className="text-orange-500" />
                hotro@learnwithme.com
              </div>

              <div className="mt-4 p-3 bg-white/60 backdrop-blur-sm 
                              rounded-xl border border-slate-200 
                              text-[11px] text-slate-500 shadow-sm">
                Địa chỉ: Hà Đông, Hà Nội.
              </div>
            </div>

          </div>
        </div>

        {/* ===== BOTTOM FOOTER ===== */}
        <div className="bg-white border-t border-slate-200/60">
          <div className="max-w-[1200px] mx-auto px-6 py-6 
                          flex flex-col md:flex-row 
                          justify-between items-center 
                          text-[12px] text-slate-500 font-medium">

            <p>© 2026 LearnWithMe. Tất cả quyền được bảo lưu.</p>

            <div className="flex gap-6 mt-4 md:mt-0">
              <span className="hover:text-orange-500 transition-colors cursor-pointer">
                English (US)
              </span>
              <span className="hover:text-orange-500 transition-colors cursor-pointer">
                Tiếng Việt
              </span>
            </div>

          </div>
        </div>

      </footer>
      </main>
    </div>
  );
};

export default WritingTests;
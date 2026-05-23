import React from 'react';
import { 
  Search, Star, Eye, Clock, ChevronDown, BookOpen, 
  BarChart3, Plus, Pencil, Trash2, Users as UsersIcon, 
  Facebook, Youtube, Mail, Phone, Settings, Bell, LayoutDashboard, ShieldCheck
} from 'lucide-react';
import Users from './Users';
import { useNavigate } from 'react-router-dom';
import { deleteSection, updateSection } from '../api';

const AdminDashboard = ({
  activeView, styles, skills, searchQuery, setSearchQuery, showUserMenu,
  setShowUserMenu, handleSkillClick, handleLogout, hoveredSkill,
  setHoveredSkill, hoveredCard, setHoveredCard, allTests, handleTestClick,
  setShowUploadModal, setActiveView, mockUsers, navigate, currentUser,      
  loadingUser, fetchAllTests  // Thêm fetchAllTests để refresh lại danh sách
}) => {
  const getUserInitials = (name) => {
    if (!name) return "U";
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    const element = document.getElementById("test-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Hàm xóa section
  const handleDeleteSection = async (sectionId, sectionTitle) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa đề thi "${sectionTitle}"?`)) {
      try {
        await deleteSection(sectionId);
        alert('Xóa đề thi thành công!');
        
        // Refresh lại danh sách đề thi
        if (fetchAllTests) {
          await fetchAllTests();
        }
      } catch (err) {
        console.error('Error deleting section:', err);
        alert('Không thể xóa đề thi! Vui lòng thử lại.');
      }
    }
  };

  // State sửa thời gian: { sectionId, value }
  const [editingTime, setEditingTime] = React.useState(null);

  const handleSaveTime = async (test) => {
    const newTime = Number(editingTime.value);
    if (!newTime || newTime <= 0) {
      alert('Thời gian phải là số nguyên dương (phút)!');
      return;
    }
    try {
      await updateSection(test.section_id, { time_limit: newTime });
      setEditingTime(null);
      if (fetchAllTests) await fetchAllTests();
    } catch (err) {
      console.error(err);
      alert('Cập nhật thất bại!');
    }
  };

  const filteredTests = allTests?.filter(test => {
    if (!searchQuery.trim()) return true;

    const keyword = searchQuery.toLowerCase();

    return (
      test.title?.toLowerCase().includes(keyword) ||
      test.name?.toLowerCase().includes(keyword) ||
      test.id?.toString().includes(keyword) ||
      test.skill?.toLowerCase().includes(keyword)
    );
  });

  return (
    <div style={styles.container}>
      {/* HEADER - ADMIN STYLE */}
      <header style={styles.header}>
        <div 
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => {
            setActiveView('dashboard');
            navigate('/admin/dashboard');
          }}
        >
          <div 
            className="w-10 h-10 rounded-xl 
                      bg-gradient-to-tr from-indigo-500 to-indigo-700 
                      flex items-center justify-center shadow-md">
            <ShieldCheck size={20} className="text-white" />
          </div>

          <div className="flex flex-col leading-tight">
            <h1 style={styles.headerTitle}>LearnWithMe</h1>
            <span className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase">
              Admin Panel
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">

          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600 mr-4">

            {/* TAB TỔNG QUAN */}
            <span 
              onClick={() => {
                setActiveView('dashboard');
                navigate('/admin/dashboard');
              }}
              className={`relative cursor-pointer group ${
                activeView === 'dashboard' ? 'text-indigo-600' : 'hover:text-indigo-600'
              }`}
            >
              Tổng quan
              {activeView === 'dashboard' && (
                <span className="absolute left-0 -bottom-1 h-[2px] w-full bg-indigo-500"></span>
              )}
            </span>

            {/* TAB NGƯỜI DÙNG */}
            <span 
              onClick={() => {
                setActiveView('users');
                navigate('/admin/users');
              }}
              className={`relative cursor-pointer group ${
                activeView === 'users' ? 'text-indigo-600' : 'hover:text-indigo-600'
              }`}
            >
              Người dùng
              {activeView === 'users' && (
                <span className="absolute left-0 -bottom-1 h-[2px] w-full bg-indigo-500"></span>
              )}
            </span>

            {/* TAB BÁO CÁO */}
            <span className="hover:text-indigo-600 cursor-pointer transition-colors">
              Báo cáo
            </span>

          </nav>

          {/* BUTTON ĐĂNG ĐỀ THI (Glow giống PRO button) */}
          <button
            onClick={() => setShowUploadModal(true)}
            className="relative flex items-center gap-2 px-5 py-2.5
                      bg-gradient-to-r from-indigo-600 to-indigo-500
                      text-white rounded-full font-bold text-xs
                      shadow-md hover:shadow-xl
                      transition-all duration-300
                      hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 rounded-full blur-lg opacity-30 bg-indigo-400"></div>
            <Plus size={14} className="relative" />
            <span className="relative">ĐĂNG ĐỀ THI</span>
          </button>

          {/* USER DROPDOWN */}
          <div className="relative group">

            <div
              className="flex items-center gap-2 cursor-pointer p-1 pr-3 
                        bg-slate-50 rounded-full hover:bg-slate-100 transition-all"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="w-8 h-8 rounded-full 
                              bg-gradient-to-tr from-indigo-500 to-indigo-700 
                              text-white flex items-center justify-center 
                              font-bold text-xs shadow-sm">
                {loadingUser ? "..." : getUserInitials(currentUser?.name)}
              </div>
              <span className="text-sm font-semibold text-slate-700 hidden md:block">
                  {loadingUser ? "Loading..." : (currentUser?.name || "Admin")}
              </span>
              <ChevronDown 
                size={14} 
                className="text-slate-400 transition-transform duration-200 group-hover:rotate-180" 
              />
            </div>

            {showUserMenu && (
              <div
                className="absolute right-0 mt-3 w-72
                          bg-white/95 backdrop-blur-xl
                          rounded-2xl
                          shadow-[0_20px_60px_rgba(0,0,0,0.08)]
                          border border-slate-200/60
                          z-50 overflow-hidden
                          opacity-0 invisible translate-y-2
                          group-hover:opacity-100
                          group-hover:visible
                          group-hover:translate-y-0
                          transition-all duration-200"
              >
                {/* Header */}
                <div className="px-5 py-4 bg-gradient-to-br from-slate-50 to-white border-b border-slate-200/60">

                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full 
                                    bg-gradient-to-tr from-indigo-500 to-indigo-700 
                                    text-white flex items-center justify-center 
                                    font-bold text-sm shadow-sm">
                      {loadingUser ? "..." : getUserInitials(currentUser?.name)}
                    </div>

                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-sm">
                        {loadingUser ? "Loading..." : (currentUser?.email || "No email")}
                      </span>
                      <span className="text-[11px] text-indigo-600 font-medium">
                        Hệ thống quản trị
                      </span>
                    </div>
                  </div>

                </div>

                {/* Menu */}
                <div className="p-2 space-y-1">

                  <button className="group w-full text-left px-3 py-2.5
                                    text-sm font-medium text-slate-700
                                    hover:bg-indigo-50
                                    hover:text-indigo-600
                                    rounded-xl transition-all duration-200
                                    flex items-center gap-3">
                    <Settings size={16} />
                    Cài đặt hệ thống
                  </button>

                  <button className="group w-full text-left px-3 py-2.5
                                    text-sm font-medium text-slate-700
                                    hover:bg-indigo-50
                                    hover:text-indigo-600
                                    rounded-xl transition-all duration-200
                                    flex items-center gap-3">
                    <Bell size={16} />
                    Thông báo
                  </button>

                  <div className="h-px bg-slate-200 my-2 mx-2" />

                  <button
                    onClick={handleLogout}
                    className="group w-full text-left px-3 py-2.5
                              text-sm font-semibold text-red-500
                              hover:bg-red-50
                              rounded-xl transition-all duration-200
                              flex items-center gap-3"
                  >
                    🚪 Đăng xuất
                  </button>

                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto px-6 py-10 md:px-20 bg-[#f8fafc]">
        
        {activeView === 'users' ? (
          <Users styles={styles} />
        ) : (
          <>
        {/* HERO SECTION ADMIN */}
        <div className="relative py-0 md:py-5 overflow-hidden">

          {/* Background Glow */}
          <div className="absolute inset-0 flex justify-center">
            <div className="w-[500px] h-[300px] bg-indigo-200/30 blur-[120px] rounded-full"></div>
          </div>

          <div className="relative text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 
                            rounded-full bg-indigo-50 
                            text-indigo-600 text-[10px] font-bold mb-4">
              <BarChart3 size={12}/> HỆ THỐNG QUẢN TRỊ NỘI DUNG v2.0
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight">
              Quản lý kho <span className="text-indigo-600">dữ liệu</span> đề thi
            </h2>

            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Theo dõi hiệu suất bài thi, cập nhật câu hỏi và quản lý tài khoản thành viên.
            </p>
          </div>
        </div>
        {/* SEARCH BAR ADMIN */}
        <div className="max-w-3xl mx-auto mb-20">

          <div className="relative flex items-center 
                          bg-white rounded-full 
                          shadow-[0_15px_40px_rgba(0,0,0,0.06)]
                          border border-slate-200/60
                          focus-within:ring-4 focus-within:ring-indigo-100
                          focus-within:shadow-[0_20px_50px_rgba(79,70,229,0.15)]
                          focus-within:border-indigo-300
                          transition-all duration-300">

            <Search size={20} 
                    className="ml-6 text-slate-400 
                              transition-colors duration-300 
                              focus-within:text-indigo-600" />

            <input
              type="text"
              placeholder="Tìm mã đề, tên đề thi hoặc email thành viên..."
              className="flex-1 px-4 py-4 outline-none 
                        text-slate-700 bg-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />

            <button
              onClick={handleSearch}
              className="relative mr-2 px-6 py-3
                        bg-gradient-to-r from-indigo-600 to-indigo-500
                        text-white font-bold text-xs
                        rounded-full
                        shadow-md hover:shadow-xl
                        transition-all duration-300
                        hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 rounded-full blur-lg opacity-30 bg-indigo-400"></div>
              <span className="relative">🔍 Tìm kiếm</span>
            </button>
            
          </div>
        </div>

        {/* SKILLS SECTION - ADMIN */}
        <div className="mb-20" id="test-section">

          <h3 className="text-2xl font-extrabold text-slate-800 mb-8 flex items-center gap-3">
            <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
            Danh mục Kỹ năng
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

            {skills?.map(skill => (

              <div
                key={skill.id}
                className={`relative bg-white rounded-2xl p-6 border text-center
                            transition-all duration-300
                            ${skill.disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                style={{
                  boxShadow: hoveredSkill === skill.id
                    ? '0 20px 40px rgba(79, 70, 229, 0.12)'
                    : '0 8px 20px rgba(0,0,0,0.04)',
                  transform: hoveredSkill === skill.id ? 'translateY(-8px)' : 'none',
                  borderColor: hoveredSkill === skill.id ? '#4f46e5' : '#f1f5f9'
                }}
                onMouseEnter={() => !skill.disabled && setHoveredSkill(skill.id)}
                onMouseLeave={() => setHoveredSkill(null)}
                onClick={() => handleSkillClick(skill)}
              >

                {/* Disabled Overlay */}
                {skill.disabled && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-2xl flex items-center justify-center pointer-events-none">
                    <div className="text-sm font-semibold text-indigo-600 bg-white px-4 py-2 rounded-full shadow-md border border-indigo-200">
                      🚀 Sắp mở rộng
                    </div>
                  </div>
                )}

                {/* ICON WRAPPER */}
                <div
                  className="relative flex items-center justify-center 
                            w-20 h-20 mx-auto mb-5
                            rounded-2xl transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${skill.color}25, ${skill.color}10)`
                  }}
                >

                  {/* Glow */}
                  <div
                    className="absolute inset-0 rounded-2xl blur-2xl opacity-30"
                    style={{ background: skill.color }}
                  />

                  {/* Icon */}
                  <span
                    className="relative flex items-center justify-center
                              text-4xl leading-none transition-all duration-300"
                    style={{
                      color: skill.color,
                      transform: hoveredSkill === skill.id ? 'scale(1.12)' : 'scale(1)'
                    }}
                  >
                    {skill.icon}
                  </span>
                </div>

                {/* TEXT */}
                <div className="text-xl font-black text-slate-800 mb-2">
                  {skill.name}
                </div>

                <div className="text-slate-400 font-medium">
                  {skill.count} bộ đề hiện có
                </div>

              </div>

            ))}

          </div>
        </div>

        {/* ADMIN TEST LIST */}
        <div className="mb-20">
          <div className="flex justify-between items-end mb-8">
            <h3 className="text-2xl font-extrabold text-slate-800 flex items-center gap-3">
              <Star size={24} className="text-indigo-500 fill-indigo-500" />
              Đề thi vừa đăng
            </h3>

            <span className="text-indigo-600 font-bold text-sm cursor-pointer hover:underline">
              Quản lý kho đề →
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredTests?.map(test => (
              <div
                key={test.id}
                className="group relative bg-white rounded-2xl border transition-all duration-300 cursor-pointer"
                style={{
                  borderColor: hoveredCard === test.id ? '#4f46e5' : '#f1f5f9',
                  boxShadow:
                    hoveredCard === test.id
                      ? '0 25px 50px rgba(79,70,229,0.12)'
                      : '0 8px 20px rgba(0,0,0,0.04)',
                  transform: hoveredCard === test.id ? 'scale(1.02)' : 'scale(1)'
                }}
                onMouseEnter={() => setHoveredCard(test.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >

                {/* BADGE ID */}
                <div className="absolute -top-3 right-4 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md">
                  ID: {test.id}
                </div>

                <div className="p-5 space-y-3">

                  {/* TAGS */}
                  <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600">
                      #{test.type}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-600">
                      #{test.skill}
                    </span>
                  </div>

                  {/* TITLE */}
                  <h4 className="text-lg font-bold text-slate-800 line-clamp-2 min-h-[3.5rem] leading-tight 
                                group-hover:text-indigo-600 transition-colors">
                    {test.title || test.name}
                  </h4>

                  {/* META — thời gian (có thể sửa) */}
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold py-2 border-y border-slate-100">
                    {editingTime?.sectionId === test.section_id ? (
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <Clock size={14} />
                        <input
                          type="number"
                          min="1"
                          value={editingTime.value}
                          onChange={e => setEditingTime({ ...editingTime, value: e.target.value })}
                          className="w-16 border border-indigo-400 rounded px-1 py-0.5 text-xs text-slate-700 outline-none"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleSaveTime(test);
                            if (e.key === 'Escape') setEditingTime(null);
                          }}
                        />
                        <span className="text-slate-400">phút</span>
                        <button
                          onClick={() => handleSaveTime(test)}
                          className="text-emerald-600 font-bold hover:text-emerald-700 text-xs"
                        >✓</button>
                        <button
                          onClick={() => setEditingTime(null)}
                          className="text-red-400 font-bold hover:text-red-600 text-xs"
                        >✕</button>
                      </div>
                    ) : (
                      <span
                        className="flex items-center gap-1 cursor-pointer group/time hover:text-indigo-600 transition-colors"
                        title="Click để sửa thời gian"
                        onClick={e => {
                          e.stopPropagation();
                          setEditingTime({ sectionId: test.section_id, value: test.duration });
                        }}
                      >
                        <Clock size={14} />
                        {test.duration} phút
                        <Pencil size={10} className="opacity-0 group-hover/time:opacity-100 transition-opacity text-indigo-400" />
                      </span>
                    )}
                  </div>

                  {/* QUESTION COUNT */}
                  <div className="text-[11px] font-semibold text-slate-500">
                    {(test.questions?.length ?? test.question_count ?? 0)} câu hỏi
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex gap-2 mt-3">

                    <button
                      className="flex-1 py-2 rounded-xl text-sm font-semibold text-white
                                bg-gradient-to-r from-indigo-500 to-indigo-600
                                shadow-lg shadow-indigo-200
                                hover:brightness-110
                                transition-all duration-300 active:scale-95"
                      onClick={() => handleTestClick(test)}
                    >
                      Xem đề
                    </button>

                    <button
                      className="p-2 rounded-xl bg-red-50 text-red-600
                                hover:bg-red-100 transition-all duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        
                        console.log('🔍 Test object:', test);
                        console.log('🔍 section_id:', test.section_id);
                        
                        // SỬ DỤNG section_id
                        handleDeleteSection(test.section_id, test.title || test.name);
                      }}
                      title="Xóa đề thi"
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
          </>
        )}

        {/* --- FOOTER SECTION - ADMIN --- */}
        <footer className="mt-20">

          {/* ===== TOP FOOTER ===== */}
          <div className="bg-gradient-to-b from-white via-indigo-50/40 to-indigo-100/40 
                          border-t border-indigo-200/60">

            <div className="max-w-[1200px] mx-auto px-6 py-16 
                            grid grid-cols-1 md:grid-cols-4 gap-12">

              {/* Cột 1 */}
              <div>
                <span className="text-2xl font-bold text-indigo-600">
                  LearnWithMe Admin
                </span>

                <p className="mt-4 text-slate-600 text-sm leading-relaxed">
                  Dành cho Quản trị viên. Hệ thống quản lý học liệu và người dùng tập trung. 
                  Hãy đảm bảo bảo mật thông tin tài khoản admin và phân quyền hợp lý.
                </p>

                {/* Social icons */}
                <div className="flex gap-4 mt-6">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-full 
                                  cursor-pointer transition-all duration-300
                                  hover:bg-indigo-600 hover:text-white 
                                  hover:scale-110 hover:shadow-md">
                    <Facebook size={18} />
                  </div>

                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-full 
                                  cursor-pointer transition-all duration-300
                                  hover:bg-indigo-600 hover:text-white 
                                  hover:scale-110 hover:shadow-md">
                    <Youtube size={18} />
                  </div>

                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-full 
                                  cursor-pointer transition-all duration-300
                                  hover:bg-indigo-600 hover:text-white 
                                  hover:scale-110 hover:shadow-md">
                    <Mail size={18} />
                  </div>
                </div>
              </div>

              {/* Cột 2 */}
              <div>
                <h4 className="text-sm font-semibold text-slate-800 mb-4">
                  Quản trị hệ thống
                </h4>

                <div className="flex flex-col gap-3 text-sm text-slate-600">
                  <span className="hover:text-indigo-600 hover:translate-x-1 transition-all cursor-pointer">
                    Báo cáo lượt thi
                  </span>
                  <span className="hover:text-indigo-600 hover:translate-x-1 transition-all cursor-pointer">
                    Quản lý kho đề
                  </span>
                  <span className="hover:text-indigo-600 hover:translate-x-1 transition-all cursor-pointer">
                    Duyệt bài viết
                  </span>
                  <span className="hover:text-indigo-600 hover:translate-x-1 transition-all cursor-pointer">
                    Logs hệ thống
                  </span>
                </div>
              </div>

              {/* Cột 3 */}
              <div>
                <h4 className="text-sm font-semibold text-slate-800 mb-4">
                  Công cụ Admin
                </h4>

                <div className="flex flex-col gap-3 text-sm text-slate-600">
                  <span className="hover:text-indigo-600 hover:translate-x-1 transition-all cursor-pointer">
                    Import từ Excel
                  </span>
                  <span className="hover:text-indigo-600 hover:translate-x-1 transition-all cursor-pointer">
                    AI Tool Generator
                  </span>
                  <span className="hover:text-indigo-600 hover:translate-x-1 transition-all cursor-pointer">
                    Cài đặt API
                  </span>
                  <span className="hover:text-indigo-600 hover:translate-x-1 transition-all cursor-pointer">
                    Quản lý Banner
                  </span>
                </div>
              </div>

              {/* Cột 4 */}
              <div>
                <h4 className="text-sm font-semibold text-slate-800 mb-4">
                  Kỹ thuật
                </h4>

                <div className="flex items-center gap-3 text-slate-600 mb-3 text-sm font-medium">
                  <Mail size={16} className="text-indigo-500" />
                  tech@learnwithme.com
                </div>

                <div className="mt-4 p-3 bg-white/70 backdrop-blur-sm 
                                rounded-xl border border-indigo-200/60 
                                text-[11px] text-slate-500 shadow-sm">
                  Phiên bản quản trị: 2.0.1 (Stable) <br />
                  Server: Asia-Southeast-1
                </div>
              </div>

            </div>
          </div>

          {/* ===== BOTTOM FOOTER ===== */}
          <div className="bg-white border-t border-indigo-200/60">
            <div className="max-w-[1200px] mx-auto px-6 py-6 
                            flex flex-col md:flex-row 
                            justify-between items-center 
                            text-[12px] text-slate-500 font-medium">

              <p>© 2026 LearnWithMe Admin. Tất cả quyền được bảo lưu.</p>

              <div className="flex gap-6 mt-4 md:mt-0">
                <span className="hover:text-indigo-600 transition-colors cursor-pointer">
                  Hệ thống bảo mật nội bộ
                </span>
                <span className="hover:text-indigo-600 transition-colors cursor-pointer">
                  Admin Guidelines
                </span>
              </div>

            </div>
          </div>

        </footer>
      </main>
    </div>
  );
};

export default AdminDashboard;
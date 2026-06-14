import React, { useState } from 'react';
import { Search, Clock, ChevronDown, BookOpen, Crown, TrendingUp, Facebook, Youtube, Mail, Phone, AlertTriangle, Zap, ChevronRight, Target } from 'lucide-react';
import Profile from './Profile';
import ContestPage from './ContestPage';
import Course from './Course';

const SKILL_META = {
  listening: { icon: '🎧', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', label: 'Listening' },
  reading:   { icon: '📖', color: '#10b981', bg: '#f0fdf4', border: '#a7f3d0', label: 'Reading' },
  writing:   { icon: '✍️', color: '#8b5cf6', bg: '#faf5ff', border: '#e9d5ff', label: 'Writing' },
  speaking:  { icon: '🎤', color: '#f97316', bg: '#fff7ed', border: '#fed7aa', label: 'Speaking' },
};

const LEVEL_META = {
  weak: { text: 'Yếu',       bg: '#fef2f2', border: '#fecaca', bar: '#ef4444', badge: 'bg-red-100 text-red-600' },
  fair: { text: 'Cần cải thiện', bg: '#fffbeb', border: '#fde68a', bar: '#f59e0b', badge: 'bg-amber-100 text-amber-600' },
};

const WeakAreaCard = ({ area, onClick }) => {
  const skill  = SKILL_META[area.skill] || SKILL_META.listening;
  const level  = LEVEL_META[area.level] || LEVEL_META.fair;
  const pct    = Math.round(area.accuracy * 100);

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-2xl border p-4 transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-95"
      style={{ background: level.bg, borderColor: level.border }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{skill.icon}</span>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${level.badge}`}>
          {level.text}
        </span>
      </div>
      <div className="font-bold text-slate-800 text-sm mb-1">{area.part_label}</div>
      <div className="text-xs text-slate-500 mb-3">
        {area.correct}/{area.total_attempts} câu đúng
      </div>
      <div className="w-full bg-slate-200 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: level.bar }}
        />
      </div>
      <div className="text-right text-xs font-bold mt-1" style={{ color: level.bar }}>
        {pct}%
      </div>
    </div>
  );
};

const Dashboard = ({
  styles, skills, searchQuery, setSearchQuery, showUserMenu,
  setShowUserMenu, handleSkillClick, handleLogout, hoveredSkill,
  setHoveredSkill, hoveredCard, setHoveredCard, allTests, handleTestClick, currentUser,
  loadingUser, handleProfileClick, handleContestClick, handleCourseClick, handleHistoryClick,
  handleFlashcardClick, weakAreas,
}) => {
  const [recHovered, setRecHovered] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const getUserInitials = (name) => {
    if (!name) return "User";
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };
  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    const section = document.getElementById("member-tests");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const sortedTests = [...(allTests || [])].sort(
    (a, b) => (b.attempt_count || 0) - (a.attempt_count || 0)
  );

  const filteredTests = searchQuery.trim()
    ? sortedTests.filter(test => {
        const keyword = searchQuery.toLowerCase();
        return (
          test.title?.toLowerCase().includes(keyword) ||
          test.name?.toLowerCase().includes(keyword) ||
          test.skill?.toLowerCase().includes(keyword) ||
          test.type?.toLowerCase().includes(keyword)
        );
      })
    : (showAll ? sortedTests : sortedTests.slice(0, 8));

  const maxAttempts = sortedTests[0]?.attempt_count || 0;
  const hotThreshold = maxAttempts >= 3 ? Math.max(3, Math.floor(maxAttempts * 0.5)) : Infinity;

  return (
    <div style={styles.container}>
      {/* HEADER - MEMBER*/}
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
           <span
            onClick={handleContestClick}
            className="hover:text-orange-600 cursor-pointer transition-colors"
           >
            Các cuộc thi
          </span>
            <span
              onClick={handleCourseClick}
              className="hover:text-orange-600 cursor-pointer transition-colors"
            >
              Các khóa học
            </span>
            <span
              onClick={handleFlashcardClick}
              className="hover:text-orange-600 cursor-pointer transition-colors"
            >
              Flashcard
            </span>
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
              
              {/* ⭐ THÊM TÊN */}
              <span className="text-sm font-semibold text-slate-700 hidden md:block">
                {loadingUser ? "Loading..." : (currentUser?.name || "User")}
              </span>
              
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
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full 
                                    bg-gradient-to-tr from-orange-400 to-red-500 
                                    text-white flex items-center justify-center 
                                    font-bold text-base shadow-sm">
                      {loadingUser ? "..." : getUserInitials(currentUser?.name)}
                    </div>

                    {/* Thông tin User */}
                    <div className="flex-1 min-w-0">
                      {/* Email */}
                      <div className="flex items-center gap-1.5 text-slate-600 text-sm font-medium truncate">
                        <Mail size={13} />
                        {loadingUser ? "Loading..." : (currentUser?.email || "No email")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-2 space-y-1">

                  <button 
                  onClick={handleProfileClick}
                  className="group w-full text-left px-3 py-2.5 
                                    text-sm font-medium text-slate-700 
                                    hover:bg-orange-50 
                                    hover:text-orange-600 
                                    rounded-xl transition-all duration-200 
                                    flex items-center gap-3">

                   

                    Hồ sơ cá nhân
                  </button>

                  <button
                    onClick={handleHistoryClick}
                    className="group w-full text-left px-3 py-2.5
                                    text-sm font-medium text-slate-700
                                    hover:bg-orange-50
                                    hover:text-orange-600
                                    rounded-xl transition-all duration-200
                                    flex items-center gap-3">

                    Lịch sử bài làm
                  </button>

                  <button
                    onClick={handleFlashcardClick}
                    className="group w-full text-left px-3 py-2.5
                                    text-sm font-medium text-slate-700
                                    hover:bg-orange-50
                                    hover:text-orange-600
                                    rounded-xl transition-all duration-200
                                    flex items-center gap-3">
                    Flashcard
                  </button>

                  <div className="h-px bg-slate-200 my-2 mx-2" />

                  <button
                    onClick={handleLogout}
                    className="group w-full text-left px-3 py-2.5 
                              text-sm font-semibold text-red-500 
                              hover:bg-red-50 
                              rounded-xl transition-all duration-200 
                              flex items-center gap-3">

                   

                    Đăng xuất
                  </button>

                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto px-6 py-10 md:px-20">
        {/* HERO SECTION MEMBER */}
        <div className="relative py-0 md:py-5 overflow-hidden">
          
          {/* Background Glow */}
          <div className="absolute inset-0 flex justify-center">
            <div className="w-[500px] h-[300px] bg-orange-200/30 blur-[120px] rounded-full"></div>
          </div>

          <div className="relative text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-[10px] font-bold mb-4">
              <TrendingUp size={12}/> #1 NỀN TẢNG LUYỆN THI TOEIC 2026
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight">
              Chinh phục <span className="text-orange-500">TOEIC®</span> Thông Minh
            </h2>

            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Đề thi được biên soạn theo cấu trúc mới nhất, tích hợp AI chấm điểm Speaking & Writing.
            </p>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="max-w-3xl mx-auto mb-10">
          <div style={styles.searchWrapper} className="focus-within:ring-4 focus-within:ring-orange-100 transition-all">
            <Search  size={20} className="ml-5 text-slate-400 transition-colors duration-300" />
              <input
                type="text"
                placeholder="Nhập tên đề thi, kỹ năng hoặc từ khóa..."
                style={styles.searchBar}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                onFocus={(e) => {
                  e.target.previousSibling.style.color = '#ff6a00';
                  e.target.parentElement.style.boxShadow =
                    '0 20px 50px rgba(255, 120, 0, 0.15)';
                  e.target.parentElement.style.border =
                    '1px solid rgba(255, 140, 0, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.previousSibling.style.color = '#94a3b8';
                  e.target.parentElement.style.boxShadow =
                    '0 15px 40px rgba(0, 0, 0, 0.06)';
                  e.target.parentElement.style.border =
                    '1px solid rgba(0,0,0,0.05)';
                }}
              />
            <button
              style={{
                ...styles.searchButton,
              }}
              onClick={handleSearch}
              onMouseEnter={(e) => {
                e.target.style.boxShadow = '0 10px 25px rgba(255, 100, 0, 0.4)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = '0 8px 20px rgba(255, 100, 0, 0.25)';
                e.target.style.transform = 'translateY(0)';
              }}
              className="active:scale-95"
            >
              Tìm kiếm
            </button>
          </div>
        </div>

        {/* ── GỢI Ý CÁ NHÂN HÓA ── */}
        {weakAreas && weakAreas.total_mcq_attempts >= 3 && (
          <div className="mb-16">
            {weakAreas.weak_areas.length === 0 ? (
              <div className="flex items-center gap-4 p-5 bg-green-50 border border-green-200 rounded-2xl">
                <span className="text-3xl">🎉</span>
                <div>
                  <div className="font-bold text-green-800 text-base">Bạn đang làm rất tốt!</div>
                  <div className="text-green-600 text-sm mt-0.5">
                    Tất cả các phần đều trên {60}% — tiếp tục duy trì nhé.
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Tiêu đề */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-extrabold text-slate-800 flex items-center gap-3">
                    <span className="w-2 h-8 bg-red-500 rounded-full"></span>
                    Phần cần ôn tập của bạn
                    <span className="text-sm font-semibold text-slate-400">
                      (dựa trên {weakAreas.total_mcq_attempts} lần làm)
                    </span>
                  </h3>
                  <button
                    onClick={handleHistoryClick}
                    className="text-sm text-orange-500 font-semibold hover:underline flex items-center gap-1"
                  >
                    Xem lịch sử <ChevronRight size={14} />
                  </button>
                </div>

                {/* Weak area cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
                  {weakAreas.weak_areas.map((area, i) => (
                    <WeakAreaCard
                      key={i}
                      area={area}
                      onClick={() => handleSkillClick(skills.find(s => s.id === area.skill) || skills[0])}
                    />
                  ))}

                  {/* Tổng quan accuracy các skill */}
                  {Object.entries(weakAreas.skill_accuracy || {}).map(([skill, stat]) => {
                    const isWeak = weakAreas.weak_areas.some(w => w.skill === skill);
                    if (isWeak) return null;
                    const meta = SKILL_META[skill];
                    if (!meta) return null;
                    return (
                      <div
                        key={skill}
                        className="rounded-2xl border p-4 bg-slate-50 border-slate-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-2xl">{meta.icon}</span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                            Tốt
                          </span>
                        </div>
                        <div className="font-bold text-slate-800 text-sm mb-1">{meta.label}</div>
                        <div className="text-xs text-slate-500 mb-3">
                          {stat.correct}/{stat.total} câu đúng
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-green-500"
                            style={{ width: `${Math.round(stat.accuracy * 100)}%` }}
                          />
                        </div>
                        <div className="text-right text-xs font-bold mt-1 text-green-600">
                          {Math.round(stat.accuracy * 100)}%
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Đề thi gợi ý */}
                {(() => {
                  const weakSkills = new Set(weakAreas.weak_areas.map(w => w.skill));
                  const suggested = allTests.filter(t => weakSkills.has(t.skill?.toLowerCase())).slice(0, 4);
                  if (!suggested.length) return null;
                  return (
                    <div>
                      <h4 className="text-lg font-extrabold text-slate-700 mb-4 flex items-center gap-2">
                        <Target size={18} className="text-orange-500" />
                        Đề thi gợi ý cho bạn
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {suggested.map(test => {
                          return (
                            <div
                              key={test.id}
                              className="group bg-white rounded-2xl border transition-all duration-300 cursor-pointer"
                              style={{
                                borderColor: recHovered === test.id ? '#ff8a00' : '#f1f5f9',
                                boxShadow: recHovered === test.id ? '0 25px 50px rgba(0,0,0,0.12)' : '0 8px 20px rgba(0,0,0,0.04)',
                                transform: recHovered === test.id ? 'scale(1.02)' : 'scale(1)',
                              }}
                              onMouseEnter={() => setRecHovered(test.id)}
                              onMouseLeave={() => setRecHovered(null)}
                            >
                              <div className="p-5 space-y-3 relative">
                                <div className="flex gap-2">
                                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-600">
                                    {test.skill}
                                  </span>
                                  <span className="ml-auto text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Zap size={10} /> Gợi ý
                                  </span>
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 line-clamp-2 min-h-[3.5rem] leading-tight group-hover:text-orange-600 transition-colors">
                                  {test.title || test.name}
                                </h4>
                                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold py-2 border-y border-slate-100">
                                  <span className="flex items-center gap-1">
                                    <Clock size={14} /> {test.duration} phút
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="text-[11px] font-semibold text-slate-600">
                                    {(test.questions?.length ?? test.question_count ?? 0)} câu hỏi
                                  </div>
                                </div>
                                <button
                                  className="w-full mt-3 py-3 rounded-xl font-semibold text-sm text-white
                                            bg-gradient-to-r from-orange-500 to-orange-600
                                            shadow-lg shadow-orange-200
                                            group-hover:shadow-orange-300
                                            group-hover:brightness-110
                                            transition-all duration-300
                                            active:scale-95
                                            flex items-center justify-center gap-2"
                                  onClick={() => handleTestClick(test)}
                                >
                                  Làm bài ngay
                                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        )}

        {/* SKILLS SECTION - MEMBER */}
        <div className="mb-20">
          <h3 className="text-2xl font-extrabold text-slate-800 mb-8 flex items-center gap-3">
            <span className="w-2 h-8 bg-orange-500 rounded-full"></span> 4 Kỹ Năng Chính
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {skills.map(skill => (
              <div
                key={skill.id}
                style={{
                  ...styles.skillCard,
                  boxShadow: hoveredSkill === skill.id 
                    ? '0 20px 40px rgba(0,0,0,0.08)' 
                    : '0 8px 20px rgba(0,0,0,0.04)',
                  transform: hoveredSkill === skill.id ? 'translateY(-8px)' : 'none',
                  borderColor: hoveredSkill === skill.id ? '#ff5200' : '#f1f5f9'
                }}
                onMouseEnter={() => !skill.disabled && setHoveredSkill(skill.id)}
                onMouseLeave={() => setHoveredSkill(null)}
                onClick={() => handleSkillClick(skill)}
                className={skill.disabled ? 'cursor-not-allowed relative' : ''}
                >
                {skill.disabled && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-2xl flex items-center justify-center pointer-events-none">
                    <div className="text-sm font-semibold text-orange-600 bg-white px-4 py-2 rounded-full shadow-md border border-orange-200">
                      🚀 Sắp ra mắt
                    </div>
                  </div>
                )}
                <div
                  className="relative flex items-center justify-center w-20 h-20 rounded-2xl mb-5 transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${skill.color}25, ${skill.color}10)`,
                  }}
                >
                  {/* Glow */}
                  <div
                    className="absolute inset-0 rounded-2xl blur-2xl opacity-30"
                    style={{ background: skill.color }}
                  />

                  {/* Icon */}
                  <span
                    className="relative text-4xl transition-all duration-300"
                    style={{
                      color: skill.color,
                      transform: hoveredSkill === skill.id ? 'scale(1.12)' : 'scale(1)',
                    }}
                  >
                    {skill.icon}
                  </span>
                </div>
                  <div className="text-xl font-black text-slate-800 mb-2">{skill.name}</div>
                  <div className="text-slate-400 font-medium">{skill.count} bộ đề chuẩn</div>
              </div>
            ))}
          </div>
        </div>

        {/* FEATURED TESTS - MEMBER */}
        <div id="member-tests">
          <div className="flex justify-between items-end mb-8">
            <h3 className="text-2xl font-extrabold text-slate-800 flex items-center gap-3">
              {searchQuery.trim() ? 'Kết quả tìm kiếm' : 'Đề Thi Phổ Biến Nhất'}
              {!searchQuery.trim() && (
                <span className="text-sm font-semibold text-slate-400 flex items-center gap-1">
                  <TrendingUp size={14} /> Top {filteredTests.length}
                </span>
              )}
            </h3>
            {!searchQuery.trim() && !showAll && sortedTests.length > 8 && (
              <button
                onClick={() => setShowAll(true)}
                className="text-sm text-orange-500 font-semibold hover:underline flex items-center gap-1"
              >
                Xem tất cả ({sortedTests.length}) <ChevronRight size={14} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredTests?.map(test => (
              <div
                key={test.id}
                className="group bg-white rounded-2xl border transition-all duration-300 cursor-pointer"
                style={{
                  borderColor: hoveredCard === test.id ? '#ff8a00' : '#f1f5f9',
                  boxShadow:
                    hoveredCard === test.id
                      ? '0 25px 50px rgba(0,0,0,0.12)'
                      : '0 8px 20px rgba(0,0,0,0.04)',
                  transform: hoveredCard === test.id ? 'scale(1.02)' : 'scale(1)'
                }}
                onMouseEnter={() => setHoveredCard(test.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* BADGE HOT */}
                {(test.attempt_count || 0) >= hotThreshold && hotThreshold !== Infinity && (
                  <div className="absolute -top-3 left-4 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md">
                    🔥 HOT
                  </div>
                )}

                <div className="p-5 space-y-3 relative">

                  {/* TAGS */}
                  <div className="flex gap-2">
                   
                    <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-600">
                      {test.skill}
                    </span>
                  </div>

                  {/* TITLE */}
                  <h4 className="text-lg font-bold text-slate-800 line-clamp-2 min-h-[3.5rem] leading-tight 
                                group-hover:text-orange-600 transition-colors">
                    {test.title || test.name}
                  </h4>

                  {/* META */}
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold py-2 border-y border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {test.duration} phút
                    </span>
                    {/* <span className="flex items-center gap-1">
                      <Eye size={14} />
                      {test.views > 1000
                        ? `${(test.views / 1000).toFixed(1)}k`
                        : test.views}{' '}
                      lượt
                    </span> */}
                  </div>

                  {/* FOOTER INFO */}
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-semibold text-slate-600">
                      {(test.questions?.length ?? test.question_count ?? 0)} câu hỏi
                    </div>
                  </div>

                  {/* BUTTON PREMIUM */}
                  <button
                    className="w-full mt-3 py-3 rounded-xl font-semibold text-sm text-white
                              bg-gradient-to-r from-orange-500 to-orange-600
                              shadow-lg shadow-orange-200
                              group-hover:shadow-orange-300
                              group-hover:brightness-110
                              transition-all duration-300
                              active:scale-95
                              flex items-center justify-center gap-2"
                    onClick={() => handleTestClick(test)}
                  >
                    Làm bài ngay
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </button>

                </div>
              </div>
            ))}
          </div>
        </div>
      {/* --- FOOTER SECTION - MEMBER --- */}
      <footer className="mt-20">

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

export default Dashboard;
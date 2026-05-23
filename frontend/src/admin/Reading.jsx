import React from 'react';
import { Star, Clock, Eye, MessageSquare, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReadingTests = ({
  styles,
  hoveredCard,
  setHoveredCard,
  readingTests = [],
  handleTestClick
}) => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => navigate('/admin/dashboard')}
        >
          <div style={{ ...styles.logo, backgroundColor: '#10b981' }}>
            <span style={{ fontSize: '20px' }}>📖</span>
          </div>
          <div>
            <h1 style={styles.headerTitle}>LearnWithMe</h1>
            <span className="text-[10px] font-bold text-emerald-600 tracking-widest uppercase">Thư viện đề thi</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-10 md:px-20 bg-[#f8fafc]">
        <div className="mb-10">
          <button
            className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-emerald-600 font-bold text-sm transition-colors"
            onClick={() => navigate('/admin/dashboard')}
          >
            <ArrowLeft size={18} /> QUAY LẠI BẢNG ĐIỀU KHIỂN
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
              <Star size={28} className="text-yellow-400 fill-yellow-400" />
              Reading Tests
            </h2>
            <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-sm font-bold">
              {readingTests.length} Đề thi hiện có
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {readingTests.map(test => (
              <div
                key={test.id}
                style={{
                  ...styles.testCard,
                  boxShadow: hoveredCard === test.id ? '0 15px 30px rgba(16, 185, 129, 0.1)' : '0 4px 6px rgba(0,0,0,0.02)',
                  borderColor: hoveredCard === test.id ? '#10b981' : '#f1f5f9',
                  transform: hoveredCard === test.id ? 'translateY(-5px)' : 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={() => setHoveredCard(test.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-wrap gap-1">
                    <span style={{ ...styles.tag, backgroundColor: '#ecfdf5', color: '#059669' }}>#TOEIC BRIDGE</span>
                    <span style={{ ...styles.tag, backgroundColor: '#d1fae5', color: '#047857' }}>#READING</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">ID: {test.id?.toString().slice(0, 5)}</span>
                </div>

                <h4 className="text-lg font-bold text-slate-800 line-clamp-2 min-h-[3.5rem] leading-tight mb-4">
                  {test.title || test.name || 'Untitled Test'}
                </h4>

                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold py-3 border-y border-slate-50 mb-4">
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-emerald-400" />
                    {test.duration || test.time_limit || 0} phút
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Eye size={14} className="text-emerald-400" />
                    {test.views > 1000 ? `${(test.views / 1000).toFixed(1)}k` : test.views || 0} lượt
                  </span>
                </div>

                <div className="text-[11px] font-bold text-slate-500 mb-4 px-2 py-1 bg-slate-50 rounded w-fit">
                  Nội dung: {(test.questions?.length ?? 0)} câu hỏi
                </div>

                <button
                  style={{ ...styles.button, backgroundColor: '#10b981', color: 'white', width: '100%' }}
                  className="hover:bg-emerald-700 active:scale-95 transition-all shadow-md shadow-emerald-100"
                  onClick={() => handleTestClick(test)}
                >
                  CHI TIẾT ĐỀ THI
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-400 mt-4 cursor-pointer hover:text-emerald-600 transition-colors">
                  <MessageSquare size={12} />
                  {(test.comments || 0)} bình luận
                </div>
              </div>
            ))}

            {readingTests.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <div className="text-5xl mb-4">Empty 📭</div>
                <p className="text-slate-400 font-medium">Chưa có đề Reading nào trong kho dữ liệu.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReadingTests;

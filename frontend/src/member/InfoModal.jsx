import React from "react";
import { X, Calendar, Users, Laptop, Info, Trophy, Map, Phone, Star, Rocket, Sparkles } from "lucide-react";

const InfoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* OVERLAY */}
      <div 
        className="fixed inset-0 bg-[#0a192f]/90 backdrop-blur-xl transition-opacity animate-[fadeIn_0.3s_ease-out]"
        onClick={onClose}
      />

      {/* MODAL CONTENT */}
      <div className="relative bg-[#112240] border border-white/10 w-full max-w-3xl rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] overflow-hidden animate-[zoomIn_0.3s_ease-out] my-auto">
        
        {/* Decorative Top Gradient */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500" />
        
        {/* Nút Đóng */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2.5 rounded-full bg-white/5 hover:bg-rose-500/20 text-white/50 hover:text-rose-400 transition-all duration-300 z-10"
        >
          <X size={24} />
        </button>

        <div className="p-8 md:p-12">
          {/* Tiêu đề & Caption khích lệ */}
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-20 h-20 bg-blue-500/10 rounded-[24px] flex items-center justify-center text-blue-400 mb-6 border border-blue-500/20 shadow-inner rotate-3">
              <Rocket size={40} className="animate-bounce" />
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">
              Chinh phục <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Tương lai</span>
            </h2>
            
            {/* DÒNG CAPTION KHÍCH LỆ */}
            <p className="text-blue-200/80 font-medium italic text-lg max-w-md leading-relaxed">
              "Đừng đợi đến khi giỏi Tiếng Anh mới đi thi, hãy đi thi để trở nên <span className="text-orange-400 font-bold">xuất sắc</span> hơn mỗi ngày!"
            </p>
            <div className="flex items-center gap-2 mt-4 text-white/30 text-[10px] uppercase tracking-[0.3em]">
              <Sparkles size={12} /> Be the best version of yourself <Sparkles size={12} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* CỘT TRÁI: QUY ĐỊNH */}
            <div className="space-y-6">
              <h3 className="text-blue-400 font-bold uppercase tracking-[0.2em] text-xs ml-1 flex items-center gap-2">
                <Info size={14} /> Quy định chung
              </h3>
              
              <div className="group flex items-start gap-4 bg-white/5 border border-white/5 hover:border-blue-500/30 p-5 rounded-3xl transition-all duration-300">
                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 group-hover:scale-110 transition-transform">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Thời gian</p>
                  <p className="text-white font-bold">01/04 – 30/04/2026</p>
                  <p className="text-blue-400/60 text-[10px] mt-1 italic">Dấu mốc của sự thay đổi!</p>
                </div>
              </div>

              <div className="group flex items-start gap-4 bg-white/5 border border-white/5 hover:border-emerald-500/30 p-5 rounded-3xl transition-all duration-300">
                <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Đối tượng</p>
                  <p className="text-white font-bold">Thế hệ trẻ Việt Nam (10 - 20 tuổi)</p>
                  <p className="text-emerald-400/60 text-[10px] mt-1 italic">Nơi những tài năng hội tụ</p>
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: GIẢI THƯỞNG */}
            <div className="space-y-6">
              <h3 className="text-orange-400 font-bold uppercase tracking-[0.2em] text-xs ml-1 flex items-center gap-2">
                <Trophy size={14} /> Vinh quang đang chờ
              </h3>
              
              <div className="group bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border border-yellow-500/20 p-6 rounded-3xl transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <Trophy className="text-yellow-400" size={28} />
                  <p className="text-white font-black uppercase tracking-tighter">Giải thưởng cực lớn</p>
                </div>
                <ul className="space-y-2 text-sm text-white/70">
                  <li className="flex items-center gap-2 font-medium">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" /> Giải Nhất: 5.000.000đ
                  </li>
                  <li className="flex items-center gap-2">
                    <Star size={14} className="text-white/20" /> Hàng ngàn phần quà hấp dẫn khác
                  </li>
                </ul>
              </div>

              <div className="p-5 bg-blue-500/5 rounded-3xl border border-blue-500/10 border-dashed">
                 <p className="text-white/60 text-xs text-center leading-relaxed">
                   "Thành công không phải là đích đến, mà là lòng can đảm để bước tiếp." — <span className="text-blue-400">Winston Churchill</span>
                 </p>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-4">
            {/* <button 
              onClick={onClose}
              className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all border border-white/10"
            >
              Thoát
            </button> */}
            <button 
              className="flex-[2] py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-blue-900/40 transition-all hover:scale-[1.03] active:scale-[0.98] uppercase tracking-[0.1em] flex items-center justify-center gap-3"
            >
              <Rocket size={20} /> Đăng kí ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
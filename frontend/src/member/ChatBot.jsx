import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, TrendingUp, RotateCcw, TrendingDown } from 'lucide-react';
import { sendChatMessage } from '../api';

const API_BASE = 'http://127.0.0.1:8000';

const QUICK_ACTIONS = [
  { label: '📊 Phân tích điểm yếu', text: 'Hãy phân tích chi tiết điểm yếu của tôi và đưa ra lời khuyên cụ thể dựa trên dữ liệu làm bài của tôi.' },
  { label: '🗺️ Lộ trình học tập', text: 'Dựa trên kết quả làm bài của tôi, hãy đề xuất lộ trình học TOEIC phù hợp.' },
  { label: '📈 Tiến độ của tôi', text: 'Tôi đang học tiến bộ như thế nào? Hãy nhận xét dựa trên lịch sử làm bài của tôi.' },
  { label: '💡 Bài tập gợi ý', text: 'Dựa trên điểm yếu của tôi, hãy gợi ý bài tập cụ thể để cải thiện.' },
];

const buildGreeting = (name, weakAreas) => {
  const hasWeak = weakAreas?.weak_areas?.length > 0;
  const weakList = hasWeak
    ? weakAreas.weak_areas.map(w => w.part_label).join(', ')
    : null;

  let msg = `Xin chào${name ? ` **${name}**` : ''}! 👋\n\n`;

  if (hasWeak) {
    msg += `Tôi đã xem dữ liệu làm bài của bạn. Bạn cần chú ý cải thiện: **${weakList}**.\n\n`;
    msg += `Tôi có thể giúp bạn phân tích sâu hơn và đưa ra chiến lược cụ thể. Hỏi tôi bất cứ điều gì! 🎯`;
  } else {
    msg += `Tôi có thể giúp bạn:\n- Phân tích tiến độ và điểm yếu\n- Chiến lược làm bài Listening & Reading\n- Ngữ pháp, từ vựng TOEIC\n- Xây dựng lộ trình học tập\n\nBạn cần hỗ trợ gì? 🎯`;
  }

  return msg;
};

const renderInline = (text, key) => {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <span key={key}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**'))
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        if (part.startsWith('`') && part.endsWith('`'))
          return (
            <code key={i} className="bg-slate-200 px-1 rounded text-[11px] font-mono">
              {part.slice(1, -1)}
            </code>
          );
        return part;
      })}
    </span>
  );
};

const renderMarkdown = (text) => {
  const lines = (text || "").split("\n");
  const result = [];
  let listItems = [];

  const flushList = (idx) => {
    if (!listItems.length) return;
    result.push(
      <ul key={`ul-${idx}`} className="list-disc list-inside space-y-0.5 my-1 pl-1">
        {listItems.map((item, i) => (
          <li key={i} className="text-sm leading-relaxed">
            {renderInline(item, i)}
          </li>
        ))}
      </ul>
    );
    listItems = [];
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList(i);
      return;
    }
    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)/);
    const numberedMatch = trimmed.match(/^\d+\.\s+(.*)/);
    if (bulletMatch || numberedMatch) {
      listItems.push(bulletMatch ? bulletMatch[1] : numberedMatch[1]);
    } else {
      flushList(i);
      result.push(
        <p key={i} className="text-sm leading-relaxed my-0.5">
          {renderInline(trimmed, i)}
        </p>
      );
    }
  });
  flushList('end');
  return result;
};

const ChatBot = ({ currentUser, weakAreas }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => [
    {
      role: 'assistant',
      content: buildGreeting(currentUser?.name, weakAreas),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const hasWeakAreas = weakAreas?.weak_areas?.length > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const sendMessage = async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;
    setInput('');

    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: text },
      { role: 'assistant', content: '', streaming: true },
    ]);
    setLoading(true);

    try {
  const res = await sendChatMessage({
    user_id: currentUser?.id ?? null,
    message: text,
    history: history.slice(-10),
  });

    console.log("CHAT RESPONSE:", res.data);

  setMessages((prev) => {
    const updated = [...prev];

    updated[updated.length - 1] = {
      role: "assistant",
      content: res.data,
      streaming: false,
    };

    return updated;
  });

} catch (err) {
  setMessages((prev) => {
    const updated = [...prev];

    updated[updated.length - 1] = {
      role: "assistant",
      content: "❌ Có lỗi xảy ra. Vui lòng thử lại sau.",
      streaming: false,
    };

    return updated;
  });
} finally {
  setLoading(false);
}
  };

  const handleReset = () => {
    setMessages([{ role: 'assistant', content: buildGreeting(currentUser?.name, weakAreas) }]);
    setInput('');
  };

  const isInitial = messages.length === 1;

  return (
    <>
      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-[9999] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
          style={{ width: 380, maxWidth: 'calc(100vw - 24px)', height: 540 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-orange-500 to-red-500 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">Trợ lý TOEIC</div>
                <div className="flex items-center gap-1.5 text-white/70 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block" />
                  Sẵn sàng hỗ trợ
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                title="Làm mới cuộc trò chuyện"
                className="text-white/70 hover:text-white transition-colors p-1"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="text-white/70 hover:text-white transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Stats bar */}
          {weakAreas && (weakAreas.total_mcq_attempts > 0 || hasWeakAreas) && (
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1 text-slate-500">
                  <span className="font-semibold text-slate-700">{weakAreas.total_mcq_attempts}</span>
                  <span>câu MCQ</span>
                </div>
                {Object.entries(weakAreas.skill_accuracy || {}).map(([skill, stat]) => {
                  const pct = Math.round(stat.accuracy * 100);
                  const color = pct >= 70 ? 'text-green-600' : pct >= 50 ? 'text-amber-600' : 'text-red-500';
                  const labels = { listening: '🎧', reading: '📖', speaking: '🎤', writing: '✍️' };
                  return (
                    <div key={skill} className="flex items-center gap-0.5">
                      <span>{labels[skill] || skill}</span>
                      <span className={`font-bold ${color}`}>{pct}%</span>
                    </div>
                  );
                })}
                {hasWeakAreas && (
                  <div className="ml-auto flex items-center gap-1 text-amber-600">
                    <TrendingDown size={11} />
                    <span className="font-medium">{weakAreas.weak_areas.length} cần ôn</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={13} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] px-4 py-2.5 rounded-2xl leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-tr-sm text-sm'
                      : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <span className="text-sm">{msg.content}</span>
                  ) : (
                    <>
                      {renderMarkdown(msg.content)}
                      {msg.streaming && (
                        <span className="inline-block w-1.5 h-4 bg-orange-400 ml-0.5 align-middle animate-pulse rounded-sm" />
                      )}
                    </>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                    <User size={13} className="text-slate-500" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick actions */}
          {isInitial && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
              {QUICK_ACTIONS.map((a, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(a.text)}
                  className="text-[11px] px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 transition-colors font-medium"
                >
                  {a.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-slate-100 flex gap-2 shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Nhập câu hỏi của bạn..."
              disabled={loading}
              className="flex-1 bg-slate-100 rounded-2xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-orange-200 transition-all disabled:opacity-60"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white flex items-center justify-center disabled:opacity-40 hover:brightness-110 active:scale-95 transition-all shrink-0"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-300/60 hover:shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && hasWeakAreas && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full border-2 border-white text-[10px] text-white flex items-center justify-center font-bold">
            {weakAreas.weak_areas.length}
          </span>
        )}
      </button>
    </>
  );
};

export default ChatBot;

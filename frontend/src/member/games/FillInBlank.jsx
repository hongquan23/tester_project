import React, { useState, useEffect, useRef } from 'react';

const normalize = (s) => s.trim().toLowerCase().replace(/[^a-z\s]/g, '');

const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

const FillInBlank = ({ cards, onBack, onCardUpdate }) => {
  const [queue] = useState(() => shuffle(cards));
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null); // null | 'correct' | 'wrong'
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const inputRef = useRef();

  useEffect(() => {
    setInput('');
    setResult(null);
    inputRef.current?.focus();
  }, [index]);

  const finished = index >= queue.length;
  const current = queue[index];
  const progress = Math.round((index / queue.length) * 100);

  const handleSubmit = () => {
    if (!input.trim()) return;
    const correct = normalize(input) === normalize(current.original_text);
    setResult(correct ? 'correct' : 'wrong');
    setScore(s => correct ? { ...s, correct: s.correct + 1 } : { ...s, wrong: s.wrong + 1 });
  };

  const handleNext = () => {
    if (index < queue.length - 1) {
      setIndex(i => i + 1);
    } else {
      setIndex(queue.length);
      onCardUpdate();
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', color: '#64748b', fontWeight: 600 }}>
          ← Thoát
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>Điền Từ</div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>{index}/{queue.length} từ</div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700 }}>
          <span style={{ color: '#10b981' }}>{score.correct}✓</span>
          <span style={{ color: '#ef4444', marginLeft: 10 }}>{score.wrong}✗</span>
        </div>
      </div>

      <div style={{ background: '#e2e8f0', borderRadius: 99, height: 6, marginBottom: 28 }}>
        <div style={{ width: `${progress}%`, background: '#8b5cf6', height: 6, borderRadius: 99, transition: 'width 0.4s' }} />
      </div>

      {finished ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>{score.correct >= score.wrong ? '⭐' : '📚'}</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>Hoàn thành!</div>
          <div style={{ fontSize: 16, color: '#64748b', marginBottom: 24 }}>
            Đúng {score.correct}/{queue.length} từ ({Math.round((score.correct / queue.length) * 100)}%)
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => { window.location.reload(); }}
              style={{ padding: '10px 24px', borderRadius: 8, background: '#8b5cf6', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Chơi lại
            </button>
            <button onClick={onBack}
              style={{ padding: '10px 24px', borderRadius: 8, background: '#f1f5f9', color: '#475569', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Quay lại
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* Clue card */}
          <div style={{
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            borderRadius: 20, padding: '32px', textAlign: 'center', marginBottom: 28,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: 2, marginBottom: 12, textTransform: 'uppercase' }}>
              Điền từ tiếng Anh tương ứng
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 10 }}>{current.translated_text}</div>
            {current.explanation && (
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 10 }}>{current.explanation}</div>
            )}
            {current.word_type && (
              <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', borderRadius: 99, padding: '4px 14px', fontSize: 13, color: '#fff' }}>
                {current.word_type}
              </div>
            )}
          </div>

          {/* Hint: first letter */}
          <div style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', marginBottom: 12 }}>
            Gợi ý: chữ cái đầu là <strong style={{ color: '#8b5cf6' }}>"{current.original_text[0].toUpperCase()}"</strong> · {current.original_text.length} ký tự
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !result) handleSubmit(); else if (e.key === 'Enter' && result) handleNext(); }}
            disabled={!!result}
            placeholder="Nhập từ tiếng Anh..."
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 12, fontSize: 18, fontWeight: 700,
              border: `2px solid ${result === 'correct' ? '#10b981' : result === 'wrong' ? '#ef4444' : '#e2e8f0'}`,
              background: result === 'correct' ? '#f0fdf4' : result === 'wrong' ? '#fef2f2' : '#fff',
              color: '#1e293b', outline: 'none', boxSizing: 'border-box',
              textAlign: 'center', letterSpacing: 2,
            }}
          />

          {result && (
            <div style={{
              marginTop: 14, borderRadius: 12, padding: '14px 18px',
              background: result === 'correct' ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${result === 'correct' ? '#86efac' : '#fca5a5'}`,
              color: result === 'correct' ? '#166534' : '#b91c1c',
              fontWeight: 700, textAlign: 'center', fontSize: 15,
            }}>
              {result === 'correct' ? '✓ Chính xác!' : `✗ Đáp án đúng: ${current.original_text}`}
            </div>
          )}

          {current.example && result && (
            <div style={{ marginTop: 12, background: '#f8fafc', borderRadius: 10, padding: '10px 14px', fontSize: 13, borderLeft: '3px solid #8b5cf6' }}>
              <div style={{ fontStyle: 'italic', color: '#334155' }}>{current.example}</div>
              {current.example_translation && <div style={{ color: '#94a3b8', marginTop: 4 }}>{current.example_translation}</div>}
            </div>
          )}

          <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
            {!result ? (
              <button
                onClick={handleSubmit}
                disabled={!input.trim()}
                style={{
                  flex: 1, padding: '13px', borderRadius: 12,
                  background: input.trim() ? '#8b5cf6' : '#e2e8f0',
                  color: input.trim() ? '#fff' : '#94a3b8',
                  border: 'none', cursor: input.trim() ? 'pointer' : 'default', fontWeight: 700, fontSize: 15,
                }}
              >
                Kiểm tra
              </button>
            ) : (
              <button
                onClick={handleNext}
                style={{ flex: 1, padding: '13px', borderRadius: 12, background: '#8b5cf6', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15 }}
              >
                {index < queue.length - 1 ? 'Từ tiếp theo →' : 'Xem kết quả'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FillInBlank;

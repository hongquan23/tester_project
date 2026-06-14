import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

const buildQuestion = (cards, targetCard) => {
  const others = shuffle(cards.filter(c => c.id !== targetCard.id)).slice(0, 3);
  const options = shuffle([targetCard, ...others]);
  return { target: targetCard, options };
};

const MultipleChoice = ({ cards, onBack, onCardUpdate }) => {
  const [queue, setQueue] = useState(() => shuffle(cards));
  const [index, setIndex] = useState(0);
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });

  useEffect(() => {
    if (index < queue.length) {
      setQuestion(buildQuestion(cards, queue[index]));
      setSelected(null);
    }
  }, [index, queue]);

  const handleSelect = (card) => {
    if (selected) return;
    setSelected(card);
    if (card.id === question.target.id) {
      setScore(s => ({ ...s, correct: s.correct + 1 }));
    } else {
      setScore(s => ({ ...s, wrong: s.wrong + 1 }));
    }
  };

  const handleNext = () => {
    if (index < queue.length - 1) {
      setIndex(i => i + 1);
    } else {
      setIndex(queue.length);
      onCardUpdate();
    }
  };

  const finished = index >= queue.length;
  const progress = Math.round((index / queue.length) * 100);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', color: '#64748b', fontWeight: 600 }}>
          ← Thoát
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>Trắc Nghiệm</div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>{index}/{queue.length} câu</div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700 }}>
          <span style={{ color: '#10b981' }}>{score.correct}✓</span>
          <span style={{ color: '#ef4444', marginLeft: 10 }}>{score.wrong}✗</span>
        </div>
      </div>

      <div style={{ background: '#e2e8f0', borderRadius: 99, height: 6, marginBottom: 28 }}>
        <div style={{ width: `${progress}%`, background: '#10b981', height: 6, borderRadius: 99, transition: 'width 0.4s' }} />
      </div>

      {finished ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>{score.correct >= score.wrong ? '🏆' : '💪'}</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>Hoàn thành!</div>
          <div style={{ fontSize: 16, color: '#64748b', marginBottom: 24 }}>
            Đúng {score.correct}/{queue.length} câu ({Math.round((score.correct / queue.length) * 100)}%)
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => { setQueue(shuffle(cards)); setIndex(0); setScore({ correct: 0, wrong: 0 }); }}
              style={{ padding: '10px 24px', borderRadius: 8, background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Chơi lại
            </button>
            <button onClick={onBack}
              style={{ padding: '10px 24px', borderRadius: 8, background: '#f1f5f9', color: '#475569', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Quay lại
            </button>
          </div>
        </div>
      ) : question ? (
        <div>
          {/* Question */}
          <div style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: 20, padding: '32px', textAlign: 'center', marginBottom: 24,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: 2, marginBottom: 12, textTransform: 'uppercase' }}>
              Nghĩa của từ là gì?
            </div>
            <div style={{ fontSize: 38, fontWeight: 800, color: '#fff' }}>{question.target.original_text}</div>
            {question.target.ipa && <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>{question.target.ipa}</div>}
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {question.options.map(opt => {
              const isCorrect = opt.id === question.target.id;
              const isSelected = selected?.id === opt.id;
              let bg = '#fff', border = '#e2e8f0', color = '#334155';
              if (selected) {
                if (isCorrect) { bg = '#f0fdf4'; border = '#10b981'; color = '#166534'; }
                else if (isSelected) { bg = '#fef2f2'; border = '#ef4444'; color = '#b91c1c'; }
              }
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt)}
                  disabled={!!selected}
                  style={{
                    padding: '14px 18px', borderRadius: 12, border: `2px solid ${border}`,
                    background: bg, color, cursor: selected ? 'default' : 'pointer',
                    fontWeight: 600, fontSize: 15, textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.2s',
                  }}
                >
                  {selected && isCorrect && <CheckCircle size={18} color="#10b981" />}
                  {selected && isSelected && !isCorrect && <XCircle size={18} color="#ef4444" />}
                  {opt.translated_text}
                </button>
              );
            })}
          </div>

          {selected && (
            <div style={{ marginTop: 20 }}>
              {selected.id !== question.target.id && question.target.explanation && (
                <div style={{ background: '#fef3c7', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#92400e', marginBottom: 12 }}>
                  {question.target.explanation}
                </div>
              )}
              <button
                onClick={handleNext}
                style={{ width: '100%', padding: '13px', borderRadius: 12, background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15 }}
              >
                {index < queue.length - 1 ? 'Câu tiếp theo →' : 'Xem kết quả'}
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default MultipleChoice;

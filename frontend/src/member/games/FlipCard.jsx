import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { markFlashcardKnown, markFlashcardUnknown } from '../../api';

const FlipCard = ({ cards, onBack, onCardUpdate }) => {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState([]);
  const [score, setScore] = useState({ known: 0, unknown: 0 });

  const current = cards[index];
  const progress = Math.round(((index) / cards.length) * 100);

  const handleKnown = async () => {
    try { await markFlashcardKnown(current.id); } catch {}
    setScore(s => ({ ...s, known: s.known + 1 }));
    nextCard(true);
  };

  const handleUnknown = async () => {
    try { await markFlashcardUnknown(current.id); } catch {}
    setScore(s => ({ ...s, unknown: s.unknown + 1 }));
    nextCard(false);
  };

  const nextCard = (known) => {
    setDone(d => [...d, { id: current.id, known }]);
    setFlipped(false);
    setTimeout(() => {
      if (index < cards.length - 1) {
        setIndex(i => i + 1);
      } else {
        setIndex(cards.length); // finished
        onCardUpdate();
      }
    }, 200);
  };

  const finished = index >= cards.length;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', color: '#64748b', fontWeight: 600 }}>
          ← Thoát
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>Lật Thẻ</div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>{index}/{cards.length} thẻ</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: '#e2e8f0', borderRadius: 99, height: 6, marginBottom: 28 }}>
        <div style={{ width: `${progress}%`, background: '#3b82f6', height: 6, borderRadius: 99, transition: 'width 0.4s' }} />
      </div>

      {finished ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>Hoàn thành!</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, margin: '20px 0 28px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#10b981' }}>{score.known}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>Đã thuộc</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#f97316' }}>{score.unknown}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>Cần ôn thêm</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => { setIndex(0); setFlipped(false); setDone([]); setScore({ known: 0, unknown: 0 }); }}
              style={{ padding: '10px 24px', borderRadius: 8, background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Học lại
            </button>
            <button onClick={onBack}
              style={{ padding: '10px 24px', borderRadius: 8, background: '#f1f5f9', color: '#475569', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Quay lại
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Card */}
          <div
            onClick={() => setFlipped(f => !f)}
            style={{
              perspective: 1000,
              cursor: 'pointer',
              marginBottom: 24,
              userSelect: 'none',
            }}
          >
            <div style={{
              position: 'relative',
              width: '100%',
              minHeight: 240,
              transformStyle: 'preserve-3d',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transition: 'transform 0.45s',
            }}>
              {/* Front */}
              <div style={{
                position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                borderRadius: 20, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', padding: 32,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: 2, marginBottom: 16, textTransform: 'uppercase' }}>Từ tiếng Anh</div>
                <div style={{ fontSize: 34, fontWeight: 800, color: '#fff', textAlign: 'center' }}>{current.original_text}</div>
                {current.ipa && <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', marginTop: 10 }}>{current.ipa}</div>}
                {current.word_type && <div style={{ marginTop: 14, background: 'rgba(255,255,255,0.2)', borderRadius: 99, padding: '4px 14px', fontSize: 13, color: '#fff' }}>{current.word_type}</div>}
                <div style={{ position: 'absolute', bottom: 14, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Nhấn để xem nghĩa</div>
              </div>

              {/* Back */}
              <div style={{
                position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                background: '#fff', borderRadius: 20,
                border: '2px solid #e2e8f0',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', padding: 32,
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 2, marginBottom: 16, textTransform: 'uppercase' }}>Nghĩa tiếng Việt</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', marginBottom: 10 }}>{current.translated_text}</div>
                {current.explanation && <div style={{ fontSize: 14, color: '#64748b', marginBottom: 14 }}>{current.explanation}</div>}
                {current.example && (
                  <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 16px', fontSize: 13, borderLeft: '3px solid #3b82f6', textAlign: 'left', width: '100%' }}>
                    <div style={{ fontStyle: 'italic', color: '#334155' }}>{current.example}</div>
                    {current.example_translation && <div style={{ color: '#94a3b8', marginTop: 4 }}>{current.example_translation}</div>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          {flipped && (
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <button
                onClick={handleUnknown}
                style={{
                  flex: 1, padding: '14px', borderRadius: 12, border: '2px solid #fca5a5',
                  background: '#fff', color: '#ef4444', cursor: 'pointer', fontWeight: 700, fontSize: 15,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <XCircle size={20} /> Chưa thuộc
              </button>
              <button
                onClick={handleKnown}
                style={{
                  flex: 1, padding: '14px', borderRadius: 12, border: '2px solid #86efac',
                  background: '#fff', color: '#16a34a', cursor: 'pointer', fontWeight: 700, fontSize: 15,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <CheckCircle size={20} /> Đã thuộc
              </button>
            </div>
          )}
          {!flipped && (
            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
              Nhấn vào thẻ để xem nghĩa, sau đó đánh giá mức độ nhớ
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FlipCard;

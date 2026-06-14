import React, { useState, useEffect } from 'react';

const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
const PAIR_COUNT = 6;

const buildRound = (cards) => {
  const pool = shuffle(cards).slice(0, Math.min(PAIR_COUNT, cards.length));
  const left = shuffle(pool.map(c => ({ id: c.id, text: c.original_text, side: 'left' })));
  const right = shuffle(pool.map(c => ({ id: c.id, text: c.translated_text, side: 'right' })));
  return { pool, left, right };
};

const MatchingGame = ({ cards, onBack, onCardUpdate }) => {
  const [round, setRound] = useState(() => buildRound(cards));
  const [selected, setSelected] = useState(null); // { id, side }
  const [matched, setMatched] = useState(new Set());
  const [wrong, setWrong] = useState(null);
  const [roundsCompleted, setRoundsCompleted] = useState(0);
  const [totalMatched, setTotalMatched] = useState(0);
  const allMatched = matched.size === round.pool.length;

  const handleSelect = (item) => {
    if (matched.has(item.id)) return;
    if (wrong) return;

    if (!selected) {
      setSelected(item);
      return;
    }

    if (selected.side === item.side) {
      setSelected(item);
      return;
    }

    if (selected.id === item.id) {
      setMatched(m => new Set([...m, item.id]));
      setSelected(null);
      setTotalMatched(n => n + 1);
    } else {
      setWrong({ a: selected, b: item });
      setTimeout(() => { setWrong(null); setSelected(null); }, 700);
    }
  };

  const nextRound = () => {
    const remainingCards = cards.filter(c => !Array.from(matched).includes(c.id));
    const newPool = remainingCards.length >= 2 ? remainingCards : cards;
    setRound(buildRound(newPool));
    setMatched(new Set());
    setSelected(null);
    setRoundsCompleted(r => r + 1);
    onCardUpdate();
  };

  const getItemStyle = (item) => {
    const isMatched = matched.has(item.id);
    const isSelected = selected?.id === item.id && selected?.side === item.side;
    const isWrong = wrong && (
      (wrong.a.id === item.id && wrong.a.side === item.side) ||
      (wrong.b.id === item.id && wrong.b.side === item.side)
    );

    let bg = '#fff', border = '#e2e8f0', color = '#334155', opacity = 1;
    if (isMatched) { bg = '#f0fdf4'; border = '#10b981'; color = '#166534'; opacity = 0.6; }
    else if (isWrong) { bg = '#fef2f2'; border = '#ef4444'; color = '#b91c1c'; }
    else if (isSelected) { bg = '#eff6ff'; border = '#3b82f6'; color = '#1d4ed8'; }

    return {
      padding: '12px 14px', borderRadius: 10, border: `2px solid ${border}`,
      background: bg, color, cursor: isMatched ? 'default' : 'pointer',
      fontWeight: 600, fontSize: 14, textAlign: 'center', opacity,
      transition: 'all 0.2s', minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
    };
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', color: '#64748b', fontWeight: 600 }}>
          ← Thoát
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>Ghép Cặp</div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>Vòng {roundsCompleted + 1} · {matched.size}/{round.pool.length} cặp</div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f97316' }}>
          {totalMatched} cặp đúng
        </div>
      </div>

      <div style={{ background: '#e2e8f0', borderRadius: 99, height: 6, marginBottom: 24 }}>
        <div style={{ width: `${(matched.size / round.pool.length) * 100}%`, background: '#f97316', height: 6, borderRadius: 99, transition: 'width 0.4s' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Tiếng Anh</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {round.left.map(item => (
              <div key={`left-${item.id}`} style={getItemStyle(item)} onClick={() => handleSelect(item)}>
                {item.text}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Tiếng Việt</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {round.right.map(item => (
              <div key={`right-${item.id}`} style={getItemStyle(item)} onClick={() => handleSelect(item)}>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {allMatched && (
        <div style={{ marginTop: 28, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🎯</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', marginBottom: 18 }}>
            Ghép đúng tất cả {round.pool.length} cặp!
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={nextRound}
              style={{ padding: '10px 28px', borderRadius: 8, background: '#f97316', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 15 }}
            >
              Vòng tiếp →
            </button>
            <button onClick={onBack}
              style={{ padding: '10px 24px', borderRadius: 8, background: '#f1f5f9', color: '#475569', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Kết thúc
            </button>
          </div>
        </div>
      )}

      {!allMatched && (
        <div style={{ marginTop: 20, fontSize: 13, color: '#94a3b8', textAlign: 'center' }}>
          Chọn 1 từ tiếng Anh và 1 nghĩa tiếng Việt tương ứng
        </div>
      )}
    </div>
  );
};

export default MatchingGame;

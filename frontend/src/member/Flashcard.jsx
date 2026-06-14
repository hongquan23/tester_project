import React, { useState, useEffect } from 'react';
import { Layers, Trash2, CheckCircle, Circle, BookOpen, Zap, AlignLeft, Shuffle } from 'lucide-react';
import { getFlashcards, deleteFlashcard, markFlashcardKnown, markFlashcardUnknown } from '../api';
import FlipCard from './games/FlipCard';
import MultipleChoice from './games/MultipleChoice';
import FillInBlank from './games/FillInBlank';
import MatchingGame from './games/MatchingGame';

const GAMES = [
  { id: 'flipcard', name: 'Lật Thẻ', icon: <Layers size={28} />, color: '#3b82f6', desc: 'Lật thẻ để xem nghĩa, IPA, ví dụ' },
  { id: 'multiple', name: 'Trắc Nghiệm', icon: <CheckCircle size={28} />, color: '#10b981', desc: 'Chọn 1 trong 4 đáp án đúng' },
  { id: 'fill', name: 'Điền Từ', icon: <AlignLeft size={28} />, color: '#8b5cf6', desc: 'Đọc nghĩa rồi gõ lại từ gốc' },
  { id: 'matching', name: 'Ghép Cặp', icon: <Shuffle size={28} />, color: '#f97316', desc: 'Nối từ với nghĩa tương ứng' },
];

const WORD_TYPE_COLORS = {
  noun: '#3b82f6',
  verb: '#10b981',
  adjective: '#f97316',
  adverb: '#8b5cf6',
  phrase: '#ec4899',
};

const Flashcard = ({ currentUser, onBack }) => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGame, setActiveGame] = useState(null);
  const [filter, setFilter] = useState('all'); // all | unknown | known

  const userId = currentUser?.id || localStorage.getItem('user_id');

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setLoading(true);
      const res = await getFlashcards(userId);
      setCards(res.data || []);
    } catch {
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cardId) => {
    if (!window.confirm('Xóa flashcard này?')) return;
    await deleteFlashcard(cardId);
    setCards(prev => prev.filter(c => c.id !== cardId));
  };

  const handleToggleKnown = async (card) => {
    try {
      if (card.is_known) {
        const res = await markFlashcardUnknown(card.id);
        setCards(prev => prev.map(c => c.id === card.id ? res.data : c));
      } else {
        const res = await markFlashcardKnown(card.id);
        setCards(prev => prev.map(c => c.id === card.id ? res.data : c));
      }
    } catch {}
  };

  const filteredCards = cards.filter(c => {
    if (filter === 'known') return c.is_known;
    if (filter === 'unknown') return !c.is_known;
    return true;
  });

  const knownCount = cards.filter(c => c.is_known).length;
  const unknownCount = cards.length - knownCount;

  if (activeGame) {
    const gameCards = cards.filter(c => !c.is_known);
    if (gameCards.length < 2) {
      return (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>😅</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
            Cần ít nhất 2 từ chưa thuộc để chơi
          </div>
          <div style={{ color: '#64748b', marginBottom: 24 }}>
            Hãy thêm thêm từ vào flashcard hoặc đánh dấu bỏ qua một số từ đã biết.
          </div>
          <button
            onClick={() => setActiveGame(null)}
            style={{ padding: '10px 24px', borderRadius: 8, background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            Quay lại
          </button>
        </div>
      );
    }

    const props = { cards: gameCards, onBack: () => setActiveGame(null), onCardUpdate: loadCards };
    if (activeGame === 'flipcard') return <FlipCard {...props} />;
    if (activeGame === 'multiple') return <MultipleChoice {...props} />;
    if (activeGame === 'fill') return <FillInBlank {...props} />;
    if (activeGame === 'matching') return <MatchingGame {...props} />;
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <button onClick={onBack} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', color: '#64748b', fontWeight: 600 }}>
          ← Quay lại
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#1e293b' }}>Flashcard của tôi</h1>
          <div style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
            {cards.length} từ · {knownCount} đã thuộc · {unknownCount} chưa thuộc
          </div>
        </div>
      </div>

      {/* Stats bar */}
      {cards.length > 0 && (
        <div style={{
          background: '#f8fafc', borderRadius: 12, padding: '14px 20px',
          display: 'flex', gap: 32, marginBottom: 28, border: '1px solid #e2e8f0'
        }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>{knownCount}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Đã thuộc</div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#f97316' }}>{unknownCount}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Chưa thuộc</div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#3b82f6' }}>{cards.length}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Tổng từ</div>
          </div>
          {cards.length > 0 && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '100%', background: '#e2e8f0', borderRadius: 99, height: 8 }}>
                <div style={{ width: `${Math.round((knownCount / cards.length) * 100)}%`, background: '#10b981', height: 8, borderRadius: 99, transition: 'width 0.4s' }} />
              </div>
              <span style={{ marginLeft: 10, fontSize: 13, fontWeight: 700, color: '#10b981', whiteSpace: 'nowrap' }}>
                {Math.round((knownCount / cards.length) * 100)}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* Games */}
      {cards.length >= 2 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>Trò chơi ôn tập</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {GAMES.map(game => (
              <button
                key={game.id}
                onClick={() => setActiveGame(game.id)}
                style={{
                  background: '#fff', border: `2px solid ${game.color}20`,
                  borderRadius: 14, padding: '18px 16px',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = game.color + '10'; e.currentTarget.style.borderColor = game.color; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = game.color + '20'; }}
              >
                <div style={{ color: game.color, marginBottom: 10 }}>{game.icon}</div>
                <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 15, marginBottom: 4 }}>{game.name}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{game.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Flashcard list */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>Danh sách từ</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[['all', 'Tất cả'], ['unknown', 'Chưa thuộc'], ['known', 'Đã thuộc']].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                style={{
                  padding: '5px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 600,
                  background: filter === val ? '#3b82f6' : '#f1f5f9',
                  color: filter === val ? '#fff' : '#64748b',
                  border: 'none',
                }}
              >{label}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>Đang tải...</div>
        ) : filteredCards.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <BookOpen size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
            <div style={{ color: '#94a3b8', fontSize: 16 }}>
              {cards.length === 0 ? 'Chưa có flashcard. Hãy bôi đen từ bất kỳ trong app để thêm!' : 'Không có từ nào phù hợp bộ lọc.'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredCards.map(card => (
              <CardItem key={card.id} card={card} onDelete={handleDelete} onToggleKnown={handleToggleKnown} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CardItem = ({ card, onDelete, onToggleKnown }) => {
  const [expanded, setExpanded] = useState(false);
  const typeColor = WORD_TYPE_COLORS[card.word_type] || '#64748b';

  return (
    <div style={{
      background: '#fff', border: `1px solid ${card.is_known ? '#bbf7d0' : '#e2e8f0'}`,
      borderRadius: 12, padding: '14px 18px',
      backgroundColor: card.is_known ? '#f0fdf4' : '#fff',
      transition: 'all 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => onToggleKnown(card)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
          title={card.is_known ? 'Đánh dấu chưa thuộc' : 'Đánh dấu đã thuộc'}
        >
          {card.is_known
            ? <CheckCircle size={22} color="#10b981" />
            : <Circle size={22} color="#cbd5e1" />
          }
        </button>

        <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#1e293b' }}>{card.original_text}</span>
            {card.ipa && <span style={{ fontSize: 13, color: '#94a3b8' }}>{card.ipa}</span>}
            {card.word_type && (
              <span style={{ fontSize: 11, fontWeight: 700, color: typeColor, background: typeColor + '18', padding: '2px 8px', borderRadius: 99 }}>
                {card.word_type}
              </span>
            )}
          </div>
          <div style={{ color: '#475569', fontSize: 14, marginTop: 2 }}>{card.translated_text}</div>
        </div>

        <button
          onClick={() => onDelete(card.id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#fca5a5', flexShrink: 0 }}
        >
          <Trash2 size={16} />
        </button>
      </div>

      {expanded && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f1f5f9', paddingLeft: 34 }}>
          {card.explanation && (
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
              <span style={{ fontWeight: 600, color: '#475569' }}>Giải thích: </span>{card.explanation}
            </div>
          )}
          {card.example && (
            <div style={{ fontSize: 13, background: '#f8fafc', borderRadius: 8, padding: '8px 12px', borderLeft: '3px solid #3b82f6' }}>
              <div style={{ color: '#1e293b', fontStyle: 'italic' }}>{card.example}</div>
              {card.example_translation && <div style={{ color: '#64748b', marginTop: 4 }}>{card.example_translation}</div>}
            </div>
          )}
          <div style={{ fontSize: 11, color: '#cbd5e1', marginTop: 8 }}>
            Đã ôn {card.review_count} lần
          </div>
        </div>
      )}
    </div>
  );
};

export default Flashcard;

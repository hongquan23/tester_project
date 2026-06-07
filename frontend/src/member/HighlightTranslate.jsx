import React, { useState, useEffect, useRef } from 'react';
import { translateWord, createFlashcard } from '../api';
import { BookmarkPlus, X, Loader } from 'lucide-react';

const WORD_TYPE_COLORS = {
  noun: '#3b82f6', verb: '#10b981', adjective: '#f97316',
  adverb: '#8b5cf6', phrase: '#ec4899',
};

const HighlightTranslate = ({ userId }) => {
  const [popup, setPopup] = useState(null); // { x, y, text }
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const popupRef = useRef();

  useEffect(() => {
    const handleMouseUp = (e) => {
      // Don't trigger inside the popup itself
      if (popupRef.current?.contains(e.target)) return;

      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (!text || text.length < 2 || text.length > 60) {
        setPopup(null);
        setData(null);
        return;
      }

      // Only single words or short phrases (no newlines)
      if (text.includes('\n')) return;

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setPopup({
        x: rect.left + rect.width / 2,
        y: rect.bottom + window.scrollY + 8,
        text,
      });
      setData(null);
      setSaved(false);
    };

    const handleMouseDown = (e) => {
      if (!popupRef.current?.contains(e.target)) {
        setPopup(null);
        setData(null);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const handleTranslate = async () => {
    if (!popup?.text) return;
    setLoading(true);
    setData(null);
    try {
      const res = await translateWord({ text: popup.text, user_id: userId });
      setData(res.data);
    } catch {
      setData({ error: true });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!data || !userId) return;
    try {
      await createFlashcard({
        user_id: Number(userId),
        original_text: data.original_text || popup.text,
        translated_text: data.translated_text,
        explanation: data.explanation,
        example: data.example,
        example_translation: data.example_translation,
        ipa: data.ipa,
        word_type: data.word_type,
        text_type: 'word',
      });
      setSaved(true);
    } catch {}
  };

  if (!popup) return null;

  const typeColor = WORD_TYPE_COLORS[data?.word_type] || '#64748b';

  return (
    <div
      ref={popupRef}
      style={{
        position: 'absolute',
        left: Math.min(popup.x, window.innerWidth - 300),
        top: popup.y,
        zIndex: 99999,
        background: '#fff',
        borderRadius: 14,
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        border: '1px solid #e2e8f0',
        minWidth: 260,
        maxWidth: 320,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#1e293b', flex: 1 }}>"{popup.text}"</span>
        <button onClick={() => setPopup(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#94a3b8' }}>
          <X size={16} />
        </button>
      </div>

      <div style={{ padding: '12px 14px' }}>
        {!data && !loading && (
          <button
            onClick={handleTranslate}
            style={{ width: '100%', padding: '9px', borderRadius: 8, background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}
          >
            Dịch từ này
          </button>
        )}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '8px 0', color: '#64748b' }}>
            <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: 13 }}>Đang dịch...</span>
          </div>
        )}

        {data?.error && (
          <div style={{ color: '#ef4444', fontSize: 13, textAlign: 'center', padding: '4px 0' }}>
            Không thể dịch. Thử lại sau.
          </div>
        )}

        {data && !data.error && (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#1e293b' }}>{data.translated_text}</span>
              {data.ipa && <span style={{ fontSize: 12, color: '#94a3b8' }}>{data.ipa}</span>}
              {data.word_type && (
                <span style={{ fontSize: 11, fontWeight: 700, color: typeColor, background: typeColor + '18', padding: '2px 8px', borderRadius: 99 }}>
                  {data.word_type}
                </span>
              )}
            </div>
            {data.explanation && <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{data.explanation}</div>}
            {data.example && (
              <div style={{ fontSize: 12, background: '#f8fafc', borderRadius: 8, padding: '7px 10px', borderLeft: '3px solid #3b82f6', marginBottom: 10 }}>
                <div style={{ fontStyle: 'italic', color: '#334155' }}>{data.example}</div>
                {data.example_translation && <div style={{ color: '#94a3b8', marginTop: 3 }}>{data.example_translation}</div>}
              </div>
            )}

            {saved ? (
              <div style={{ textAlign: 'center', color: '#10b981', fontWeight: 700, fontSize: 13, padding: '6px 0' }}>
                ✓ Đã lưu vào flashcard!
              </div>
            ) : (
              <button
                onClick={handleSave}
                style={{
                  width: '100%', padding: '8px', borderRadius: 8, border: '2px solid #10b981',
                  background: '#fff', color: '#10b981', cursor: 'pointer', fontWeight: 700, fontSize: 13,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <BookmarkPlus size={15} /> Lưu vào Flashcard
              </button>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default HighlightTranslate;

import React, { useState, useRef, useEffect } from 'react';
import { Image, Upload, FileJson } from 'lucide-react';
import {
  createSection,
  createWritingQuestion,
  createSpeakingQuestion,
  uploadListeningJson,
  uploadListeningEtsJson,
  uploadReadingJson,
  uploadReadingEtsRcJson,
} from '../api';

const TOEIC_PARTS = {
  Speaking: [
    { value: 1, label: 'Part 1 - Read aloud' },
    { value: 2, label: 'Part 2 - Describe a picture' },
    { value: 3, label: 'Part 3 - Respond to questions' },
    { value: 4, label: 'Part 4 - Respond using information' },
    { value: 5, label: 'Part 5 - Express an opinion' }
  ],
  Writing: [
    { value: 1, label: 'Part 1 - Write a sentence based on a picture' },
    { value: 2, label: 'Part 2 - Respond to a written request' },
    { value: 3, label: 'Part 3 - Write an opinion essay' }
  ]
};

const getVisibleFields = (skill, part) => {
  if (skill === 'Writing') {
    if (part === 1) return ['question', 'image', 'image_describe', 'required_word_1', 'required_word_2'];
    if (part === 2) return ['passage', 'question', 'sample_answer'];
    if (part === 3) return ['question', 'sample_answer'];
    return ['question'];
  }

  if (skill === 'Speaking') {
    switch (part) {
      case 1: return ['direction', 'question', 'sample_answer'];
      case 2: return ['direction', 'image', 'image_describe', 'sample_answer'];
      case 3: return ['direction', 'question', 'information', 'sample_answer'];
      case 4: return ['direction', 'question', 'information', 'image', 'sample_answer'];
      case 5: return ['direction', 'question', 'sample_answer'];
      default: return [];
    }
  }
  return [];
};

const JSON_TEMPLATES = {
  Listening: [
    {
      passage: "Đoạn hội thoại hoặc bài nghe (tuỳ chọn)",
      question: "Câu hỏi nghe hiểu",
      audio_url: "https://example.com/audio.mp3",
      image_url: null,
      option_a: "Đáp án A",
      option_b: "Đáp án B",
      option_c: "Đáp án C",
      option_d: "Đáp án D",
      correct_answer: "A"
    }
  ],
  Reading: [
    {
      passage: "Đoạn văn đọc hiểu",
      question: "Câu hỏi đọc hiểu",
      option_a: "Đáp án A",
      option_b: "Đáp án B",
      option_c: "Đáp án C",
      option_d: "Đáp án D",
      correct_answer: "B"
    }
  ]
};

const isJsonSkill = (skill) => skill === 'Listening' || skill === 'Reading';

const UploadModal = ({ styles, setShowUploadModal, selectedSkill, onUploaded }) => {
  const [form, setForm] = useState({
    title: '',
    skill: 'Speaking',
    part: 1,
    duration: '',
    direction: '',
    question: '',
    passage: '',
    information: '',
    image_describe: '',
    sample_answer: '',
    required_word_1: '',
    required_word_2: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [jsonFile, setJsonFile] = useState(null);
  const [jsonParsed, setJsonParsed] = useState(null);   // raw parsed object
  const [jsonPreview, setJsonPreview] = useState(null); // flat questions array for display
  const [jsonIsEts, setJsonIsEts] = useState(false);    // true nếu là ETS format
  const [jsonIsEtsRc, setJsonIsEtsRc] = useState(false); // true nếu là ETS RC (Part 5/6/7)
  const [jsonError, setJsonError] = useState('');
  const [uploading, setUploading] = useState(false);

  const imageInputRef = useRef(null);
  const jsonInputRef = useRef(null);

  const [sectionsByPart, setSectionsByPart] = useState({});
  const sectionsByPartRef = useRef({});

  useEffect(() => {
    if (selectedSkill) {
      setForm(prev => ({ ...prev, skill: selectedSkill, part: 1 }));
      setImageFile(null);
      setJsonFile(null);
      setJsonParsed(null);
      setJsonPreview(null);
      setJsonIsEts(false);
      setJsonIsEtsRc(false);
      setJsonError('');
      sectionsByPartRef.current = {};
      setSectionsByPart({});
    }
  }, [selectedSkill]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.includes('image')) setImageFile(file);
    else alert('Vui lòng chọn file ảnh (JPG/PNG)');
  };

  const handleJsonSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setJsonError('Vui lòng chọn file .json');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);

        // Nhận diện ETS format: object có key "parts"
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.parts)) {
          const partNumbers = parsed.parts.map(p => p.part_number);
          const isRcFormat = partNumbers.some(n => n === 5 || n === 6 || n === 7);

          // Đếm tổng câu hỏi
          let totalQ = 0;
          if (isRcFormat) {
            // Part 5: flat questions; Part 6/7: passages → questions
            for (const p of parsed.parts) {
              if (p.part_number === 5) totalQ += p.questions?.length || 0;
              else {
                for (const passage of p.passages || []) {
                  totalQ += passage.questions?.length || 0;
                }
              }
            }
          } else {
            totalQ = parsed.parts.reduce((sum, p) => {
              const direct = p.questions?.length || 0;
              const conv = (p.conversations || []).reduce((s, c) => s + c.questions.length, 0);
              const talks = (p.talks || []).reduce((s, t) => s + t.questions.length, 0);
              return sum + direct + conv + talks;
            }, 0);
          }

          setJsonFile(file);
          setJsonParsed(parsed);
          setJsonPreview({ type: 'ets', parts: parsed.parts.length, total: totalQ, isRc: isRcFormat });
          setJsonIsEts(!isRcFormat);
          setJsonIsEtsRc(isRcFormat);
          setJsonError('');
          return;
        }

        // Custom format: mảng phẳng câu hỏi
        if (Array.isArray(parsed)) {
          setJsonFile(file);
          setJsonParsed(parsed);
          setJsonPreview({ type: 'custom', questions: parsed });
          setJsonIsEts(false);
          setJsonIsEtsRc(false);
          setJsonError('');
          return;
        }

        setJsonError('File JSON không hợp lệ. Phải là mảng [] hoặc định dạng ETS có key "parts".');
        setJsonFile(null);
        setJsonParsed(null);
        setJsonPreview(null);
      } catch {
        setJsonError('File JSON không hợp lệ. Vui lòng kiểm tra lại.');
        setJsonFile(null);
        setJsonParsed(null);
        setJsonPreview(null);
      }
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const template = JSON_TEMPLATES[form.skill] || [];
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template_${form.skill.toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUploadJson = async () => {
    if (!form.title || !form.duration) {
      alert('Vui lòng nhập Tên đề và Thời gian!');
      return;
    }
    if (!jsonParsed) {
      alert('Vui lòng chọn file JSON hợp lệ!');
      return;
    }

    setUploading(true);
    try {
      if (form.skill === 'Listening' && jsonIsEts) {
        await uploadListeningEtsJson({
          title: form.title,
          time_limit: Number(form.duration),
          ets_data: jsonParsed
        });
        alert(`Upload ETS Listening thành công ${jsonPreview.total} câu hỏi (${jsonPreview.parts} parts)!`);
      } else if (form.skill === 'Listening') {
        await uploadListeningJson({
          title: form.title,
          time_limit: Number(form.duration),
          questions: jsonParsed
        });
        alert(`Upload thành công ${jsonParsed.length} câu hỏi Listening!`);
      } else if (form.skill === 'Reading' && jsonIsEtsRc) {
        // TOEIC RC format (Part 5/6/7)
        await uploadReadingEtsRcJson({
          title: form.title,
          time_limit: Number(form.duration),
          parts: jsonParsed.parts
        });
        alert(`Upload ETS RC thành công ${jsonPreview.total} câu hỏi (${jsonPreview.parts} parts)!`);
      } else {
        await uploadReadingJson({
          title: form.title,
          time_limit: Number(form.duration),
          questions: Array.isArray(jsonParsed) ? jsonParsed : []
        });
        alert(`Upload thành công ${Array.isArray(jsonParsed) ? jsonParsed.length : 0} câu hỏi Reading!`);
      }

      setJsonFile(null);
      setJsonParsed(null);
      setJsonPreview(null);
      setJsonIsEts(false);
      setJsonIsEtsRc(false);
      onUploaded?.();
      setShowUploadModal(false);
    } catch (err) {
      console.error('Upload JSON error:', err);
      alert('Upload thất bại! Kiểm tra console.');
    } finally {
      setUploading(false);
    }
  };

  // ====== Speaking / Writing form logic ======

  const getOrCreateSectionForPart = async (part) => {
    const partNum = Number(part);
    if (sectionsByPartRef.current[partNum]) return sectionsByPartRef.current[partNum];

    const sectionPayload = {
      skill: form.skill.toLowerCase(),
      time_limit: Number(form.duration),
      name: `${form.title} - Part ${partNum}`,
      part: partNum
    };

    const sectionRes = await createSection(sectionPayload);
    const sectionId = sectionRes.data.id;

    sectionsByPartRef.current[partNum] = sectionId;
    setSectionsByPart(prev => ({ ...prev, [partNum]: sectionId }));
    return sectionId;
  };

  const uploadQuestion = async () => {
    const currentPart = Number(form.part);
    const sectionId = await getOrCreateSectionForPart(currentPart);

    const fd = new FormData();
    fd.append('section_id', sectionId);
    fd.append('part', String(form.part));
    fd.append('question', form.question || '');
    fd.append('passage', form.passage || '');
    fd.append('direction', form.direction || '');
    fd.append('information', form.information || '');
    fd.append('sample_answer', form.sample_answer || '');
    fd.append('image_describe', form.image_describe || '');
    fd.append('required_word_1', form.required_word_1 || '');
    fd.append('required_word_2', form.required_word_2 || '');

    if (imageFile) fd.append('image', imageFile);

    if (form.skill === 'Speaking') {
      await createSpeakingQuestion(fd);
    } else {
      await createWritingQuestion(fd);
    }
  };

  const resetQuestionFields = () => {
    setForm(prev => ({
      ...prev,
      direction: '',
      question: '',
      passage: '',
      information: '',
      image_describe: '',
      sample_answer: '',
      required_word_1: '',
      required_word_2: ''
    }));
    setImageFile(null);
  };

  const handleSaveAndContinue = async () => {
    if (!form.title || !form.duration) {
      alert('Vui lòng nhập Tên đề và Thời gian!');
      return;
    }
    try {
      await uploadQuestion();
      alert('Đã lưu câu hỏi! Nhập câu tiếp theo');
      resetQuestionFields();
      onUploaded?.();
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload thất bại! Kiểm tra console.');
    }
  };

  const handleFinishPart = async () => {
    if (!form.title || !form.duration) {
      alert('Vui lòng nhập Tên đề và Thời gian!');
      return;
    }
    try {
      await uploadQuestion();
      alert(`Đã hoàn tất Part ${form.part}!`);
      resetQuestionFields();
      onUploaded?.();
    } catch (err) {
      console.error('Finish part error:', err);
      alert('Lưu part thất bại!');
    }
  };

  const visibleFields = getVisibleFields(form.skill, Number(form.part));
  const useJsonUpload = isJsonSkill(form.skill);

  return (
    <div style={styles.modal}>
      <div style={styles.modalContent}>
        <button style={styles.closeButton} onClick={() => setShowUploadModal(false)}>×</button>
        <h2 style={styles.modalTitle}>Upload Đề TOEIC</h2>

        <div style={styles.formGroup}>
          <label style={styles.label}>Title</label>
          <input name="title" value={form.title} onChange={handleChange} style={styles.inputField} />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Skill</label>
          <select name="skill" value={form.skill} onChange={handleChange} style={styles.inputField}>
            <option>Speaking</option>
            <option>Writing</option>
            <option>Listening</option>
            <option>Reading</option>
          </select>
        </div>

        {!useJsonUpload && (
          <div style={styles.formGroup}>
            <label style={styles.label}>Part TOEIC</label>
            <select name="part" value={form.part} onChange={handleChange} style={styles.inputField}>
              {TOEIC_PARTS[form.skill].map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        )}

        <div style={styles.formGroup}>
          <label style={styles.label}>Time (minutes)</label>
          <input type="number" name="duration" value={form.duration} onChange={handleChange} style={styles.inputField} />
        </div>

        {/* ===== JSON Upload UI cho Listening / Reading ===== */}
        {useJsonUpload && (
          <>
            <div style={styles.formGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={styles.label}>Upload file JSON câu hỏi</label>
                <button
                  onClick={downloadTemplate}
                  style={{
                    fontSize: 12,
                    color: '#4f46e5',
                    background: 'none',
                    border: '1px solid #4f46e5',
                    borderRadius: 6,
                    padding: '3px 10px',
                    cursor: 'pointer'
                  }}
                >
                  Tải template JSON
                </button>
              </div>

              <div
                style={{
                  border: '2px dashed #c7d2fe',
                  borderRadius: 10,
                  padding: '24px 16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: jsonFile ? '#eef2ff' : '#f8fafc',
                  transition: 'all 0.2s'
                }}
                onClick={() => jsonInputRef.current.click()}
              >
                <FileJson size={32} color={jsonFile ? '#4f46e5' : '#94a3b8'} style={{ margin: '0 auto 8px' }} />
                {jsonFile ? (
                  <p style={{ color: '#4f46e5', fontWeight: 600 }}>{jsonFile.name}</p>
                ) : (
                  <p style={{ color: '#94a3b8' }}>Click để chọn file .json</p>
                )}
                {jsonPreview && jsonPreview.type === 'ets' && jsonPreview.isRc && (
                  <p style={{ color: '#10b981', fontSize: 13, marginTop: 4 }}>
                    ✓ TOEIC RC format — {jsonPreview.parts} parts — {jsonPreview.total} câu hỏi
                  </p>
                )}
                {jsonPreview && jsonPreview.type === 'ets' && !jsonPreview.isRc && (
                  <p style={{ color: '#10b981', fontSize: 13, marginTop: 4 }}>
                    ✓ ETS format — {jsonPreview.parts} parts — {jsonPreview.total} câu hỏi
                  </p>
                )}
                {jsonPreview && jsonPreview.type === 'custom' && (
                  <p style={{ color: '#10b981', fontSize: 13, marginTop: 4 }}>
                    ✓ Custom format — {jsonPreview.questions.length} câu hỏi
                  </p>
                )}
              </div>
              <input
                type="file"
                accept=".json"
                ref={jsonInputRef}
                style={{ display: 'none' }}
                onChange={handleJsonSelect}
              />

              {jsonError && (
                <p style={{ color: '#ef4444', fontSize: 13, marginTop: 6 }}>{jsonError}</p>
              )}
            </div>

            {jsonPreview && jsonPreview.type === 'ets' && !jsonPreview.isRc && (
              <div style={{
                backgroundColor: '#eff6ff', border: '1px solid #93c5fd',
                borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13
              }}>
                <strong style={{ color: '#1d4ed8' }}>ETS Listening — Preview các parts:</strong>
                <div style={{ marginTop: 6, color: '#374151' }}>
                  {jsonParsed?.parts?.map(p => {
                    const direct = p.questions?.length || 0;
                    const conv = (p.conversations || []).reduce((s, c) => s + c.questions.length, 0);
                    const talks = (p.talks || []).reduce((s, t) => s + t.questions.length, 0);
                    return (
                      <div key={p.part_number}>
                        <b>Part {p.part_number}</b>: {p.title} — {direct + conv + talks} câu
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {jsonPreview && jsonPreview.type === 'ets' && jsonPreview.isRc && (
              <div style={{
                backgroundColor: '#f0fdf4', border: '1px solid #86efac',
                borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13
              }}>
                <strong style={{ color: '#166534' }}>ETS Reading RC — Preview các parts:</strong>
                <div style={{ marginTop: 6, color: '#374151' }}>
                  {jsonParsed?.parts?.map(p => {
                    let count = 0;
                    if (p.part_number === 5) count = p.questions?.length || 0;
                    else count = (p.passages || []).reduce((s, ps) => s + (ps.questions?.length || 0), 0);
                    return (
                      <div key={p.part_number}>
                        <b>Part {p.part_number}</b>: {p.title} — {count} câu
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {jsonPreview && jsonPreview.type === 'custom' && jsonPreview.questions.length > 0 && (
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #86efac',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 12,
                fontSize: 13
              }}>
                <strong style={{ color: '#166534' }}>Preview câu đầu tiên:</strong>
                <div style={{ marginTop: 6, color: '#374151' }}>
                  <div><b>Q:</b> {jsonPreview.questions[0].question}</div>
                  <div><b>A:</b> {jsonPreview.questions[0].option_a} &nbsp;|&nbsp; <b>B:</b> {jsonPreview.questions[0].option_b}</div>
                  <div><b>Correct:</b> {jsonPreview.questions[0].correct_answer}</div>
                </div>
              </div>
            )}

            <div style={styles.modalButtons}>
              <button
                style={{ ...styles.button, ...styles.buttonPrimary, opacity: uploading ? 0.6 : 1 }}
                onClick={handleUploadJson}
                disabled={uploading}
              >
                <Upload size={16} style={{ marginRight: 6 }} />
                {uploading
                  ? 'Đang upload...'
                  : jsonPreview?.type === 'ets' && jsonPreview?.isRc
                    ? `Upload TOEIC RC — ${jsonPreview.total} câu hỏi`
                    : jsonPreview?.type === 'ets'
                      ? `Upload ETS — ${jsonPreview.total} câu hỏi`
                      : `Upload ${jsonPreview?.questions?.length || 0} câu hỏi`
                }
              </button>
            </div>
          </>
        )}

        {/* ===== Form fields cho Speaking / Writing ===== */}
        {!useJsonUpload && (
          <>
            {visibleFields.includes('direction') && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Direction</label>
                <textarea name="direction" value={form.direction} onChange={handleChange} style={styles.inputField} />
              </div>
            )}
            {visibleFields.includes('passage') && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Passage / Email</label>
                <textarea name="passage" value={form.passage || ''} onChange={handleChange} style={styles.inputField} />
              </div>
            )}
            {visibleFields.includes('question') && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Question</label>
                <textarea name="question" value={form.question || ''} onChange={handleChange} style={styles.inputField} />
              </div>
            )}
            {visibleFields.includes('information') && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Information</label>
                <textarea name="information" value={form.information || ''} onChange={handleChange} style={styles.inputField} />
              </div>
            )}
            {visibleFields.includes('sample_answer') && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Sample Answer</label>
                <textarea name="sample_answer" value={form.sample_answer} onChange={handleChange} style={styles.inputField} />
              </div>
            )}
            {visibleFields.includes('required_word_1') && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Required word 1</label>
                <input name="required_word_1" value={form.required_word_1} onChange={handleChange} style={styles.inputField} />
              </div>
            )}
            {visibleFields.includes('required_word_2') && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Required word 2</label>
                <input name="required_word_2" value={form.required_word_2} onChange={handleChange} style={styles.inputField} />
              </div>
            )}
            {visibleFields.includes('image') && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Upload image</label>
                <div style={styles.uploadArea} onClick={() => imageInputRef.current.click()}>
                  <Image size={24} />
                  <p>{imageFile ? imageFile.name : 'Click để chọn ảnh'}</p>
                </div>
                <input type="file" accept="image/*" ref={imageInputRef} style={{ display: 'none' }} onChange={handleImageSelect} />
              </div>
            )}
            {visibleFields.includes('image_describe') && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Describe image</label>
                <textarea name="image_describe" value={form.image_describe || ''} onChange={handleChange} style={styles.inputField} />
              </div>
            )}

            <div style={styles.modalButtons}>
              <button style={{ ...styles.button, ...styles.buttonSecondary }} onClick={handleFinishPart}>
                Hoàn tất Part {form.part}
              </button>
              <button style={{ ...styles.button, ...styles.buttonPrimary }} onClick={handleSaveAndContinue}>
                Lưu & Thêm câu tiếp
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UploadModal;

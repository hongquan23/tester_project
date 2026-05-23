import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { Mic, ArrowLeft, ArrowRight } from 'lucide-react';
import Dashboard from './Dashboard';
import SpeakingTests from './Speaking';
import WritingTests from './Writing';
import ListeningTests from './Listening';
import ReadingTests from './Reading';
import styles from './styles';
import Profile from './Profile';
import ContestPage from './ContestPage';
import Course from './Course';
import History from './History';
import ChatBot from './ChatBot';
import {
  getSpeakingTests, getWritingTests, getListeningTests, getReadingTests,
  getWritingBySection, getSpeakingBySection, getListeningBySection, getReadingBySection,
  scoreWritingQ1_5, scoreWritingQ6_7, scoreWritingQ8,
  scoreSpeakingQ1_2, scoreSpeakingQ3_4, scoreSpeakingQ5_7, scoreSpeakingQ8_10, scoreSpeakingQ11,
  submitMcqAnswers, getUser, getWeakAreas,
} from "../api";
import ExamResult from '../admin/ExamResult';
import { Search, Star, Eye, Clock, ChevronDown, BookOpen, Crown, TrendingUp, Facebook, Youtube, Mail, Phone } from 'lucide-react';

const skills = [
  { id: 'listening', name: 'Listening', icon: '🎧', color: '#3b82f6', disabled: false },
  { id: 'reading', name: 'Reading', icon: '📖', color: '#10b981', disabled: false },
  { id: 'writing', name: 'Writing', icon: '✍️', color: '#8b5cf6', disabled: false },
  { id: 'speaking', name: 'Speaking', icon: '🎤', color: '#f97316', disabled: false }
];
const mapAPIQuestionToUIFormat = (apiQuestion, skill, part) => {
  const baseQuestion = {
    id: apiQuestion.id,
    part: Number(part),
    ...apiQuestion
  };

  if (skill === 'Speaking') {
    let questionType = '';
    let prepTime = 30;
    let responseTime = 30;

    switch(Number(part)) {
      case 1:
        questionType = 'Read a Short Text Aloud';
        prepTime = 25;
        responseTime = 30;
        break;
      case 2:
        questionType = 'Describe a Photograph';
        prepTime = 30;
        responseTime = 30;
        break;
      case 3:
        questionType = 'Respond to questions';
        prepTime = 15;
        responseTime = 30;
        break;
      case 4:
        questionType = 'Respond using information';
        prepTime = 30;
        responseTime = 30;
        break;
      case 5:
        questionType = 'Express an opinion';
        prepTime = 60;
        responseTime = 60;
        break;
      default:
        questionType = 'Speaking Question';
    }

    const rawImage = apiQuestion.image_url || apiQuestion.image;
    return {
      ...baseQuestion,
      type: questionType,
      prepTime,
      responseTime,
      text: apiQuestion.question || '',
      direction: apiQuestion.direction || '',
      instruction: apiQuestion.direction || apiQuestion.question || '',
      image: rawImage
        ? (rawImage.startsWith('http')
          ? rawImage
          : `http://localhost:8000${rawImage.startsWith('/') ? '' : '/'}${rawImage}`)
        : null,
      image_describe: apiQuestion.image_describe || '',
      information: apiQuestion.information || '',
      sample_answer: apiQuestion.sample_answer || '',
      required_word_1: apiQuestion.required_word_1 || '',
      required_word_2: apiQuestion.required_word_2 || ''
    };
  }

  if (skill === 'Writing') {
    let questionType = '';
    let timeLimit = 120;

    switch(Number(part)) {
      case 1:
        questionType = 'Write a Sentence';
        timeLimit = 90;
        break;
      case 2:
        questionType = 'Respond to a written request';
        timeLimit = 600;
        break;
      case 3:
        questionType = 'Write an opinion essay';
        timeLimit = 600;
        break;
      default:
        questionType = 'Writing Question';
    }

    const rawImage = apiQuestion.image_url || apiQuestion.image;
    return {
      ...baseQuestion,
      type: questionType,
      timeLimit,
      question: apiQuestion.question || '',
      instruction: apiQuestion.question || '',
      passage: apiQuestion.passage || '',
      image: rawImage
        ? (rawImage.startsWith('http')
          ? rawImage
          : `http://localhost:8000${rawImage.startsWith('/') ? '' : '/'}${rawImage}`)
        : null,
      image_describe: apiQuestion.image_describe || '',
      sample_answer: apiQuestion.sample_answer || ''
    };
  }

  if (skill === 'Listening') {
    return {
      ...baseQuestion,
      type: 'Listening Question',
      question: apiQuestion.question || '',
      passage: apiQuestion.passage || '',
      audio_url: apiQuestion.audio_url || null,
      image_url: apiQuestion.image_url || null,
      graphic_url: apiQuestion.graphic_url || null,
      question_number: apiQuestion.question_number || null,
      option_a: apiQuestion.option_a || '',
      option_b: apiQuestion.option_b || '',
      option_c: apiQuestion.option_c || '',
      option_d: apiQuestion.option_d || null,
      correct_answer: apiQuestion.correct_answer || '',
    };
  }

  if (skill === 'Reading') {
    return {
      ...baseQuestion,
      type: 'Reading Question',
      question: apiQuestion.question || '',
      passage: apiQuestion.passage || '',
      question_number: apiQuestion.question_number || null,
      part_number: apiQuestion.part_number || null,
      passage_id: apiQuestion.passage_id || null,
      passage_title: apiQuestion.passage_title || '',
      sentence: apiQuestion.sentence || '',
      option_a: apiQuestion.option_a || '',
      option_b: apiQuestion.option_b || '',
      option_c: apiQuestion.option_c || '',
      option_d: apiQuestion.option_d || null,
      correct_answer: apiQuestion.correct_answer || '',
    };
  }

  return baseQuestion;
};

const ToeicMember = () => {
  const [audioAnswers, setAudioAnswers] = useState({});
  const [audioBlob, setAudioBlob] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestionInSection, setCurrentQuestionInSection] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredSkill, setHoveredSkill] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [answers, setAnswers] = useState({});
  const [examSubView, setExamSubView] = useState("question"); 
  const [submittedQuestion, setSubmittedQuestion] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [speakingTestsData, setSpeakingTestsData] = useState([]);
  const [writingTestsData, setWritingTestsData] = useState([]);
  const [listeningTestsData, setListeningTestsData] = useState([]);
  const [readingTestsData, setReadingTestsData] = useState([]);
  const [examResult, setExamResult] = useState(null);
  const [examAttemptKey, setExamAttemptKey] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const allTests = [...speakingTestsData, ...writingTestsData, ...listeningTestsData, ...readingTestsData];
  const resetExamState = () => {
    setExamSubView("question");
    setSubmittedQuestion(null);
    setAnswers({});
  };
  const [isScoring, setIsScoring] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [audioURL, setAudioURL] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [weakAreas, setWeakAreas] = useState(null);
  const resetAudio = () => {
  setAudioBlob(null);
  setAudioURL(null);
  setIsRecording(false);
  setMediaRecorder(null);
  setSubmittedQuestion(null);
};
  
  const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
useEffect(() => {
  const userId = localStorage.getItem("user_id");
  if (!userId) return;
  getWeakAreas(userId)
    .then(res => setWeakAreas(res.data))
    .catch(() => {});
}, []);

useEffect(() => {


  const path = location.pathname;

  if (path === "/member") {
    navigate("/member/dashboard", { replace: true });
    return;
  }

  if (path.endsWith("/dashboard")) setActiveView("dashboard");
  else if (path.endsWith("/speaking")) setActiveView("speaking");
  else if (path.endsWith("/writing")) setActiveView("writing");
  else if (path.endsWith("/listening")) setActiveView("listening");
  else if (path.endsWith("/reading")) setActiveView("reading");
  else if (path.endsWith("/exam")) setActiveView("exam");
  else if (path.endsWith("/profile")) setActiveView("profile");
  else if (path.endsWith("/contest")) setActiveView("ContestPage");
  else if (path.endsWith("/course")) setActiveView("course");
  else if (path.endsWith("/history")) setActiveView("history");

}, [location.pathname]);

useEffect(() => {
  
  fetchTests();
}, []);
useEffect(() => {
  const loadUserInfo = async () => {
    try {
      const userId = localStorage.getItem("user_id");
      
      if (!userId) {
        console.warn("Không tìm thấy user_id trong localStorage");
        setLoadingUser(false);
        return;
      }

      // Gọi API getUser
      const response = await getUser(userId);
      console.log("User info:", response.data);
      
      // Lưu vào state
      setCurrentUser(response.data);
      setLoadingUser(false);
    } catch (error) {
      console.error("Lỗi load user info:", error);
      setLoadingUser(false);
    }
  };

  loadUserInfo();
}, []);
useEffect(() => {
  if (location.pathname.endsWith("/exam")) {
    const savedTest = localStorage.getItem("currentExam");
    if (savedTest) {
      resetExamState();
      const parsed = JSON.parse(savedTest);
      setSelectedTest(parsed);
      setActiveView("exam");
    } else {
      navigate("/member/dashboard");
    }
  }
}, [location.pathname]);
useEffect(() => {
  const q = getCurrentQuestion();
  if (!q) return;

  const saved = audioAnswers[q.id];

  if (saved) {
    setAudioBlob(saved.blob);
    setAudioURL(saved.url);
  } else {
    setAudioBlob(null);
    setAudioURL(null);
  }
}, [currentQuestionInSection, audioAnswers, selectedTest]);
const fetchTests = async () => {
  try {
    // ===== SPEAKING =====
    const speakingRes = await getSpeakingTests();
    const groupedSpeaking = {};
    
    for (const section of speakingRes.data || []) {
      const baseName = section.name?.replace(/\s*-\s*Part\s*\d+\s*$/i, '').trim() || 'Untitled Test';
      
      if (!groupedSpeaking[baseName]) {
        groupedSpeaking[baseName] = {
          id: `speaking-${baseName}`,
          title: baseName,
          name: baseName,
          skill: 'Speaking',
          type: 'TOEIC Bridge',
          duration: section.time_limit || 15,
          views: 0,
          comments: 0,
          attempt_count: section.attempt_count || 0,
          sections: [],
          questions: []
        };
      }
      
      try {
        const qRes = await getSpeakingBySection(section.id);
        const part = section.part || parseInt(section.name?.match(/Part\s*(\d+)/i)?.[1]) || 1;
        
        const mappedQuestions = (qRes.data || []).map(q => 
          mapAPIQuestionToUIFormat(q, 'Speaking', part)
        );
        
        groupedSpeaking[baseName].sections.push({
          id: section.id,
          name: section.name,
          title: section.name,
          part: part,
          questions: mappedQuestions
        });
        
        groupedSpeaking[baseName].questions.push(...mappedQuestions);
      } catch (e) {
        console.error('Lỗi load speaking section:', e);
      }
    }

    // ===== WRITING =====
    const writingRes = await getWritingTests();
    const groupedWriting = {};
    
    for (const section of writingRes.data || []) {
      const baseName = section.name?.replace(/\s*-\s*Part\s*\d+\s*$/i, '').trim() || 'Untitled Test';
      
      if (!groupedWriting[baseName]) {
        groupedWriting[baseName] = {
          id: `writing-${baseName}`,
          title: baseName,
          name: baseName,
          skill: 'Writing',
          type: 'TOEIC Bridge',
          duration: section.time_limit || 37,
          views: 0,
          comments: 0,
          attempt_count: section.attempt_count || 0,
          sections: [],
          questions: []
        };
      }
      
      try {
        const qRes = await getWritingBySection(section.id);
        const part = section.part || parseInt(section.name?.match(/Part\s*(\d+)/i)?.[1]) || 1;
        
        const mappedQuestions = (qRes.data || []).map(q => 
          mapAPIQuestionToUIFormat(q, 'Writing', part)
        );
        
        groupedWriting[baseName].sections.push({
          id: section.id,
          name: section.name,
          title: section.name,
          part: part,
          questions: mappedQuestions
        });
        
        groupedWriting[baseName].questions.push(...mappedQuestions);
      } catch (e) {
        console.error('Lỗi load writing section:', e);
      }
    }

    // ===== LISTENING =====
    const listeningRes = await getListeningTests();
    const groupedListening = {};
    for (const section of listeningRes.data || []) {
      const baseName = section.name?.trim() || 'Untitled Test';
      if (!groupedListening[baseName]) {
        groupedListening[baseName] = {
          id: `listening-${baseName}`, section_id: section.id,
          title: baseName, name: baseName, skill: 'Listening',
          duration: section.time_limit || 45, views: 0, comments: 0,
          attempt_count: section.attempt_count || 0,
          sections: [], questions: []
        };
      }
      try {
        const qRes = await getListeningBySection(section.id);
        const mapped = (qRes.data || []).map(q => mapAPIQuestionToUIFormat(q, 'Listening', 1));
        groupedListening[baseName].sections.push({ id: section.id, name: section.name, questions: mapped });
        groupedListening[baseName].questions.push(...mapped);
      } catch (e) { console.error('Lỗi load listening section:', e); }
    }

    // ===== READING =====
    const readingRes = await getReadingTests();
    const groupedReading = {};
    for (const section of readingRes.data || []) {
      const baseName = section.name?.trim() || 'Untitled Test';
      if (!groupedReading[baseName]) {
        groupedReading[baseName] = {
          id: `reading-${baseName}`, section_id: section.id,
          title: baseName, name: baseName, skill: 'Reading',
          duration: section.time_limit || 75, views: 0, comments: 0,
          attempt_count: section.attempt_count || 0,
          sections: [], questions: []
        };
      }
      try {
        const qRes = await getReadingBySection(section.id);
        // Use part_number from question itself if available (RC format), else default 1
        const mapped = (qRes.data || []).map(q => mapAPIQuestionToUIFormat(q, 'Reading', q.part_number || 1));
        groupedReading[baseName].sections.push({ id: section.id, name: section.name, questions: mapped });
        groupedReading[baseName].questions.push(...mapped);
      } catch (e) { console.error('Lỗi load reading section:', e); }
    }

    setSpeakingTestsData(Object.values(groupedSpeaking));
    setWritingTestsData(Object.values(groupedWriting));
    setListeningTestsData(Object.values(groupedListening));
    setReadingTestsData(Object.values(groupedReading));
  } catch (err) {
    console.error("Lỗi load test:", err);
    alert('Không thể tải dữ liệu. Vui lòng thử lại!');
  }
};

  useEffect(() => {
    if (activeView === 'exam' && selectedTest) {
      const minutes = selectedTest.duration;
      const seconds = minutes * 60;
      setTimeRemaining(seconds);
      setIsTimeUp(false); // Reset trạng thái
      
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsTimeUp(true); // ⭐ Đánh dấu hết giờ
            
            // ⭐ Hiển thị thông báo
            alert('⏰ HẾT GIỜ LÀM BÀI!\n\nBài thi đã kết thúc. Bạn không thể làm bài nữa.');
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [activeView, selectedTest, examAttemptKey]);

  const startRecording = async (maxDurationSec) => {
    setSubmittedQuestion(null);
    setAudioBlob(null);
    setAudioURL(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Trình duyệt không hỗ trợ ghi âm!');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);

        setAudioBlob(blob);
        setAudioURL(url);

        const q = getCurrentQuestion();
        if (q) {
          setAudioAnswers(prev => ({
            ...prev,
            [q.id]: { blob, url }
          }));
        }
        setIsRecording(false);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);

      if (maxDurationSec && maxDurationSec > 0) {
        setTimeout(() => {
          if (recorder.state !== 'inactive') {
            recorder.stop();
          }
        }, maxDurationSec * 1000);
      }
    } catch (err) {
      console.error(err);
      alert('Không thể truy cập micro!');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  };

  const isMcqSkill = (skill) => skill === 'Listening' || skill === 'Reading';

  const handleSkillClick = (skill) => {
    if (skill.disabled) {
      alert(`Kỹ năng ${skill.name} đang được phát triển!`);
      return;
    }
    setSelectedSkill(skill.id);
    const routes = { speaking: "/member/speaking", writing: "/member/writing", listening: "/member/listening", reading: "/member/reading" };
    if (routes[skill.id]) { setActiveView(skill.id); navigate(routes[skill.id]); }
  };

  const handleProfileClick = () => {
  setActiveView("profile");
  navigate("/member/profile");
};

const handleContestClick = () => {
  setActiveView("ContestPage");
  navigate("/member/contest");
};

const handleCourseClick = () => {
  setActiveView("course");
  navigate("/member/course");
}

const handleHistoryClick = () => {
  setActiveView("history");
  navigate("/member/history");
};

  const handleTestClick = (test) => {
    resetExamState();
    setSelectedTest(test);
    localStorage.setItem("currentExam", JSON.stringify(test));
    setCurrentSection(0);
    setCurrentQuestionInSection(0);
    setAnswers({});
    setExamResult(null);
    resetAudio();
    setActiveView("exam");
    navigate("/member/exam");
  };

  const handleLogout = () => {
  // Xóa tất cả thông tin user
  localStorage.removeItem("access_token");
  localStorage.removeItem("role");
  localStorage.removeItem("user_id");
  localStorage.removeItem("currentExam");
  
  setCurrentUser(null);
  navigate("/");
  };

  const getCurrentQuestion = () => {
    if (!selectedTest?.questions) return null;
    return selectedTest.questions[currentQuestionInSection];
  };
  const handleNextQuestion = () => {
  if (!selectedTest?.questions) return;

  if (currentQuestionInSection < selectedTest.questions.length - 1) {
    setCurrentQuestionInSection(currentQuestionInSection + 1);
    setExamSubView("question");
    setSubmittedQuestion(null);
  }
};

const handlePrevQuestion = () => {
  if (!selectedTest?.questions) return;

  if (currentQuestionInSection > 0) {
    setCurrentQuestionInSection(currentQuestionInSection - 1);
    setExamSubView("question");
    setSubmittedQuestion(null);
  }
};
const submitSpeaking = async (question) => {
  if (!audioBlob) {
    alert("Bạn chưa ghi âm!");
    return;
  }

  try {
    setIsScoring(true);

    const formData = new FormData();
    formData.append("audio", audioBlob);

    const part = Number(question.part);
    let res = null;

    switch (part) {
      case 1:
        formData.append("reference_text", question.text || "");
        res = await scoreSpeakingQ1_2(formData);
        break;

      case 2:
        formData.append("image_description", question.image_describe || "");
        res = await scoreSpeakingQ3_4(formData);
        break;

      case 3:
        formData.append("question", question.text || "");
        res = await scoreSpeakingQ5_7(formData);
        break;

      case 4:
        formData.append("information", question.information || "");
        formData.append("question", question.text || "");
        res = await scoreSpeakingQ8_10(formData);
        break;

      case 5:
        formData.append("question", question.text || "");
        res = await scoreSpeakingQ11(formData);
        break;

      default:
        alert("Không xác định Part Speaking");
        return;
    }

    if (!res || !res.data) {
      alert("API không trả kết quả!");
      return;
    }

    setSubmittedQuestion({
      question,
      transcript: res.data.transcript || "",
      feedback: res.data.feedback || res.data.evaluation || "",
      audioURL
    });

    setExamSubView("result");

  } catch (err) {
  console.error("API ERROR:", err?.response?.data || err.message || err);
  alert("Lỗi gửi Speaking!");
  } finally {
    setIsScoring(false);
  }
};

 const handleSubmitExam = async () => {
    if (!selectedTest || !isMcqSkill(selectedTest.skill)) return;
    const total = selectedTest.questions.length;
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < total) {
      const ok = window.confirm(`Bạn còn ${total - answeredCount} câu chưa trả lời. Vẫn nộp bài?`);
      if (!ok) return;
    }
    try {
      const userId = localStorage.getItem("user_id");
      const res = await submitMcqAnswers({
        user_id: Number(userId),
        section_id: selectedTest.section_id,
        skill: selectedTest.skill.toLowerCase(),
        answers,
      });
      const timeTaken = selectedTest.duration * 60 - (timeRemaining ?? 0);
      setExamResult({ ...res.data, questions: selectedTest.questions, timeTaken });
    } catch (err) {
      console.error("Submit error:", err);
      alert("Nộp bài thất bại!");
    }
  };

 const renderExamQuestion = () => {
   const question = getCurrentQuestion();
   if (!question) return null;
  const savedAudio = audioAnswers[question.id];
    if (!question) return null;

    const isSpeaking = selectedTest.skill === 'Speaking';
    const isWriting = selectedTest.skill === 'Writing';

const renderRecordControls = (responseTime, question) => {
  const savedAudio = audioAnswers[question.id];

  return (
    <>
        <button 
          disabled={isTimeUp} // ⭐ THÊM
          style={{
            ...styles.recordButton,
            backgroundColor: isTimeUp ? '#9ca3af' : (isRecording ? '#dc2626' : '#ef4444'), // ⭐ Màu xám khi hết giờ
            transform: isRecording ? 'scale(1.02)' : 'scale(1)',
            cursor: isTimeUp ? 'not-allowed' : 'pointer', // ⭐ THÊM
            opacity: isTimeUp ? 0.6 : 1, // ⭐ THÊM
          }}
          onClick={() => {
            if (isTimeUp) return; // ⭐ THÊM
            if (!isRecording) {
              startRecording(responseTime);
            } else {
              stopRecording();
            }
          }}
        >
        {isRecording && (
          <span style={{
            width: '6px',
            height: '6px',
            backgroundColor: '#fff',
            borderRadius: '50%',
            marginRight: '2px',
            display: 'inline-block',
            animation: 'blink 1s infinite'
          }} />
        )}

        <Mic size={14} strokeWidth={2.5} />
        <span>
          {isRecording ? 'DỪNG' : 'THU ÂM'}
        </span>
      </button>

      {savedAudio && (
        <div style={{ marginTop: '16px' }}>
          <audio controls src={savedAudio.url} />
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <button
          disabled={!audioBlob || isScoring || isTimeUp} // ⭐ Thêm isTimeUp
          style={{
            ...styles.submitBtn,
            ...(isScoring ? styles.submitBtnLoading : {}),
            ...((!audioBlob || isScoring || isTimeUp) ? styles.submitBtnDisabled : {}) // ⭐ Thêm isTimeUp
          }}
          onClick={() => submitSpeaking(question)}
        >
          {isScoring && <span style={styles.spinner} />}
          {isTimeUp ? "Hết giờ" : (isScoring ? "AI đang chấm..." : "Nộp câu này")} {/* ⭐ Thay đổi text */}
        </button>

        {!audioBlob && (
          <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '6px' }}>
            Bạn cần ghi âm trước khi nộp
          </div>
        )}
      </div>
    </>
  );
};
    // Speaking Questions
    if (isSpeaking) {
      if (question.type === 'Read a Short Text Aloud') {
        return (
          <div style={styles.questionContent}>
            <div style={styles.questionHeader}>
              <span style={styles.questionType}>{question.type}</span>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Preparation: {question.prepTime}s | Response: {question.responseTime}s
              </div>
            </div>

            {question.direction && (
              <div
                style={{
                  ...styles.questionText,
                  whiteSpace: 'pre-line',
                  backgroundColor: '#dbeafe',
                  border: '1px solid #3b82f6',
                  marginBottom: '12px',
                }}
              >
                <strong>Direction:</strong> {question.direction}
              </div>
            )}

            {question.sample_answer && (
              <div
                style={{
                  ...styles.questionText,
                  whiteSpace: 'pre-line',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #86efac',
                }}
              >
                <strong>📝 Sample Answer:</strong>
                <div
                  style={{
                    marginTop: '6px',
                    whiteSpace: 'pre-line',
                    color: '#166534',
                  }}
                >
                  {question.sample_answer}
                </div>
              </div>
            )}

            <div style={{ ...styles.questionText, whiteSpace: 'pre-line' }}>
              {question.text}
            </div>

            {renderRecordControls(question.responseTime, question)}
          </div>
        );
      }

      if (question.type === 'Describe a Photograph') {
        return (
          <div style={styles.questionContent}>
            <div style={styles.questionHeader}>
              <span style={styles.questionType}>{question.type}</span>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Preparation: {question.prepTime}s | Response: {question.responseTime}s
              </div>
            </div>

            {question.direction && (
              <div
                style={{
                  ...styles.questionText,
                  whiteSpace: 'pre-line',
                  backgroundColor: '#dbeafe',
                  border: '1px solid #3b82f6',
                  marginBottom: '12px',
                }}
              >
                <strong>Direction:</strong> {question.direction}
              </div>
            )}

            {question.image && question.image.trim() !== '' && (
              <img
                src={question.image}
                alt="Question"
                style={styles.examImage}
                onError={(e) => console.log('❌ Load ảnh lỗi:', question.image)}
              />
            )}

            {question.sample_answer && (
              <div
                style={{
                  ...styles.questionText,
                  whiteSpace: 'pre-line',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #86efac',
                }}
              >
                <strong>📝 Sample Answer:</strong>
                <div
                  style={{
                    marginTop: '6px',
                    whiteSpace: 'pre-line',
                    color: '#166534',
                  }}
                >
                  {question.sample_answer}
                </div>
              </div>
            )}

            {renderRecordControls(question.responseTime, question)}
          </div>
        );
      }

      if (question.type === 'Respond to questions') {
        return (
          <div style={styles.questionContent}>
            <div style={styles.questionHeader}>
              <span style={styles.questionType}>{question.type}</span>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Preparation: {question.prepTime}s | Response: {question.responseTime}s
              </div>
            </div>

            {question.direction && (
              <div
                style={{
                  ...styles.questionText,
                  whiteSpace: 'pre-line',
                  backgroundColor: '#dbeafe',
                  border: '1px solid #3b82f6',
                  marginBottom: '12px',
                }}
              >
                <strong>Direction:</strong> {question.direction}
              </div>
            )}

            {question.information && (
              <div
                style={{
                  ...styles.questionText,
                  whiteSpace: 'pre-line',
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fbbf24',
                  marginBottom: '12px',
                }}
              >
                <strong>Information:</strong> {question.information}
              </div>
            )}

            <div style={{ ...styles.questionText, whiteSpace: 'pre-line' }}>
              {question.text}
            </div>

            {question.sample_answer && (
              <div
                style={{
                  ...styles.questionText,
                  whiteSpace: 'pre-line',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #86efac',
                }}
              >
                <strong>📝 Sample Answer:</strong>
                <div
                  style={{
                    marginTop: '6px',
                    whiteSpace: 'pre-line',
                    color: '#166534',
                  }}
                >
                  {question.sample_answer}
                </div>
              </div>
            )}

            {renderRecordControls(question.responseTime, question)}
          </div>
        );
      }

      if (question.type === 'Respond using information') {
        return (
          <div style={styles.questionContent}>
            <div style={styles.questionHeader}>
              <span style={styles.questionType}>{question.type}</span>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Preparation: {question.prepTime}s | Response: {question.responseTime}s
              </div>
            </div>

            {question.direction && (
              <div
                style={{
                  ...styles.questionText,
                  whiteSpace: 'pre-line',
                  backgroundColor: '#dbeafe',
                  border: '1px solid #3b82f6',
                  marginBottom: '12px',
                }}
              >
                <strong>Direction:</strong> {question.direction}
              </div>
            )}

            {question.text && (
              <div style={{ ...styles.questionText, whiteSpace: 'pre-line' }}>
                {question.text}
              </div>
            )}

            {question.information && (
              <div
                style={{
                  ...styles.questionText,
                  whiteSpace: 'pre-line',
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fbbf24',
                  marginBottom: '12px',
                }}
              >
                <strong>Information:</strong> {question.information}
              </div>
            )}

            {question.image && question.image.trim() !== '' && (
              <img src={question.image} alt="Question" style={styles.examImage} />
            )}

            {question.sample_answer && (
              <div
                style={{
                  ...styles.questionText,
                  whiteSpace: 'pre-line',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #86efac',
                }}
              >
                <strong>📝 Sample Answer:</strong>
                <div
                  style={{
                    marginTop: '6px',
                    whiteSpace: 'pre-line',
                    color: '#166534',
                  }}
                >
                  {question.sample_answer}
                </div>
              </div>
            )}

            {renderRecordControls(question.responseTime, question)}
          </div>
        );
      }

      if (question.type === 'Express an opinion') {
        return (
          <div style={styles.questionContent}>
            <div style={styles.questionHeader}>
              <span style={styles.questionType}>{question.type}</span>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Preparation: {question.prepTime}s | Response: {question.responseTime}s
              </div>
            </div>

            {question.direction && (
              <div
                style={{
                  ...styles.questionText,
                  whiteSpace: 'pre-line',
                  backgroundColor: '#dbeafe',
                  border: '1px solid #3b82f6',
                  marginBottom: '12px',
                }}
              >
                <strong>Direction:</strong> {question.direction}
              </div>
            )}

            <div style={{ ...styles.questionText, whiteSpace: 'pre-line' }}>
              {question.text}
            </div>

            {question.sample_answer && (
              <div
                style={{
                  ...styles.questionText,
                  whiteSpace: 'pre-line',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #86efac',
                }}
              >
                <strong>📝 Sample Answer:</strong>
                <div
                  style={{
                    marginTop: '6px',
                    whiteSpace: 'pre-line',
                    color: '#166534',
                  }}
                >
                  {question.sample_answer}
                </div>
              </div>
            )}

            {renderRecordControls(question.responseTime, question)}
          </div>
        );
      }
    }
    // Writing Questions
    if (isWriting) {
      if (question.type === 'Write a Sentence') {
        const wordCount = answers[question.id]?.split(' ').filter(w => w).length || 0;

        return (
          <div style={styles.questionContent}>
            <div style={styles.questionHeader}>
              <span style={styles.questionType}>{question.type}</span>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Time limit: {question.timeLimit}s
              </div>
            </div>

            <div style={styles.questionText}>{question.instruction}</div>

            {question.image && question.image.trim() !== '' && (
              <img src={question.image} alt="Question" style={styles.examImage} />
            )}
            {(question.required_word_1 || question.required_word_2) && (
                <div style={{
                  background: "#fef9c3",
                  border: "1px solid #fde047",
                  padding: "10px",
                  borderRadius: "8px",
                  marginBottom: "12px",
                  fontSize: "14px"
                }}>
                  <b>Required words:</b>{" "}
                  <span style={{ color: "#92400e", fontWeight: 600 }}>
                    {question.required_word_1}
                  </span>
                  {question.required_word_2 && (
                    <>
                      {" , "}
                      <span style={{ color: "#92400e", fontWeight: 600 }}>
                        {question.required_word_2}
                      </span>
                    </>
                  )}
                </div>
              )}
              <textarea
                disabled={isTimeUp} // ⭐ THÊM
                style={{
                  ...styles.textarea,
                  cursor: isTimeUp ? 'not-allowed' : 'text', // ⭐ THÊM
                  opacity: isTimeUp ? 0.6 : 1, // ⭐ THÊM
                  backgroundColor: isTimeUp ? '#f3f4f6' : '#fff', // ⭐ THÊM
                }}
                placeholder={isTimeUp ? "Hết giờ làm bài" : "Write your sentence here..."}
                value={answers[question.id] || ''}
                onChange={(e) => {
                  if (isTimeUp) return; // ⭐ THÊM
                  setAnswers({ ...answers, [question.id]: e.target.value });
                }}
              />
            <div style={{ marginTop: '16px' }}>
              <button
                  disabled={isScoring || isTimeUp} // ⭐ Thêm isTimeUp
                  style={{
                    ...styles.submitBtn,
                    ...(isScoring ? styles.submitBtnLoading : {}),
                    ...((isScoring || isTimeUp) ? styles.submitBtnDisabled : {}) // ⭐ Thêm isTimeUp
                  }}
                onClick={async () => {
                      if (isTimeUp) {
                        alert("Hết giờ làm bài!");
                        return;
                      }
                  const studentSentence = (answers[question.id] || "").trim();
                  if (!studentSentence) {
                    alert("Bạn chưa nhập câu trả lời!");
                    return;
                  }

                  try {
                    setIsScoring(true);

                    const formData = new URLSearchParams();
                    formData.append("image_description", question.image_describe || "");
                    formData.append("required_word_1", question.required_word_1 || "");
                    formData.append("required_word_2", question.required_word_2 || "");
                    formData.append("student_sentence", studentSentence);

                    const res = await scoreWritingQ1_5(formData);

                    setSubmittedQuestion({
                      question,
                      answer: studentSentence,
                      feedback: res.data.feedback
                    });

                    setExamSubView("result");
                  } catch (err) {
                    console.error(err);
                    alert("Lỗi chấm điểm Writing!");
                  } finally {
                    setIsScoring(false);
                  }
                }}
              >
                {isScoring && <span style={styles.spinner} />}
                {isTimeUp ? "Hết giờ" : (isScoring ? "AI đang chấm..." : "Nộp câu này")}
              </button>
            </div>
            <div style={styles.wordCount}>Word count: {wordCount}</div>
          </div>
          
        );
      }
      if (question.type === 'Respond to a written request') {
        const wordCount = answers[question.id]?.split(' ').filter(w => w).length || 0;
        return (
          <div style={styles.questionContent}>
            <div style={styles.questionHeader}>
              <span style={styles.questionType}>{question.type}</span>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Time limit: {Math.floor((question.timeLimit || 0) / 60)} minutes
              </div>
            </div>
            {question.passage && (
              <div style={{
                ...styles.questionText,
                backgroundColor: '#eef2ff',
                border: '1px solid #6366f1',
                whiteSpace: 'pre-line'
              }}>
                <strong>Email / Request:</strong>
                <div style={{ marginTop: 6 }}>
                  {question.passage}
                </div>
              </div>
            )}
            <div style={styles.questionText}>{question.instruction || question.question}</div>
            {question.sample_answer && (
              <div style={{ ...styles.questionText, backgroundColor: '#f0fdf4', border: '1px solid #86efac' }}>
                <strong>📝 Sample Answer:</strong>
                <div style={{ marginTop: '6px', whiteSpace: 'pre-line', color: '#166534' }}>{question.sample_answer}</div>
              </div>
            )}
            <textarea
              disabled={isTimeUp} // ⭐ THÊM
              style={{
                ...styles.textarea,
                cursor: isTimeUp ? 'not-allowed' : 'text', // ⭐ THÊM
                opacity: isTimeUp ? 0.6 : 1, // ⭐ THÊM
                backgroundColor: isTimeUp ? '#f3f4f6' : '#fff', // ⭐ THÊM
              }}
              placeholder={isTimeUp ? "Hết giờ làm bài" : "Write your reponse here..."}
              value={answers[question.id] || ''}
              onChange={(e) => {
                if (isTimeUp) return; // ⭐ THÊM
                setAnswers({ ...answers, [question.id]: e.target.value });
              }}
            />
           <div style={{ marginTop: '16px' }}>
            <button
               disabled={isScoring || isTimeUp} // ⭐ Thêm isTimeUp
               style={{
                ...styles.submitBtn,
                ...(isScoring ? styles.submitBtnLoading : {}),
                ...((isScoring || isTimeUp) ? styles.submitBtnDisabled : {}) // ⭐ Thêm isTimeUp
               }}
              onClick={async () => {
                  if (isTimeUp) {
                  alert("Hết giờ làm bài!");
                  return;
                }
                const studentResponse = (answers[question.id] || "").trim();

                if (!studentResponse) {
                  alert("Bạn chưa nhập câu trả lời!");
                  return;
                }

                try {
                  setIsScoring(true);

                  const formData = new FormData();
                  formData.append("email_prompt", question.passage || "");
                  formData.append("directions", question.instruction || question.question || "");
                  formData.append("student_response", studentResponse);

                  const res = await scoreWritingQ6_7(formData);

                  setSubmittedQuestion({
                    question,
                    answer: studentResponse,
                    feedback: res.data.feedback || res.data
                  });

                  setExamSubView("result");
                } catch (err) {
                  console.error(err);
                  alert("Lỗi chấm điểm Writing Part 2!");
                } finally {
                  setIsScoring(false);
                }
              }}
            >
                {isScoring && <span style={styles.spinner} />}
                {isTimeUp ? "Hết giờ" : (isScoring ? "AI đang chấm..." : "Nộp câu này")}
            </button>
            </div>
            <div style={styles.wordCount}>Word count: {wordCount}</div>
          </div>
          
        );
      }

      if (question.type === 'Write an opinion essay') {
        const wordCount = answers[question.id]?.split(' ').filter(w => w).length || 0;
        return (
          <div style={styles.questionContent}>
            <div style={styles.questionHeader}>
              <span style={styles.questionType}>{question.type}</span>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Time limit: {Math.floor((question.timeLimit || 0) / 60)} minutes
              </div>
            </div>
            <div style={styles.questionText}>{question.instruction || question.question}</div>
            {question.sample_answer && (
              <div style={{ ...styles.questionText, backgroundColor: '#f0fdf4', border: '1px solid #86efac' }}>
                <strong>📝 Sample Answer:</strong>
                <div style={{ marginTop: '6px', whiteSpace: 'pre-line', color: '#166534' }}>{question.sample_answer}</div>
              </div>
            )}
              <textarea
                disabled={isTimeUp} // ⭐ THÊM
                style={{
                  ...styles.textarea,
                  cursor: isTimeUp ? 'not-allowed' : 'text', // ⭐ THÊM
                  opacity: isTimeUp ? 0.6 : 1, // ⭐ THÊM
                  backgroundColor: isTimeUp ? '#f3f4f6' : '#fff', // ⭐ THÊM
                }}
                placeholder={isTimeUp ? "Hết giờ làm bài" : "Write your essay here..."}
                value={answers[question.id] || ''}
                onChange={(e) => {
                  if (isTimeUp) return; // ⭐ THÊM
                  setAnswers({ ...answers, [question.id]: e.target.value });
                }}
              />
             <div style={{ marginTop: '16px' }}>
              <button
                  disabled={isScoring || isTimeUp} // ⭐ Thêm isTimeUp
                  style={{
                    ...styles.submitBtn,
                    ...(isScoring ? styles.submitBtnLoading : {}),
                    ...((isScoring || isTimeUp) ? styles.submitBtnDisabled : {}) // ⭐ Thêm isTimeUp
                  }}
                onClick={async () => {
                    if (isTimeUp) {
                        alert("Hết giờ làm bài!");
                        return;
                    }
                  const studentResponse = (answers[question.id] || "").trim();

                  if (!studentResponse) {
                    alert("Bạn chưa nhập bài viết!");
                    return;
                  }

                  try {
                    setIsScoring(true);

                    const formData = new FormData();
                    formData.append("question", question.question || "");
                    formData.append("student_response", studentResponse);

                    const res = await scoreWritingQ8(formData);

                    setSubmittedQuestion({
                      question,
                      feedback: res.data.feedback || res.data.evaluation || "",
                    });

                    setExamSubView("result");
                  } catch (err) {
                    console.error(err);
                    alert("Lỗi chấm điểm Writing Part 3!");
                  } finally {
                    setIsScoring(false);
                  }
                }}
              >
                  {isScoring && <span style={styles.spinner} />}
                  {isTimeUp ? "Hết giờ" : (isScoring ? "AI đang chấm..." : "Nộp câu này")}   
              </button>
            </div>
            <div style={styles.wordCount}>Word count: {wordCount}</div>
          </div>
          
        );
      }
    }

    // ──────────────────────────── Listening MCQ ────────────────────────────
    const isListening = selectedTest.skill === 'Listening';
    const isReading   = selectedTest.skill === 'Reading';

    if (isListening) {
      const options = [
        { key: 'A', value: question.option_a },
        { key: 'B', value: question.option_b },
        { key: 'C', value: question.option_c },
        { key: 'D', value: question.option_d },
      ].filter(o => o.value);
      const selected = answers[question.id];
      return (
        <div style={styles.questionContent}>
          <div style={styles.questionHeader}>
            <span style={styles.questionType}>
              🎧 Listening{question.question_number ? ` — Câu ${question.question_number}` : ''}
            </span>
          </div>
          {question.passage && (
            <div style={{ ...styles.questionText, backgroundColor: '#eef2ff', borderColor: '#6366f1', whiteSpace: 'pre-line', marginBottom: 12 }}>
              <strong>Transcript:</strong>
              <div style={{ marginTop: 6 }}>{question.passage}</div>
            </div>
          )}
          {question.graphic_url && <img src={question.graphic_url} alt="Graphic" style={styles.examImage} />}
          {question.image_url && <img src={question.image_url.startsWith('http') ? question.image_url : `http://localhost:8000/${question.image_url}`} alt="Question" style={styles.examImage} />}
          <div style={styles.questionText}>{question.question}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
            {options.map(opt => {
              const isSelected = selected === opt.key;
              return (
                <div key={opt.key}
                  onClick={() => !isTimeUp && setAnswers({ ...answers, [question.id]: opt.key })}
                  style={{
                    padding: '12px 16px', borderRadius: 8, cursor: isTimeUp ? 'not-allowed' : 'pointer',
                    border: `2px solid ${isSelected ? '#3b82f6' : '#e2e8f0'}`,
                    backgroundColor: isSelected ? '#dbeafe' : 'white',
                    display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.15s'
                  }}
                >
                  <span style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    backgroundColor: isSelected ? '#3b82f6' : '#f1f5f9',
                    color: isSelected ? 'white' : '#64748b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 13
                  }}>{opt.key}</span>
                  <span style={{ fontSize: 14, color: '#334155' }}>{opt.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // ──────────────────────────── Reading MCQ (TOEIC RC) ───────────────────
    if (isReading) {
      const options = [
        { key: 'A', value: question.option_a },
        { key: 'B', value: question.option_b },
        { key: 'C', value: question.option_c },
        { key: 'D', value: question.option_d },
      ].filter(o => o.value);
      const selected = answers[question.id];
      const partNum  = question.part_number;

      const renderOptions = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
          {options.map(opt => {
            const isSelected = selected === opt.key;
            return (
              <div key={opt.key}
                onClick={() => !isTimeUp && setAnswers({ ...answers, [question.id]: opt.key })}
                style={{
                  padding: '12px 16px', borderRadius: 8, cursor: isTimeUp ? 'not-allowed' : 'pointer',
                  border: `2px solid ${isSelected ? '#10b981' : '#e2e8f0'}`,
                  backgroundColor: isSelected ? '#ecfdf5' : 'white',
                  display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.15s'
                }}
              >
                <span style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  backgroundColor: isSelected ? '#10b981' : '#f1f5f9',
                  color: isSelected ? 'white' : '#64748b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 13
                }}>{opt.key}</span>
                <span style={{ fontSize: 14, color: '#334155' }}>{opt.value}</span>
              </div>
            );
          })}
        </div>
      );

      // ── Part 5: Incomplete Sentences ──────────────────────────────────────
      if (partNum === 5) {
        const sentence = question.sentence || question.question || '';
        // highlight "-------" blank
        const parts = sentence.split('-------');
        return (
          <div style={styles.questionContent}>
            <div style={styles.questionHeader}>
              <span style={{ ...styles.questionType, background: '#fef3c7', color: '#92400e' }}>
                📖 Part 5 — Incomplete Sentences
                {question.question_number ? ` — Câu ${question.question_number}` : ''}
              </span>
            </div>
            <div style={{
              fontSize: 16, lineHeight: 1.8, color: '#1e293b',
              background: '#f8fafc', borderRadius: 10, padding: '16px 20px',
              border: '1px solid #e2e8f0', marginBottom: 16
            }}>
              {parts.length > 1
                ? parts.map((p, i) => (
                    <span key={i}>
                      {p}
                      {i < parts.length - 1 && (
                        <span style={{
                          display: 'inline-block', borderBottom: '2px solid #f97316',
                          minWidth: 80, marginLeft: 2, marginRight: 2
                        }}>{'        '}</span>
                      )}
                    </span>
                  ))
                : sentence}
            </div>
            {renderOptions()}
          </div>
        );
      }

      // ── Part 6: Text Completion ────────────────────────────────────────────
      if (partNum === 6) {
        // Find sibling questions with same passage_id for mini navigator
        const siblings = selectedTest.questions.filter(q => q.passage_id === question.passage_id);
        const siblingNums = siblings.map(q => q.question_number);

        // Render passage with blanks highlighted
        const passageText = question.passage || '';
        const renderPassageWithBlanks = () => {
          let result = passageText;
          siblingNums.forEach(num => {
            result = result.replace(`[${num}]`,
              `<mark style="background:#fed7aa;padding:1px 6px;border-radius:4px;font-weight:700">[${num}]</mark>`
            );
          });
          return <div dangerouslySetInnerHTML={{ __html: result.replace(/\n/g, '<br/>') }} />;
        };

        return (
          <div style={{ display: 'flex', gap: 0, minHeight: 500 }}>
            {/* Passage panel */}
            <div style={{
              flex: '0 0 50%', overflowY: 'auto', padding: '20px 20px 20px 0',
              borderRight: '1px solid #e2e8f0', maxHeight: 600
            }}>
              {question.passage_title && (
                <div style={{ fontWeight: 700, color: '#f97316', marginBottom: 10, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {question.passage_title}
                </div>
              )}
              <div style={{
                fontSize: 14, lineHeight: 1.8, color: '#334155',
                background: '#f8fafc', borderRadius: 10, padding: '16px',
                border: '1px solid #e2e8f0'
              }}>
                {renderPassageWithBlanks()}
              </div>
              {/* Mini navigator */}
              <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {siblings.map(q => (
                  <button key={q.id}
                    onClick={() => {
                      const idx = selectedTest.questions.findIndex(x => x.id === q.id);
                      if (idx >= 0) setCurrentQuestionInSection(idx);
                    }}
                    style={{
                      padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      border: `2px solid ${q.id === question.id ? '#f97316' : '#e2e8f0'}`,
                      background: q.id === question.id ? '#fff7ed' : answers[q.id] ? '#ecfdf5' : '#f8fafc',
                      color: q.id === question.id ? '#f97316' : '#64748b'
                    }}
                  >
                    {q.question_number}
                  </button>
                ))}
              </div>
            </div>

            {/* Question panel */}
            <div style={{ flex: 1, padding: '20px 0 20px 20px', overflowY: 'auto' }}>
              <div style={styles.questionHeader}>
                <span style={{ ...styles.questionType, background: '#fff7ed', color: '#c2410c' }}>
                  📖 Part 6 — Text Completion
                  {question.question_number ? ` — Câu ${question.question_number}` : ''}
                </span>
              </div>
              <div style={{ fontSize: 14, color: '#64748b', marginBottom: 12 }}>
                Chọn từ/cụm từ phù hợp để điền vào ô trống <strong style={{ color: '#f97316' }}>[{question.question_number}]</strong>:
              </div>
              {renderOptions()}
            </div>
          </div>
        );
      }

      // ── Part 7: Reading Comprehension ─────────────────────────────────────
      if (partNum === 7) {
        const siblings = selectedTest.questions.filter(q => q.passage_id === question.passage_id);

        return (
          <div style={{ display: 'flex', gap: 0, minHeight: 500 }}>
            {/* Passage panel */}
            <div style={{
              flex: '0 0 52%', overflowY: 'auto', padding: '20px 20px 20px 0',
              borderRight: '1px solid #e2e8f0', maxHeight: 600
            }}>
              {question.passage_title && (
                <div style={{ fontWeight: 700, color: '#10b981', marginBottom: 10, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {question.passage_title}
                </div>
              )}
              <div style={{
                fontSize: 14, lineHeight: 1.8, color: '#334155',
                background: '#f8fafc', borderRadius: 10, padding: '16px',
                border: '1px solid #e2e8f0', whiteSpace: 'pre-wrap'
              }}>
                {question.passage}
              </div>
              {/* Mini navigator */}
              <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {siblings.map(q => (
                  <button key={q.id}
                    onClick={() => {
                      const idx = selectedTest.questions.findIndex(x => x.id === q.id);
                      if (idx >= 0) setCurrentQuestionInSection(idx);
                    }}
                    style={{
                      padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      border: `2px solid ${q.id === question.id ? '#10b981' : '#e2e8f0'}`,
                      background: q.id === question.id ? '#ecfdf5' : answers[q.id] ? '#ecfdf5' : '#f8fafc',
                      color: q.id === question.id ? '#10b981' : '#64748b'
                    }}
                  >
                    {q.question_number}
                  </button>
                ))}
              </div>
            </div>

            {/* Question panel */}
            <div style={{ flex: 1, padding: '20px 0 20px 20px', overflowY: 'auto' }}>
              <div style={styles.questionHeader}>
                <span style={{ ...styles.questionType, background: '#f0fdf4', color: '#15803d' }}>
                  📖 Part 7 — Reading Comprehension
                  {question.question_number ? ` — Câu ${question.question_number}` : ''}
                </span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', marginBottom: 14, lineHeight: 1.5 }}>
                {question.question}
              </div>
              {renderOptions()}
            </div>
          </div>
        );
      }

      // ── Legacy format (no part_number) ────────────────────────────────────
      return (
        <div style={styles.questionContent}>
          <div style={styles.questionHeader}>
            <span style={styles.questionType}>
              📖 Reading{question.question_number ? ` — Câu ${question.question_number}` : ''}
            </span>
          </div>
          {question.passage && (
            <div style={{ ...styles.questionText, backgroundColor: '#f0fdf4', borderColor: '#86efac', whiteSpace: 'pre-line', marginBottom: 12 }}>
              <strong>Passage:</strong>
              <div style={{ marginTop: 6 }}>{question.passage}</div>
            </div>
          )}
          <div style={styles.questionText}>{question.question}</div>
          {renderOptions()}
        </div>
      );
    }

    return null;
  };


  const renderExam = () => {
    if (!selectedTest) return null;

    // Trang kết quả sau khi nộp bài MCQ
    if (examResult) {
      return (
        <ExamResult
          result={examResult}
          test={selectedTest}
          onBack={() => { setExamResult(null); setActiveView("dashboard"); navigate("/member/dashboard"); }}
          onRetry={() => {
            setExamResult(null);
            setAnswers({});
            setCurrentQuestionInSection(0);
            setIsTimeUp(false);
            setExamAttemptKey(k => k + 1);
          }}
        />
      );
    }

    return (
      <div style={styles.testExam}>
        <div style={styles.examHeader}>
          <h1 style={styles.examTitle}>{selectedTest.title}</h1>
          <div style={{ display: 'flex', gap: '12px' }}>
          {isMcqSkill(selectedTest.skill) && !isTimeUp && (
            <button
              style={{
                ...styles.button,
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                color: 'white',
                boxShadow: '0 2px 8px rgba(22,163,74,0.25)',
              }}
              onClick={handleSubmitExam}
            >
              Nộp bài ({Object.keys(answers).length}/{selectedTest.questions.length})
            </button>
          )}
          <button
            style={{ ...styles.button, ...styles.buttonSecondary }}
            onClick={() => {
              resetExamState();
              setSelectedTest(null);
              setCurrentQuestionInSection(0);
              setCurrentSection(0);
              setAudioURL(null);
              setIsRecording(false);
              setExamResult(null);
              setActiveView("dashboard");
              navigate("/member/dashboard");
            }}
          >
            Thoát
          </button>
          </div>
        </div>
    <div style={styles.examNav}>
      {(() => {
        const questions = selectedTest.questions || [];
        const isRcFormat = questions.some(q => q.part_number === 5 || q.part_number === 6 || q.part_number === 7);
        const groupedByPart = questions.reduce((acc, q, index) => {
          const part = isRcFormat ? (q.part_number || q.part || 1) : (q.part || 1);
          if (!acc[part]) acc[part] = [];
          acc[part].push({ ...q, originalIndex: index });
          return acc;
        }, {});

        return Object.entries(groupedByPart)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([part, partQuestions]) => {
            const displayNum = (q) => q.question_number || (q.originalIndex + 1);
            const first = displayNum(partQuestions[0]);
            const last = displayNum(partQuestions[partQuestions.length - 1]);
            const rcLabel = isRcFormat ? `Part ${part}` : null;
            const label = rcLabel || (partQuestions.length === 1 ? `Câu ${first}` : `Câu ${first}-${last}`);
            const firstIdx = partQuestions[0].originalIndex;

            return (
              <div
                key={part}
                style={{
                  ...styles.navTab,
                  ...(questions[currentQuestionInSection]?.part === Number(part)
                    ? styles.navTabActive
                    : {})
                }}
                onClick={() => {
                  setCurrentQuestionInSection(firstIdx);
                  resetExamState();
                  resetAudio();
                }}
              >
                {label}
              </div>
            );
          });
      })()}
    </div>
        <div style={styles.examContent}>
          <div style={styles.examLeft}>
            {examSubView === "question"
              ? renderExamQuestion()
              : renderQuestionResult()
            } 
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'space-between' }}>
              <button
                style={{ ...styles.button, ...styles.buttonSecondary }}
                onClick={handlePrevQuestion}
                disabled={isTimeUp || currentQuestionInSection === 0}
              >
                <ArrowLeft size={16} />
                Câu trước
              </button>
              <button
                style={{ ...styles.button, ...styles.buttonPrimary }}
                onClick={handleNextQuestion}
                disabled={isTimeUp || currentQuestionInSection === (selectedTest.questions?.length ?? 1) - 1}
              >
                Câu sau
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div style={styles.examRight}>
            {/* Shared audio player cho Listening */}
            {selectedTest.skill === 'Listening' && (() => {
              const sharedAudio = selectedTest.questions?.find(q => q.audio_url)?.audio_url;
              const audioSrc = sharedAudio
                ? (sharedAudio.startsWith('http') ? sharedAudio : `http://localhost:8000/${sharedAudio}`)
                : null;
              return audioSrc ? (
                <div style={{
                  marginBottom: 12, padding: '12px 14px',
                  backgroundColor: '#dbeafe', borderRadius: 12,
                  border: '1px solid #3b82f6'
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', marginBottom: 8 }}>
                    Audio bài nghe
                  </div>
                  <audio controls src={audioSrc} style={{ width: '100%', height: 36 }} />
                </div>
              ) : null;
            })()}

            <div style={{
              ...styles.timerBox,
              backgroundColor: timeRemaining <= 120 ? '#fee2e2' : styles.timerBox.backgroundColor,
              border: timeRemaining <= 120 ? '2px solid #ef4444' : styles.timerBox.border,
            }}>
              <div style={styles.timerLabel}>
                {timeRemaining <= 120 && timeRemaining > 0 && '⚠️ '} {/* ⭐ Icon cảnh báo */}
                Thời gian còn lại:
              </div>
              <div style={{
                ...styles.timerValue,
                color: timeRemaining <= 120 ? '#ef4444' : styles.timerValue.color, // ⭐ Chữ đỏ khi < 2 phút
                animation: timeRemaining <= 10 && timeRemaining > 0 ? 'blink 1s infinite' : 'none', // ⭐ Nhấp nháy khi < 10s
              }}>
                {timeRemaining ? formatTime(timeRemaining) : '--:--'}
              </div>
              
              {/* ⭐ Thông báo hết giờ */}
              {isTimeUp && (
                <div style={{
                  marginTop: '12px',
                  padding: '8px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#ef4444',
                  textAlign: 'center',
                }}>
                  ⏰ HẾT GIỜ LÀM BÀI
                </div>
              )}
            </div>
          <div style={styles.questionsBox}>
            <div style={styles.questionsTitle}>Danh sách câu hỏi</div>
            
            {(() => {
              const questions = selectedTest.questions || [];
              const isRcFmt = questions.some(q => q.part_number === 5 || q.part_number === 6 || q.part_number === 7);
              const groupedByPart = questions.reduce((acc, q, index) => {
                const part = isRcFmt ? (q.part_number || q.part || 1) : (q.part || 1);
                if (!acc[part]) acc[part] = [];
                acc[part].push({ ...q, originalIndex: index });
                return acc;
              }, {});

              return Object.entries(groupedByPart)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([part, partQuestions]) => {
                  const displayNum = (q) => q.question_number || (q.originalIndex + 1);
                  const first = displayNum(partQuestions[0]);
                  const last = displayNum(partQuestions[partQuestions.length - 1]);
                  return (
                    <div key={part} style={{ marginBottom: '12px' }}>
                      <div style={{
                        fontSize: '10px', fontWeight: '700', color: '#94a3b8',
                        marginBottom: '5px', paddingLeft: '2px',
                        textTransform: 'uppercase', letterSpacing: '0.6px'
                      }}>
                        Part {part} · {`Q${first}${partQuestions.length > 1 ? `–${last}` : ''}`}
                      </div>

                      <div style={styles.questionGrid}>
                        {partQuestions.map((q) => {
                          const isActive = currentQuestionInSection === q.originalIndex;
                          const isAnswered = answers[q.id] !== undefined;
                          return (
                            <div
                              key={q.id}
                              style={{
                                ...styles.questionNumber,
                                ...(isActive
                                  ? styles.questionNumberActive
                                  : isAnswered
                                    ? { backgroundColor: '#bbf7d0', color: '#166534', border: '1.5px solid #4ade80', fontWeight: 700 }
                                    : {})
                              }}
                              onClick={() => {
                                setCurrentQuestionInSection(q.originalIndex);
                                resetAudio();
                              }}
                            >
                              {displayNum(q)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                });
            })()}
          </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', padding: '8px 4px', lineHeight: '1.5', marginTop: '6px' }}>
              Click số câu để chuyển nhanh. Nhớ nộp bài trước khi thoát.
            </div>
          </div>
        </div>
      </div>
    );
  };

const renderQuestionResult = () => {
  if (!submittedQuestion) return null;

  const q = submittedQuestion.question;

  return (
    <div style={styles.resultModalOverlay}>
      <div style={styles.resultModal}>
      <button
        onClick={() => {
          setSubmittedQuestion(null);
          setExamSubView("question");
        }}
        style={styles.closeBtn}
      >
        ×
      </button>
        <div style={styles.resultHeader}>
          Đáp án câu {currentQuestionInSection + 1}
        </div>

        {/* Question */}
        <div style={styles.questionText}>
          <b>Câu hỏi:</b> {q.text || q.instruction || q.question}
        </div>

        {/* Audio */}
        {submittedQuestion.audioURL && (
          <div style={styles.resultAudio}>
            <b>Bài làm của bạn:</b>
            <audio controls src={submittedQuestion.audioURL} />
          </div>
        )}

        {/* Transcript */}
        {submittedQuestion.transcript && (
          <div style={styles.resultAIBox}>
            <b>Transcript:</b>
            <div>{submittedQuestion.transcript}</div>
          </div>
        )}

        {/* Writing answer */}
        {submittedQuestion.answer && (
          <div style={styles.resultAIBox}>
            <b>Bài viết của bạn:</b>
            <div style={{ whiteSpace: "pre-line" }}>
              {submittedQuestion.answer}
            </div>
          </div>
        )}

        {/* AI feedback */}
        {submittedQuestion.feedback && (
          <div style={styles.resultAIBox}>
            <b>Nhận xét AI:</b>
            <div style={{ whiteSpace: "pre-line" }}>
              {typeof submittedQuestion.feedback === "object"
                ? JSON.stringify(submittedQuestion.feedback, null, 2)
                : submittedQuestion.feedback}
            </div>
          </div>
        )}

        <div style={styles.resultActions}>
          <button
            style={{ ...styles.button, ...styles.buttonSecondary }}
            onClick={() => setExamSubView("question")}
          >
            Quay lại
          </button>

          <button
            style={{ ...styles.button, ...styles.buttonPrimary }}
            onClick={handleNextQuestion}
          >
            Làm câu tiếp theo
          </button>
        </div>
      </div>
    </div>
  );
};

  const historyUserId = localStorage.getItem("user_id");

  let viewContent = null;
  if (activeView === 'dashboard') {
    viewContent = (
      <Dashboard
        styles={styles}
        skills={skills}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showUserMenu={showUserMenu}
        setShowUserMenu={setShowUserMenu}
        handleSkillClick={handleSkillClick}
        handleLogout={handleLogout}
        hoveredSkill={hoveredSkill}
        setHoveredSkill={setHoveredSkill}
        hoveredCard={hoveredCard}
        setHoveredCard={setHoveredCard}
        allTests={allTests}
        handleTestClick={handleTestClick}
        currentUser={currentUser}
        loadingUser={loadingUser}
        handleProfileClick={handleProfileClick}
        handleContestClick={handleContestClick}
        handleCourseClick={handleCourseClick}
        handleHistoryClick={handleHistoryClick}
        weakAreas={weakAreas}
      />
    );
  } else if (activeView === 'speaking') {
    viewContent = (
      <SpeakingTests
        styles={styles}
        hoveredCard={hoveredCard}
        setHoveredCard={setHoveredCard}
        speakingTests={speakingTestsData}
        setActiveView={setActiveView}
        handleTestClick={handleTestClick}
        currentUser={currentUser}
        loadingUser={loadingUser}
      />
    );
  } else if (activeView === 'writing') {
    viewContent = (
      <WritingTests
        styles={styles}
        hoveredCard={hoveredCard}
        setHoveredCard={setHoveredCard}
        writingTests={writingTestsData}
        setActiveView={setActiveView}
        handleTestClick={handleTestClick}
        currentUser={currentUser}
        loadingUser={loadingUser}
      />
    );
  } else if (activeView === 'listening') {
    viewContent = (
      <ListeningTests
        styles={styles}
        hoveredCard={hoveredCard}
        setHoveredCard={setHoveredCard}
        listeningTests={listeningTestsData}
        setActiveView={setActiveView}
        handleTestClick={handleTestClick}
        currentUser={currentUser}
        loadingUser={loadingUser}
      />
    );
  } else if (activeView === 'reading') {
    viewContent = (
      <ReadingTests
        styles={styles}
        hoveredCard={hoveredCard}
        setHoveredCard={setHoveredCard}
        readingTests={readingTestsData}
        setActiveView={setActiveView}
        handleTestClick={handleTestClick}
        currentUser={currentUser}
        loadingUser={loadingUser}
      />
    );
  } else if (activeView === 'exam') {
    viewContent = renderExam();
  } else if (activeView === 'profile') {
    viewContent = <Profile currentUser={currentUser} />;
  } else if (activeView === 'history') {
    viewContent = (
      <History
        userId={historyUserId}
        onBack={() => { setActiveView("dashboard"); navigate("/member/dashboard"); }}
      />
    );
  } else if (activeView === 'ContestPage') {
    viewContent = <ContestPage currentUser={currentUser} navigate={navigate} />;
  } else if (activeView === 'course') {
    viewContent = <Course navigate={navigate} />;
  }

  return (
    <>
      {viewContent}
      <ChatBot currentUser={currentUser} weakAreas={weakAreas} />
    </>
  );
};

export default ToeicMember;
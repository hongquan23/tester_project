import React, { useState, useEffect } from 'react';
import { Mic, ArrowLeft, ArrowRight } from 'lucide-react';
import Dashboard from './Dashboard';
import SpeakingTests from './Speaking';
import WritingTests from './Writing';
import ListeningTests from './Listening';
import ReadingTests from './Reading';
import ExamResult from './ExamResult';
import UploadModal from './UploadModal';
import Users from './Users';
import { useLocation, useNavigate } from "react-router-dom";
import styles from './styles';
import {
  createSection,
  getSpeakingTests, getWritingTests, getListeningTests, getReadingTests,
  getWritingBySection, getSpeakingBySection, getListeningBySection, getReadingBySection,
  getUser, getUsers, submitMcqAnswers,
} from "../api";

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
      : `http://localhost:8000/${rawImage}`)
      : null,
      image_describe: apiQuestion.image_describe || '',
      information: apiQuestion.information || '',
      sample_answer: apiQuestion.sample_answer || ''
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
      : `http://localhost:8000/${rawImage}`)
      : null,
      image_describe: apiQuestion.image_describe || '',
      sample_answer: apiQuestion.sample_answer || '',
      required_word_1: apiQuestion.required_word_1 || '',
      required_word_2: apiQuestion.required_word_2 || ''
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
      option_a: apiQuestion.option_a || '',
      option_b: apiQuestion.option_b || '',
      option_c: apiQuestion.option_c || '',
      option_d: apiQuestion.option_d || '',
      correct_answer: apiQuestion.correct_answer || ''
    };
  }

  if (skill === 'Reading') {
    return {
      ...baseQuestion,
      type: 'Reading Question',
      question: apiQuestion.question || '',
      passage: apiQuestion.passage || '',
      option_a: apiQuestion.option_a || '',
      option_b: apiQuestion.option_b || '',
      option_c: apiQuestion.option_c || '',
      option_d: apiQuestion.option_d || '',
      correct_answer: apiQuestion.correct_answer || ''
    };
  }

  return baseQuestion;
};
const ToeicAdmin = () => {
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
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [audioURL, setAudioURL] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null); 
  const [loadingUser, setLoadingUser] = useState(true);
  const [speakingTestsData, setSpeakingTestsData] = useState([]);
  const [writingTestsData, setWritingTestsData] = useState([]);
  const [listeningTestsData, setListeningTestsData] = useState([]);
  const [readingTestsData, setReadingTestsData] = useState([]);
  const [examResult, setExamResult] = useState(null);
  const [examAttemptKey, setExamAttemptKey] = useState(0); // tăng lên để restart timer
  const [mockUsers, setMockUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true)
  const allTests = [...speakingTestsData, ...writingTestsData, ...listeningTestsData, ...readingTestsData];
  const skillsWithCount = skills.map(skill => {
    if (skill.id === 'writing') return { ...skill, count: writingTestsData.length };
    if (skill.id === 'speaking') return { ...skill, count: speakingTestsData.length };
    if (skill.id === 'listening') return { ...skill, count: listeningTestsData.length };
    if (skill.id === 'reading') return { ...skill, count: readingTestsData.length };
    return { ...skill, count: 0 };
  });

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
useEffect(() => {
  const path = location.pathname;

  if (path === "/admin") {
    navigate("/admin/dashboard", { replace: true });
    return;
  }

  if (path.endsWith("/dashboard")) setActiveView("dashboard");
  else if (path.endsWith("/speaking")) setActiveView("speaking");
  else if (path.endsWith("/writing")) setActiveView("writing");
  else if (path.endsWith("/listening")) setActiveView("listening");
  else if (path.endsWith("/reading")) setActiveView("reading");
  else if (path.endsWith("/exam")) setActiveView("exam");
  else if (path.endsWith("/users")) setActiveView("users");
}, [location.pathname]);
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
            section_id: section.id,  // ⭐ THÊM DÒNG NÀY
            title: baseName,
            name: baseName,
            skill: 'Speaking',
            type: 'TOEIC Bridge',
            duration: section.time_limit || 15,
            views: 0,
            comments: 0,
            sections: [],
            questions: []
          };
        }
        
        try {
          const qRes = await getSpeakingBySection(section.id);
          const part = section.part || parseInt(section.name?.match(/Part\s*(\d+)/i)?.[1]) || 1;
          
          const mappedQuestions = (qRes.data || []).map(q => {
            console.log("API question:", q);
            const mapped = mapAPIQuestionToUIFormat(q, 'Speaking', part);
            console.log("Mapped question:", mapped);
            return mapped;
          });
          
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
            section_id: section.id,  // ⭐ THÊM DÒNG NÀY
            title: baseName,
            name: baseName,
            skill: 'Writing',
            type: 'TOEIC Bridge',
            duration: section.time_limit || 37,
            views: 0,
            comments: 0,
            sections: [],
            questions: []
          };
        }
        
        try {
          const qRes = await getWritingBySection(section.id);
          const part = section.part || parseInt(section.name?.match(/Part\s*(\d+)/i)?.[1]) || 1;
          
          const mappedQuestions = (qRes.data || []).map(q => {
            console.log("RAW WRITING API:", q)
            const mapped = mapAPIQuestionToUIFormat(q, 'Writing', part)
            console.log("MAPPED WRITING:", mapped)
            return mapped
          });
          
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
            id: `listening-${baseName}`,
            section_id: section.id,
            title: baseName,
            name: baseName,
            skill: 'Listening',
            type: 'TOEIC Bridge',
            duration: section.time_limit || 45,
            views: 0,
            comments: 0,
            sections: [],
            questions: []
          };
        }

        try {
          const qRes = await getListeningBySection(section.id);
          const mappedQuestions = (qRes.data || []).map(q => mapAPIQuestionToUIFormat(q, 'Listening', 1));
          groupedListening[baseName].sections.push({ id: section.id, name: section.name, questions: mappedQuestions });
          groupedListening[baseName].questions.push(...mappedQuestions);
        } catch (e) {
          console.error('Lỗi load listening section:', e);
        }
      }

      // ===== READING =====
      const readingRes = await getReadingTests();
      const groupedReading = {};

      for (const section of readingRes.data || []) {
        const baseName = section.name?.trim() || 'Untitled Test';

        if (!groupedReading[baseName]) {
          groupedReading[baseName] = {
            id: `reading-${baseName}`,
            section_id: section.id,
            title: baseName,
            name: baseName,
            skill: 'Reading',
            type: 'TOEIC Bridge',
            duration: section.time_limit || 75,
            views: 0,
            comments: 0,
            sections: [],
            questions: []
          };
        }

        try {
          const qRes = await getReadingBySection(section.id);
          const mappedQuestions = (qRes.data || []).map(q => mapAPIQuestionToUIFormat(q, 'Reading', 1));
          groupedReading[baseName].sections.push({ id: section.id, name: section.name, questions: mappedQuestions });
          groupedReading[baseName].questions.push(...mappedQuestions);
        } catch (e) {
          console.error('Lỗi load reading section:', e);
        }
      }

      setSpeakingTestsData(Object.values(groupedSpeaking));
      setWritingTestsData(Object.values(groupedWriting));
      setListeningTestsData(Object.values(groupedListening));
      setReadingTestsData(Object.values(groupedReading));

      console.log('✅ Speaking tests:', Object.values(groupedSpeaking));
      console.log('✅ Writing tests:', Object.values(groupedWriting));
      console.log('✅ Listening tests:', Object.values(groupedListening));
      console.log('✅ Reading tests:', Object.values(groupedReading));
    } catch (err) {
      console.error("Lỗi load test:", err);
      alert('Không thể tải dữ liệu. Vui lòng thử lại!');
    }
  };

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
  const fetchAllUsers = async () => {
    try {
      setLoadingUsers(true);
      
      // Gọi API getUsers
      const response = await getUsers();
      console.log("📋 Danh sách users từ API:", response.data);
      
      // Lưu vào state
      setMockUsers(response.data || []);
      
    } catch (error) {
      console.error("❌ Lỗi load danh sách users:", error);
      setMockUsers([]); // Set rỗng nếu lỗi
    } finally {
      setLoadingUsers(false);
    }
  };

  // Gọi khi vào trang users hoặc dashboard
  if (activeView === 'users' || activeView === 'dashboard') {
    fetchAllUsers();
  }
}, [activeView]);
  useEffect(() => {
  if (location.pathname.endsWith("/exam")) {
    const savedTest = localStorage.getItem("currentExam");
    if (savedTest) {
      const parsed = JSON.parse(savedTest);
      setSelectedTest(parsed);
      setActiveView("exam");
    } else {
      navigate("/admin/dashboard");
    }
  }
}, []);


  useEffect(() => {
    if (activeView === 'exam' && selectedTest) {
      const minutes = selectedTest.duration;
      const seconds = minutes * 60;
      setTimeRemaining(seconds);

      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [activeView, selectedTest, examAttemptKey]);

  const startRecording = async (maxDurationSec) => {
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
        setAudioChunks(chunks);
        setAudioURL(url);
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

 const handleSkillClick = async (skill) => {
  if (skill.disabled) {
    alert(`Kỹ năng ${skill.name} đang được phát triển!`);
    return;
  }

  setSelectedSkill(skill.name);

  const routes = {
    speaking: "/admin/speaking",
    writing: "/admin/writing",
    listening: "/admin/listening",
    reading: "/admin/reading"
  };

  if (routes[skill.id]) {
    setActiveView(skill.id);
    navigate(routes[skill.id]);
  }
};
  const handleUsersClick = () => {
  setActiveView("users");
  navigate("/admin/users");
  };

  const handleTestClick = (test) => {
    const formattedTest = {
    ...test,
    sections: test.sections || [
      {
        id: 'default',
        name: test.title,
        questions: test.questions || []
      }
    ],
    questions: test.questions || []
    };
    setSelectedTest(formattedTest);
    localStorage.setItem("currentExam", JSON.stringify(formattedTest))
    setCurrentQuestionInSection(Number(localStorage.getItem("currentQuestionIndex") || 0));
    setCurrentSection(0);
    setCurrentQuestionInSection(0);
    setAnswers({});
    setAudioURL(null);
    setIsRecording(false);
    setExamResult(null);
    setActiveView("exam");
    navigate("/admin/exam");
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
    if (!selectedTest) return null;
    return selectedTest.questions[currentQuestionInSection];
  };

  const handleNextQuestion = () => {
    if (!selectedTest?.questions) return;

    if (currentQuestionInSection < selectedTest.questions.length - 1) {
      setCurrentQuestionInSection(currentQuestionInSection + 1);
    }

    setAudioURL(null);
    setIsRecording(false);
  };

  const handlePrevQuestion = () => {
    if (!selectedTest?.questions) return;

    if (currentQuestionInSection > 0) {
      setCurrentQuestionInSection(currentQuestionInSection - 1);
    }

    setAudioURL(null);
    setIsRecording(false);
  };

  const isMcqSkill = (skill) => skill === 'Listening' || skill === 'Reading';

  const handleSubmitExam = async () => {
    if (!selectedTest || !isMcqSkill(selectedTest.skill)) return;

    const answeredCount = Object.keys(answers).length;
    const total = selectedTest.questions.length;
    if (answeredCount < total) {
      const confirm = window.confirm(
        `Bạn còn ${total - answeredCount} câu chưa trả lời. Vẫn nộp bài?`
      );
      if (!confirm) return;
    }

    try {
      const userId = localStorage.getItem("user_id");
      const payload = {
        user_id: Number(userId),
        section_id: selectedTest.section_id,
        skill: selectedTest.skill.toLowerCase(),
        answers,  // { question_id: "A", ... }
      };
      const res = await submitMcqAnswers(payload);
      setExamResult({ ...res.data, questions: selectedTest.questions });
    } catch (err) {
      console.error("Submit error:", err);
      alert("Nộp bài thất bại! Kiểm tra console.");
    }
  };

  const renderExamQuestion = () => {
    const question = getCurrentQuestion();
    if (!question) return null;

    const isSpeaking = selectedTest.skill === 'Speaking';
    const isWriting = selectedTest.skill === 'Writing';
    const isListening = selectedTest.skill === 'Listening';
    const isReading = selectedTest.skill === 'Reading';

    const renderRecordControls = (responseTime) => (
      <>
        <button
          style={{
            ...styles.recordButton,
            backgroundColor: isRecording ? '#dc2626' : '#ef4444',
            transform: isRecording ? 'scale(1.02)' : 'scale(1)',
          }}
          onClick={() => {
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

        {audioURL && (
          <div style={{ marginTop: '16px' }}>
            <audio controls src={audioURL} />
          </div>
        )}
      </>
    );

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
              <div style={{ ...styles.questionText, backgroundColor: '#dbeafe', borderColor: '#3b82f6', marginBottom: '12px' }}>
                <strong>Direction:</strong> {question.direction}
              </div>
            )}
            {question.sample_answer && (
              <div style={{ ...styles.questionText, backgroundColor: '#f0fdf4', borderColor: '#86efac' }}>
                <strong>📝 Sample Answer:</strong>
                <div style={{ marginTop: '6px', whiteSpace: 'pre-line', color: '#166534' }}>{question.sample_answer}</div>
              </div>
            )}
            <div style={styles.questionText}>{question.text}</div>

            {renderRecordControls(question.responseTime)}
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
              <div style={{ ...styles.questionText, backgroundColor: '#dbeafe', borderColor: '#3b82f6', marginBottom: '12px' }}>
                <strong>Direction:</strong> {question.direction}
              </div>
            )}

            {question.image && question.image.trim() !== '' && (
              <img src={question.image} alt="Question" style={styles.examImage} 
              onError={(e) => console.log("❌ Load ảnh lỗi:", question.image)}/>
            )}
            {console.log("👉 IMAGE URL FE:", question.image)}

            {question.sample_answer && (
              <div style={{ ...styles.questionText, backgroundColor: '#f0fdf4', borderColor: '#86efac' }}>
                <strong>📝 Sample Answer:</strong>
                <div style={{ marginTop: '6px', whiteSpace: 'pre-line', color: '#166534' }}>{question.sample_answer}</div>
              </div>
            )}
            {renderRecordControls(question.responseTime)}
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
              <div style={{ ...styles.questionText, backgroundColor: '#dbeafe', borderColor: '#3b82f6', marginBottom: '12px' }}>
                <strong>Direction:</strong> {question.direction}
              </div>
            )}
            {question.information && (
              <div style={{ ...styles.questionText, backgroundColor: '#fef3c7', borderColor: '#fbbf24', marginBottom: '12px' }}>
                <strong>Information:</strong> {question.information}
              </div>
            )}
            <div style={styles.questionText}>{question.text}</div>
            {question.sample_answer && (
              <div style={{ ...styles.questionText, backgroundColor: '#f0fdf4', borderColor: '#86efac' }}>
                <strong>📝 Sample Answer:</strong>
                <div style={{ marginTop: '6px', whiteSpace: 'pre-line', color: '#166534' }}>{question.sample_answer}</div>
              </div>
            )}
            {renderRecordControls(question.responseTime)}
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
              <div style={{ ...styles.questionText, backgroundColor: '#dbeafe', borderColor: '#3b82f6', marginBottom: '12px' }}>
                <strong>Direction:</strong> {question.direction}
              </div>
            )}
            {question.text && (
              <div style={styles.questionText}>{question.text}</div>
            )}
            {question.information && (
              <div style={{ ...styles.questionText, backgroundColor: '#fef3c7', borderColor: '#fbbf24', marginBottom: '12px' }}>
                <strong>Information:</strong> {question.information}
              </div>
            )}
            {question.image && question.image.trim() !== '' && (
              <img src={question.image} alt="Question" style={styles.examImage} />
            )}
            {question.sample_answer && (
              <div style={{ ...styles.questionText, backgroundColor: '#f0fdf4', borderColor: '#86efac' }}>
                <strong>📝 Sample Answer:</strong>
                <div style={{ marginTop: '6px', whiteSpace: 'pre-line', color: '#166534' }}>{question.sample_answer}</div>
              </div>
            )}
            {renderRecordControls(question.responseTime)}
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
              <div style={{ ...styles.questionText, backgroundColor: '#dbeafe', borderColor: '#3b82f6', marginBottom: '12px' }}>
                <strong>Direction:</strong> {question.direction}
              </div>
            )}
            <div style={styles.questionText}>{question.text}</div>
            {question.sample_answer && (
              <div style={{ ...styles.questionText, backgroundColor: '#f0fdf4', borderColor: '#86efac' }}>
                <strong>📝 Sample Answer:</strong>
                <div style={{ marginTop: '6px', whiteSpace: 'pre-line', color: '#166534' }}>{question.sample_answer}</div>
              </div>
            )}
            {renderRecordControls(question.responseTime)}
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
                ...styles.questionText,
                backgroundColor: '#fef3c7',
                border: '1px solid #f59e0b',
                fontWeight: 500
            }}>
              Required words: 
              <span style={{ color: '#b45309' }}>
                {question.required_word_1}
                {question.required_word_1 && question.required_word_2 ? ', ' : ''}
                {question.required_word_2}
              </span>
            </div>
          )}
            <textarea
              style={styles.textarea}
              placeholder="Write your sentence here..."
              value={answers[question.id] || ''}
              onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
            />
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
                  borderColor: '#6366f1',
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
              <div style={{ ...styles.questionText, backgroundColor: '#f0fdf4', borderColor: '#86efac' }}>
                <strong>📝 Sample Answer:</strong>
                <div style={{ marginTop: '6px', whiteSpace: 'pre-line', color: '#166534' }}>{question.sample_answer}</div>
              </div>
            )}
            <textarea
              style={{ ...styles.textarea, minHeight: 200,height: 'auto', resize: 'vertical' }}
              placeholder="Write your response here..."
              value={answers[question.id] || ''}
              onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
            />
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
              <div style={{ ...styles.questionText, backgroundColor: '#f0fdf4', borderColor: '#86efac' }}>
                <strong>📝 Sample Answer:</strong>
                <div style={{ marginTop: '6px', whiteSpace: 'pre-line', color: '#166534' }}>{question.sample_answer}</div>
              </div>
            )}
            <textarea
              style={{ ...styles.textarea, minHeight: 200,height: 'auto',resize: 'vertical' }}
              placeholder="Write your essay here..."
              value={answers[question.id] || ''}
              onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
            />
            <div style={styles.wordCount}>Word count: {wordCount}</div>
          </div>
        );
      }
    }

    // Listening / Reading MCQ
    if (isListening || isReading) {
      const options = [
        { key: 'A', value: question.option_a },
        { key: 'B', value: question.option_b },
        { key: 'C', value: question.option_c },
        { key: 'D', value: question.option_d }
      ].filter(o => o.value);
      const selected = answers[question.id];

      return (
        <div style={styles.questionContent}>
          <div style={styles.questionHeader}>
            <span style={styles.questionType}>
              {isListening ? '🎧 Listening' : '📖 Reading'}
              {question.question_number ? ` — Câu ${question.question_number}` : ''}
            </span>
          </div>

          {question.passage && (
            <div style={{ ...styles.questionText, backgroundColor: '#eef2ff', borderColor: '#6366f1', whiteSpace: 'pre-line', marginBottom: 12 }}>
              <strong>Transcript:</strong>
              <div style={{ marginTop: 6 }}>{question.passage}</div>
            </div>
          )}

          {question.graphic_url && (
            <img src={question.graphic_url} alt="Graphic" style={styles.examImage} />
          )}

          {question.image_url && (
            <img src={question.image_url.startsWith('http') ? question.image_url : `http://localhost:8000/${question.image_url}`} alt="Question" style={styles.examImage} />
          )}

          <div style={styles.questionText}>{question.question}</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
            {options.map(opt => {
              const isSelected = selected === opt.key;
              return (
                <div
                  key={opt.key}
                  onClick={() => setAnswers({ ...answers, [question.id]: opt.key })}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: `2px solid ${isSelected ? '#3b82f6' : '#e2e8f0'}`,
                    backgroundColor: isSelected ? '#dbeafe' : 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    transition: 'all 0.15s'
                  }}
                >
                  <span style={{
                    width: 28, height: 28, borderRadius: '50%',
                    backgroundColor: isSelected ? '#3b82f6' : '#f1f5f9',
                    color: isSelected ? 'white' : '#64748b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 13, flexShrink: 0
                  }}>{opt.key}</span>
                  <span style={{ fontSize: 14, color: '#334155' }}>{opt.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Fallback cho type chưa handle
    return (
      <div style={styles.questionContent}>
        <div style={styles.questionHeader}>
          <span style={styles.questionType}>Part {question.part || '?'} - {question.type || 'Unknown'}</span>
        </div>

        {question.direction && (
          <div style={{ ...styles.questionText, backgroundColor: '#dbeafe', borderColor: '#3b82f6', marginBottom: '12px' }}>
            <strong>Direction:</strong> {question.direction}
          </div>
        )}

        <div style={styles.questionText}>{question.text || question.question || question.instruction || ''}</div>

        {question.image && question.image.trim() !== '' && (
          <img src={question.image} alt="Question" style={styles.examImage} />
        )}

        {isWriting && (
          <>
            <textarea
              style={{ ...styles.textarea, minHeight: 200,height: 'auto',resize: 'vertical' }}
              placeholder="Write your answer here..."
              value={answers[question.id] || ''}
              onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
            />
            <div style={styles.wordCount}>
              Word count: {answers[question.id]?.split(' ').filter(w => w).length || 0}
            </div>
          </>
        )}

        {isSpeaking && renderRecordControls(question.responseTime || 30)}
      </div>
    );
  };

  const renderExam = () => {
    if (!selectedTest) return null;

    // Hiển thị trang kết quả sau khi nộp bài
    if (examResult) {
      return (
        <ExamResult
          result={examResult}
          test={selectedTest}
          onBack={() => {
            setExamResult(null);
            setActiveView("dashboard");
            navigate("/admin/dashboard");
          }}
          onRetry={() => {
            setExamResult(null);
            setAnswers({});
            setCurrentQuestionInSection(0);
            setExamAttemptKey(k => k + 1);
          }}
        />
      );
    }

    return (
      <>
        <div style={styles.testExam}>
          <div style={styles.examHeader}>
            <h1 style={styles.examTitle}>{selectedTest.title}</h1>
            <div style={{ display: 'flex', gap: '12px' }}>
              {isMcqSkill(selectedTest.skill) && (
                <button
                  style={{ ...styles.button, backgroundColor: '#16a34a', color: 'white' }}
                  onClick={handleSubmitExam}
                >
                  Nộp bài ({Object.keys(answers).length}/{selectedTest.questions.length})
                </button>
              )}
              <button
                style={{ ...styles.button, ...styles.buttonSecondary }}
                onClick={() => {
                  setActiveView("dashboard");
                  navigate("/admin/dashboard");
                }}
              >
                Thoát
              </button>
            </div>
          </div>

          <div style={styles.examNav}>
            {(() => {
              const questions = selectedTest.questions || [];
              const groupedByPart = questions.reduce((acc, q, index) => {
                const part = q.part || 1;
                if (!acc[part]) {
                  acc[part] = [];
                }
                acc[part].push({ ...q, originalIndex: index });
                return acc;
              }, {});

              return Object.entries(groupedByPart)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([part, partQuestions]) => {
                  const displayNum = (q) => q.question_number || (q.originalIndex + 1);
                  const first = displayNum(partQuestions[0]);
                  const last = displayNum(partQuestions[partQuestions.length - 1]);
                  const label = partQuestions.length === 1
                    ? `Câu ${first}`
                    : `Câu ${first}-${last}`;

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
                        setAudioURL(null);
                        setIsRecording(false);
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
              {renderExamQuestion()}

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'space-between' }}>
                <button
                  style={{ ...styles.button, ...styles.buttonSecondary }}
                  onClick={handlePrevQuestion}
                  disabled={currentSection === 0 && currentQuestionInSection === 0}
                >
                  <ArrowLeft size={16} />
                  Câu trước
                </button>
                <button
                  style={{ ...styles.button, ...styles.buttonPrimary }}
                  onClick={handleNextQuestion}
                 disabled={currentQuestionInSection === selectedTest.questions.length - 1}
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
                      🎧 Audio bài nghe
                    </div>
                    <audio controls src={audioSrc} style={{ width: '100%', height: 36 }} />
                  </div>
                ) : null;
              })()}

              <div style={styles.timerBox}>
                <div style={styles.timerLabel}>Thời gian còn lại:</div>
                <div style={styles.timerValue}>{timeRemaining ? formatTime(timeRemaining) : '--:--'}</div>
              </div>

{/* ✅ CODE MỚI - nhóm theo Part */}
        <div style={styles.questionsBox}>
          <div style={styles.questionsTitle}>Danh sách câu hỏi</div>
          
          {(() => {
            const questions = selectedTest.questions || [];
            
            // Nhóm câu hỏi theo part
            const groupedByPart = questions.reduce((acc, q, index) => {
              const part = q.part || 1;
              if (!acc[part]) {
                acc[part] = [];
              }
              acc[part].push({ ...q, originalIndex: index });
              return acc;
            }, {});

            return Object.entries(groupedByPart)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([part, partQuestions]) => {
                const displayNum = (q) => q.question_number || (q.originalIndex + 1);
                const first = displayNum(partQuestions[0]);
                const last = displayNum(partQuestions[partQuestions.length - 1]);
                const label = partQuestions.length === 1
                  ? `Câu ${first}`
                  : `Câu ${first} - ${last}`;

                return (
                  <div key={part} style={{ marginBottom: '16px' }}>
                    <div style={{
                      fontSize: '12px', fontWeight: '700', color: '#6b7280',
                      marginBottom: '6px', paddingLeft: '4px',
                      textTransform: 'uppercase', letterSpacing: '0.5px'
                    }}>
                      Part {part} · {label}
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
                              setAudioURL(null);
                              setIsRecording(false);
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

              <div style={{ fontSize: '11px', color: '#f97316', textAlign: 'center', padding: '8px' }}>
                Khôi phục/lưu bài làm
                <br />
                Chú ý: Bạn có thể click vào số thứ tự câu hỏi trong bảng để đánh dấu review
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  if (activeView === 'dashboard') {
    return (
      <>
        <Dashboard
          styles={styles}
          skills={skillsWithCount}
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
          setShowUploadModal={setShowUploadModal}
          setActiveView={setActiveView}
          navigate={navigate}
          mockUsers={mockUsers}       
          loadingUsers={loadingUsers}
          fetchAllTests={fetchTests}
        />

        {showUploadModal && (
          <UploadModal
          styles={styles}
          setShowUploadModal={setShowUploadModal}
          selectedSkill={selectedSkill}
          onUploaded={() => {
            fetchTests();
          }}
        />
        )}
      </>
    );
  }

if (activeView === 'speaking') {
  return (
    <SpeakingTests
      styles={styles}
      hoveredCard={hoveredCard}
      setHoveredCard={setHoveredCard}
      speakingTests={speakingTestsData}
      setActiveView={setActiveView}
      handleTestClick={handleTestClick}
    />
  );
}

if (activeView === 'writing') {
  return (
    <WritingTests
      styles={styles}
      hoveredCard={hoveredCard}
      setHoveredCard={setHoveredCard}
      writingTests={writingTestsData}
      setActiveView={setActiveView}
      handleTestClick={handleTestClick}
    />
  );
}

if (activeView === 'listening') {
  return (
    <ListeningTests
      styles={styles}
      hoveredCard={hoveredCard}
      setHoveredCard={setHoveredCard}
      listeningTests={listeningTestsData}
      handleTestClick={handleTestClick}
    />
  );
}

if (activeView === 'reading') {
  return (
    <ReadingTests
      styles={styles}
      hoveredCard={hoveredCard}
      setHoveredCard={setHoveredCard}
      readingTests={readingTestsData}
      handleTestClick={handleTestClick}
    />
  );
}

  if (activeView === 'exam') {
    return renderExam();
  }



  return (
    <Dashboard
      activeView={activeView}
      styles={styles}
      skills={skillsWithCount}
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
      setShowUploadModal={setShowUploadModal}
      setActiveView={setActiveView}
      navigate={navigate}
      currentUser={currentUser}
      loadingUser={loadingUser}
      mockUsers={mockUsers}           
      loadingUsers={loadingUsers}    
      fetchAllTests={fetchTests}  
    />
  );
}

// return null;


export default ToeicAdmin;

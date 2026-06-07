import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// Gắn JWT token vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Khi nhận 401, xóa session và chuyển về trang đăng nhập
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("role");
      localStorage.removeItem("user_id");
      window.location.replace("/auth");
    }
    return Promise.reject(error);
  }
);
//chatbot
export const sendChatMessage = (data) => api.post("api/chatbot/chat", data);

 // auth
export const register = (data) => api.post("api/auth/register", data);
export const login = (data) => api.post("api/auth/login", data);
export const changePassword = (userId, data) => api.put(`api/auth/change-password/${userId}`, data);


// 👉 Users
export const getUsers = () => api.get("api/users");
export const getUser = (userId) => api.get(`api/users/${userId}`);
export const deleteUser = (userId) => api.delete(`api/users/${userId}`);
export const updateUserName = (userId, name) => api.put(`api/users/update-name/${userId}`, { name });

// 👉 Section API
export const createSection = (data) => api.post("api/sections/create", data);
export const getSections = () => api.get("api/sections/");
export const getSpeakingTests = () => api.get("api/sections?skill=speaking");
export const getWritingTests = () => api.get("api/sections?skill=writing");
export const getListeningTests = () => api.get("api/sections?skill=listening");
export const getReadingTests = () => api.get("api/sections?skill=reading");
export const deleteSection = (sectionId) => api.delete(`api/sections/${sectionId}`);
export const updateSection = (sectionId, data) => api.put(`api/sections/${sectionId}`, data);

// 👉 Writing
export const createWritingQuestion = (formData) => api.post("api/writing/", formData);
export const getWritingBySection = (sectionId) => api.get(`api/writing/section/${sectionId}`);

// 👉 Chấm điểm Writing (AI)
export const scoreWritingQ1_5 = (formData) => api.post("api/writing/q1_5", formData);
export const scoreWritingQ6_7 = (formData) => api.post("api/writing/q6_7", formData);
export const scoreWritingQ8 = (formData) => api.post("api/writing/q8", formData);

// 👉 Speaking: tạo câu hỏi
export const createSpeakingQuestion = (formData) => api.post("api/speaking/", formData);
export const getSpeakingBySection = (sectionId) => api.get(`api/speaking/section/${sectionId}`);

// 👉 Speaking AI chấm điểm
export const scoreSpeakingQ1_2 = (formData) => api.post("api/speaking/q1-2", formData);
export const scoreSpeakingQ3_4 = (formData) => api.post("api/speaking/q3-4", formData);
export const scoreSpeakingQ5_7 = (formData) => api.post("api/speaking/q5-7", formData);
export const scoreSpeakingQ8_10 = (formData) => api.post("api/speaking/q8-10", formData);
export const scoreSpeakingQ11 = (formData) => api.post("api/speaking/q11", formData);

// 👉 Listening
export const getListeningBySection = (sectionId) => api.get(`api/listening/section/${sectionId}`);
export const uploadListeningJson = (data) => api.post("api/listening/upload-json", data);
export const uploadListeningEtsJson = (data) => api.post("api/listening/upload-ets-json", data);

// 👉 Reading
export const getReadingBySection = (sectionId) => api.get(`api/reading/section/${sectionId}`);
export const uploadReadingJson = (data) => api.post("api/reading/upload-json", data);
export const uploadReadingEtsRcJson = (data) => api.post("api/reading/upload-ets-rc-json", data);

// 👉 User Attempts
export const submitMcqAnswers = (data) => api.post("api/user-attempts/submit-mcq", data);
export const getAttemptsByUser = (userId) => api.get(`api/user-attempts/user/${userId}`);
export const getAttemptsByUserSection = (userId, sectionId) =>
  api.get(`api/user-attempts/user/${userId}/section/${sectionId}`);
export const getAttemptHistory = (userId) => api.get(`api/user-attempts/user/${userId}/history`);
export const getSessionDetail = (userId, sectionId, attemptedAt) =>
  api.get(`api/user-attempts/user/${userId}/session-detail`, {
    params: { section_id: sectionId, attempted_at: attemptedAt }
  });
export const getWeakAreas = (userId) => api.get(`api/user-attempts/user/${userId}/weak-areas`);

export default api;

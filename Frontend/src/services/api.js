// API Base URL
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? '' // Relative URLs for production
  : ''; // Relative URLs for development (proxied by Vite)

// Helper function to get auth token
const getAuthToken = () => localStorage.getItem('token');

// Helper function to check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true; // If we can't parse the token, consider it expired
  }
};

// Helper function to handle logout
const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login'; // Redirect to login
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getAuthToken();
  return token && !isTokenExpired(token);
};

// Get current user data
export const getCurrentUser = () => {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};

// Logout function
export const logout = () => {
  handleLogout();
};

// Helper function for API requests
const apiRequest = async (endpoint, options = {}) => {
  // Temporarily disable token requirement for testing
  // const token = getAuthToken();

  // if (!token || isTokenExpired(token)) {
  //   handleLogout();
  //   throw new Error('Session expired. Please login again.');
  // }

  const defaultHeaders = {
    // ...(token && { 'Authorization': `Bearer ${token}` })
  };

  const config = {
    headers: {
      ...defaultHeaders,
      ...options.headers
    },
    ...options
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    // For testing, don't logout on 401
    // handleLogout();
    // throw new Error('Session expired. Please login again.');
    console.warn('401 Unauthorized - but continuing for testing');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
};

// Auth API calls
export const authAPI = {
  login: (credentials) => apiRequest('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  }),

  registerStudent: (studentData) => apiRequest('/api/auth/register-student', {
    method: 'POST',
    body: studentData // FormData for file uploads
  }),

  addTeacher: (teacherData) => apiRequest('/api/auth/add-teacher', {
    method: 'POST',
    body: teacherData // FormData for file uploads
  }),

  getMe: () => apiRequest('/api/auth/me')
};

// Kuppi API calls
export const kuppiAPI = {
  // Get all kuppi sessions
  getKuppis: () => apiRequest('/api/kuppi'),

  // Get single kuppi session
  getKuppi: (id) => apiRequest(`/api/kuppi/${id}`),

  // Upload kuppi session with files
  uploadKuppi: (formData) => apiRequest('/api/kuppi', {
    method: 'POST',
    body: formData // FormData with files
  }),

  // Update kuppi session
  updateKuppi: (id, updateData) => apiRequest(`/api/kuppi/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData)
  }),

  // Delete kuppi session
  deleteKuppi: (id) => apiRequest(`/api/kuppi/${id}`, {
    method: 'DELETE'
  })
};

// Quiz API calls
export const quizAPI = {
  // Get all quizzes
  getQuizzes: () => apiRequest('/api/quizzes'),

  // Get single quiz
  getQuiz: (id) => apiRequest(`/api/quizzes/${id}`),

  // Create quiz
  createQuiz: (quizData) => apiRequest('/api/quizzes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quizData)
  }),

  // Update quiz
  updateQuiz: (id, updateData) => apiRequest(`/api/quizzes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData)
  }),

  // Delete quiz
  deleteQuiz: (id) => apiRequest(`/api/quizzes/${id}`, {
    method: 'DELETE'
  }),

  // Submit quiz attempt
  submitQuizAttempt: (quizId, attemptData) => apiRequest(`/api/quizzes/${quizId}/attempt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(attemptData)
  }),

  // Get student's quiz attempts
  getStudentAttempts: () => apiRequest('/api/quizzes/attempts')
};

// Teacher API calls
export const teacherAPI = {
  getTeachers: () => apiRequest('/api/teachers'),
  getTeacher: (id) => apiRequest(`/api/teachers/${id}`),
  updateTeacher: (id, updateData) => apiRequest(`/api/teachers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData)
  }),
  deleteTeacher: (id) => apiRequest(`/api/teachers/${id}`, {
    method: 'DELETE'
  })
};

// Student API calls
export const studentAPI = {
  getStudents: () => apiRequest('/api/students'),
  getStudent: (id) => apiRequest(`/api/students/${id}`),
  updateStudent: (id, updateData) => apiRequest(`/api/students/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData)
  }),
  deleteStudent: (id) => apiRequest(`/api/students/${id}`, {
    method: 'DELETE'
  })
};

export default {
  authAPI,
  kuppiAPI,
  quizAPI,
  teacherAPI,
  studentAPI
};
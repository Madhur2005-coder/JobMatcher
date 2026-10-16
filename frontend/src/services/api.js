import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('skillmatch_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const jobsAPI = {
  getJobs: (params) => api.get('/jobs', { params }),
  getJob: (id) => api.get(`/jobs/${id}`),
  createJob: (data) => api.post('/jobs', data),
  updateJob: (id, data) => api.put(`/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  toggleStatus: (id) => api.patch(`/jobs/${id}/toggle-status`),
};

export const matchingAPI = {
  getRecommendations: (data) => api.post('/matching/recommend', data),
  predictSalary: (data) => api.post('/matching/predict-salary', data),
  analyzeSkillGap: (data) => api.post('/matching/skill-gap', data),
  knnRecommend: (data) => api.post('/matching/knn-recommend', data),
};

export const schemesAPI = {
  getSchemes: (params) => api.get('/schemes', { params }),
  getScheme: (id) => api.get(`/schemes/${id}`),
  createScheme: (data) => api.post('/schemes', data),
  updateScheme: (id, data) => api.put(`/schemes/${id}`, data),
  deleteScheme: (id) => api.delete(`/schemes/${id}`),
  toggleStatus: (id) => api.patch(`/schemes/${id}/toggle-status`),
};

export const institutesAPI = {
  getInstitutes: (params) => api.get('/institutes', { params }),
  getInstitute: (id) => api.get(`/institutes/${id}`),
  createInstitute: (data) => api.post('/institutes', data),
  updateInstitute: (id, data) => api.put(`/institutes/${id}`, data),
  deleteInstitute: (id) => api.delete(`/institutes/${id}`),
};

export const skillsAPI = {
  getTradesWithSkills: () => api.get('/skills/trades'),
  getSkills: (params) => api.get('/skills', { params }),
  createSkill: (data) => api.post('/skills', data),
  updateSkill: (id, data) => api.put(`/skills/${id}`, data),
  deleteSkill: (id) => api.delete(`/skills/${id}`),
};

export const companiesAPI = {
  getCompanies: (params) => api.get('/companies', { params }),
  getCompany: (id) => api.get(`/companies/${id}`),
  createCompany: (data) => api.post('/companies', data),
  updateCompany: (id, data) => api.put(`/companies/${id}`, data),
  deleteCompany: (id) => api.delete(`/companies/${id}`),
};

export const apprenticeshipsAPI = {
  getApprenticeships: (params) => api.get('/apprenticeships', { params }),
  getApprenticeship: (id) => api.get(`/apprenticeships/${id}`),
};

export const studentAPI = {
  getProfile: () => api.get('/student/profile'),
  updateProfile: (data) => api.put('/student/profile', data),
  getDashboard: () => api.get('/student/dashboard'),
  getSavedJobs: () => api.get('/student/saved-jobs'),
  toggleSaveJob: (jobId) => api.post(`/student/saved-jobs/${jobId}`),
  getApplications: () => api.get('/student/applications'),
  applyJob: (data) => api.post('/student/applications', data),
};

export const analyticsAPI = {
  getAnalytics: () => api.get('/analytics'),
};

export const usersAPI = {
  getUsers: () => api.get('/users'),
  toggleStatus: (id) => api.patch(`/users/${id}/toggle-status`),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export default api;

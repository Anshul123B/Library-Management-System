import API from './api';

// Auth Services
export const authService = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  getProfile: () => API.get('/auth/me'),
};

// User Services
export const userService = {
  getAll: (params) => API.get('/users', { params }),
  getById: (id) => API.get(`/users/${id}`),
  create: (data) => API.post('/users', data),
  update: (id, data) => API.put(`/users/${id}`, data),
  delete: (id) => API.delete(`/users/${id}`),
};

// Book Services
export const bookService = {
  getAll: (params) => API.get('/books', { params }),
  getById: (id) => API.get(`/books/${id}`),
  create: (data) => API.post('/books', data),
  update: (id, data) => API.put(`/books/${id}`, data),
  delete: (id) => API.delete(`/books/${id}`),
};

// Movie Services
export const movieService = {
  getAll: (params) => API.get('/movies', { params }),
  getById: (id) => API.get(`/movies/${id}`),
  create: (data) => API.post('/movies', data),
  update: (id, data) => API.put(`/movies/${id}`, data),
  delete: (id) => API.delete(`/movies/${id}`),
};

// Membership Services
export const membershipService = {
  getAll: (params) => API.get('/memberships', { params }),
  getById: (id) => API.get(`/memberships/${id}`),
  create: (data) => API.post('/memberships', data),
  update: (id, data) => API.put(`/memberships/${id}`, data),
  delete: (id) => API.delete(`/memberships/${id}`),
};

// Issue Services
export const issueService = {
  getAll: (params) => API.get('/issues', { params }),
  getById: (id) => API.get(`/issues/${id}`),
  issueBook: (data) => API.post('/issues', data),
  returnBook: (id) => API.put(`/issues/${id}/return`),
  checkAvailability: (bookId) => API.get(`/issues/availability/${bookId}`),
};

// Report Services
export const reportService = {
  getDashboard: () => API.get('/reports/dashboard'),
  getActiveIssues: () => API.get('/reports/active-issues'),
  getOverdueBooks: () => API.get('/reports/overdue'),
  getTransactions: (params) => API.get('/reports/transactions', { params }),
  getInventory: () => API.get('/reports/inventory'),
};

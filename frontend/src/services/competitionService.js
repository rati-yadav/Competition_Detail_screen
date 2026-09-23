import api from './api';

export const competitionService = {
  /** Fetch paginated list of competitions */
  getAll: (params = {}) =>
    api.get('/competitions', { params }).then((r) => r.data),

  /** Fetch single competition by id or slug */
  getOne: (idOrSlug) =>
    api.get(`/competitions/${idOrSlug}`).then((r) => r.data),

  /** Create (admin) */
  create: (data) => api.post('/competitions', data).then((r) => r.data),

  /** Update (admin) */
  update: (id, data) => api.patch(`/competitions/${id}`, data).then((r) => r.data),

  /** Delete (admin) */
  remove: (id) => api.delete(`/competitions/${id}`).then((r) => r.data),
};

export const registrationService = {
  /** Register authenticated user for a competition */
  register: (competitionId) =>
    api.post(`/registrations/${competitionId}/register`).then((r) => r.data),

  /** Cancel registration */
  cancel: (competitionId) =>
    api.delete(`/registrations/${competitionId}/cancel`).then((r) => r.data),

  /** Submit competition entry */
  submit: (competitionId, data) =>
    api.post(`/registrations/${competitionId}/submit`, data).then((r) => r.data),

  /** Get all registrations for the authenticated user */
  getMyRegistrations: () =>
    api.get('/registrations/my').then((r) => r.data),
};

export const leaderboardService = {
  /** Public leaderboard for a competition */
  get: (competitionId, params = {}) =>
    api.get(`/leaderboard/${competitionId}`, { params }).then((r) => r.data),

  /** My rank in a competition */
  getMyRank: (competitionId) =>
    api.get(`/leaderboard/${competitionId}/me`).then((r) => r.data),
};

export const authService = {
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  getMe: () => api.get('/auth/me').then((r) => r.data),
};

import client from './client'

// ── Users ──────────────────────────────────────────────────────────────────
export const adminListUsers = () =>
  client.get('/api/admin/users').then((r) => r.data)

export const adminUpdateUser = (userID, data) =>
  client.put(`/api/admin/users/${userID}`, data)

export const adminDeleteUser = (userID) =>
  client.delete(`/api/admin/users/${userID}`)

// ── Exams ──────────────────────────────────────────────────────────────────
export const adminListExams = () =>
  client.get('/api/admin/exams').then((r) => r.data)

export const adminCreateExam = (data) =>
  client.post('/api/admin/exams', data).then((r) => r.data)

export const adminUpdateExam = (examID, data) =>
  client.put(`/api/admin/exams/${examID}`, data)

export const adminDeleteExam = (examID) =>
  client.delete(`/api/admin/exams/${examID}`)

export const adminTogglePublish = (examID) =>
  client.put(`/api/admin/exams/${examID}/publish`).then((r) => r.data)

// ── Questions ──────────────────────────────────────────────────────────────
export const adminAddQuestion = (examID, data) =>
  client.post(`/api/admin/exams/${examID}/questions`, data).then((r) => r.data)

export const adminUpdateQuestion = (examID, questionID, data) =>
  client.put(`/api/admin/exams/${examID}/questions/${questionID}`, data)

export const adminDeleteQuestion = (examID, questionID) =>
  client.delete(`/api/admin/exams/${examID}/questions/${questionID}`)

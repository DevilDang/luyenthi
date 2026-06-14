import client from './client'

export const listExams = (params) =>
  client.get('/api/exams', { params }).then((r) => r.data)

export const getExam = (examID) =>
  client.get(`/api/exams/${examID}`).then((r) => r.data)

export const submitExam = (examID, payload) =>
  client.post(`/api/exams/${examID}/submit`, payload).then((r) => r.data)

export const getHistory = () =>
  client.get('/api/users/me/history').then((r) => r.data)

export const getLeaderboard = () =>
  client.get('/api/leaderboard').then((r) => r.data)

export const updateProfile = (data) =>
  client.put('/api/users/me', data).then((r) => r.data)

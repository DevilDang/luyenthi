import client from './client'

export const googleLogin = (idToken) =>
  client.post('/api/auth/google', { id_token: idToken }).then((r) => r.data)

export const getMe = () =>
  client.get('/api/auth/me').then((r) => r.data)

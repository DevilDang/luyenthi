import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { firebaseAuth } from '../lib/firebase'
import { googleLogin, getMe } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      setLoading(true)
      if (!firebaseUser) {
        localStorage.removeItem('token')
        setUser(null)
        setLoading(false)
        return
      }

      // Try the existing app JWT first — avoids a round-trip on every page load
      const existingToken = localStorage.getItem('token')
      if (existingToken) {
        try {
          const userData = await getMe()
          setUser(userData)
          setLoading(false)
          return
        } catch {
          // JWT expired or invalid — fall through to re-exchange below
          localStorage.removeItem('token')
        }
      }

      // Exchange the fresh Firebase ID token for our app JWT
      try {
        const idToken = await firebaseUser.getIdToken()
        const data = await googleLogin(idToken)
        localStorage.setItem('token', data.token)
        setUser(data.user)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [])

  const logout = async () => {
    await signOut(firebaseAuth)
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

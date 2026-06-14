import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithPopup } from 'firebase/auth'
import { firebaseAuth, googleProvider } from '../../lib/firebase'
import { googleLogin } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)
    try {
      // Open the Google sign-in popup via Firebase Auth
      const result = await signInWithPopup(firebaseAuth, googleProvider)
      // Get the Firebase ID token to send to our backend
      const idToken = await result.user.getIdToken()
      const data = await googleLogin(idToken)
      localStorage.setItem('token', data.token)
      setUser(data.user)   // immediate update — onAuthStateChanged will also fire
      navigate('/')
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        // User dismissed the popup — not an error worth showing
      } else {
        setError('Sign-in failed. Please try again.')
        console.error(err)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-brand-700 mb-2">LuyenThi</h1>
        <p className="text-gray-500 mb-8 text-sm">Exam Preparation Platform</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {loading ? 'Signing in…' : 'Continue with Google'}
        </button>

        <p className="mt-6 text-xs text-gray-400">
          By signing in you agree to our terms of service.
        </p>
      </div>
    </div>
  )
}

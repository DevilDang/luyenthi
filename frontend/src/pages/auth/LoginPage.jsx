import { useState } from 'react'
import { signInWithPopup } from 'firebase/auth'
import { firebaseAuth, googleProvider } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'

function Cloud({ className, style }) {
  return (
    <svg viewBox="0 0 240 90" className={className} style={style} aria-hidden="true">
      <ellipse cx="120" cy="68" rx="100" ry="32" fill="white" />
      <ellipse cx="80"  cy="50" rx="52"  ry="40" fill="white" />
      <ellipse cx="140" cy="46" rx="60"  ry="36" fill="white" />
      <ellipse cx="185" cy="60" rx="42"  ry="28" fill="white" />
    </svg>
  )
}

function DoraemonChar() {
  return (
    <svg viewBox="0 0 56 64" width="56" height="64" aria-hidden="true">
      {/* body */}
      <circle cx="28" cy="30" r="24" fill="#0095c8" />
      {/* white face */}
      <ellipse cx="28" cy="34" rx="18" ry="16" fill="white" />
      {/* eyes */}
      <circle cx="21" cy="26" r="5" fill="white" /><circle cx="35" cy="26" r="5" fill="white" />
      <circle cx="22" cy="27" r="2.5" fill="#222" /><circle cx="36" cy="27" r="2.5" fill="#222" />
      {/* nose */}
      <circle cx="28" cy="33" r="4" fill="#ff4757" />
      {/* mouth */}
      <path d="M18 40 Q28 48 38 40" stroke="#555" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* whiskers */}
      <line x1="4"  y1="33" x2="18" y2="35" stroke="#555" strokeWidth="1" /><line x1="4"  y1="38" x2="18" y2="38" stroke="#555" strokeWidth="1" />
      <line x1="38" y1="35" x2="52" y2="33" stroke="#555" strokeWidth="1" /><line x1="38" y1="38" x2="52" y2="38" stroke="#555" strokeWidth="1" />
      {/* collar */}
      <rect x="12" y="51" width="32" height="6" rx="3" fill="#ff4757" />
      <circle cx="28" cy="57" r="4" fill="#ffd32a" />
    </svg>
  )
}

function NobitaChar() {
  return (
    <svg viewBox="0 0 48 60" width="42" height="52" aria-hidden="true">
      <circle cx="24" cy="24" r="18" fill="#f5c97a" />
      {/* glasses */}
      <circle cx="17" cy="23" r="6" fill="none" stroke="#4a3728" strokeWidth="2" />
      <circle cx="31" cy="23" r="6" fill="none" stroke="#4a3728" strokeWidth="2" />
      <line x1="23" y1="23" x2="25" y2="23" stroke="#4a3728" strokeWidth="2" />
      <circle cx="18" cy="23" r="3" fill="white" /><circle cx="32" cy="23" r="3" fill="white" />
      <circle cx="19" cy="24" r="1.5" fill="#222" /><circle cx="33" cy="24" r="1.5" fill="#222" />
      <path d="M17 33 Q24 39 31 33" stroke="#b07050" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* shirt */}
      <rect x="10" y="40" width="28" height="16" rx="4" fill="#ffff80" />
    </svg>
  )
}

function ShizukaChar() {
  return (
    <svg viewBox="0 0 48 60" width="42" height="52" aria-hidden="true">
      <circle cx="24" cy="22" r="17" fill="#fde8c8" />
      {/* hair */}
      <path d="M7 22 Q8 6 24 5 Q40 6 41 22 Q38 10 24 11 Q10 10 7 22z" fill="#2c1a0e" />
      <circle cx="24" cy="5" r="5" fill="#2c1a0e" />
      {/* eyes */}
      <ellipse cx="18" cy="21" rx="3.5" ry="4" fill="#222" />
      <ellipse cx="30" cy="21" rx="3.5" ry="4" fill="#222" />
      <circle cx="17" cy="20" r="1.2" fill="white" /><circle cx="29" cy="20" r="1.2" fill="white" />
      {/* blush */}
      <ellipse cx="13" cy="26" rx="4" ry="2.5" fill="#ffb3c6" opacity="0.6" />
      <ellipse cx="35" cy="26" rx="4" ry="2.5" fill="#ffb3c6" opacity="0.6" />
      <path d="M17 30 Q24 36 31 30" stroke="#d07070" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <rect x="10" y="38" width="28" height="18" rx="5" fill="#ffb3c6" />
    </svg>
  )
}

function GianChar() {
  return (
    <svg viewBox="0 0 52 64" width="46" height="56" aria-hidden="true">
      <circle cx="26" cy="26" r="21" fill="#d4956a" />
      {/* eyebrows */}
      <path d="M14 18 Q20 14 26 17" stroke="#5c3a1e" strokeWidth="2.5" fill="none" />
      <path d="M26 17 Q32 14 38 18" stroke="#5c3a1e" strokeWidth="2.5" fill="none" />
      {/* eyes */}
      <ellipse cx="19" cy="23" rx="4" ry="4.5" fill="#222" />
      <ellipse cx="33" cy="23" rx="4" ry="4.5" fill="#222" />
      <circle cx="18" cy="21" r="1.5" fill="white" /><circle cx="32" cy="21" r="1.5" fill="white" />
      {/* nose broad */}
      <ellipse cx="26" cy="28" rx="4" ry="3" fill="#bf7545" />
      <path d="M16 34 Q26 42 36 34" stroke="#8b4513" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <rect x="8"  y="44" width="36" height="18" rx="4" fill="#5b8dd9" />
    </svg>
  )
}

function SuneoChar() {
  return (
    <svg viewBox="0 0 46 58" width="40" height="50" aria-hidden="true">
      <circle cx="23" cy="22" r="16" fill="#f0d0a0" />
      {/* slick hair */}
      <path d="M7 18 Q10 4 23 4 Q38 4 39 18 Q34 8 23 9 Q12 8 7 18z" fill="#1a1a2e" />
      {/* smug eyes */}
      <path d="M13 20 Q17 17 21 20" stroke="#222" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M25 20 Q29 17 33 20" stroke="#222" strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="17" cy="22" rx="3" ry="2.5" fill="#222" />
      <ellipse cx="29" cy="22" rx="3" ry="2.5" fill="#222" />
      {/* smug smile */}
      <path d="M16 30 Q23 34 30 29" stroke="#c07030" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <rect x="9" y="36" width="28" height="18" rx="4" fill="#a855f7" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg viewBox="0 0 64 72" className="w-16 h-16 mx-auto" aria-hidden="true">
      <path d="M32 8C19 8 11 19 11 32v14H7v5h50v-5h-4V32C53 19 45 8 32 8z"
            fill="#ffd32a" stroke="#e6b800" strokeWidth="1.5" />
      <path d="M24 8 Q32 2 40 8" stroke="#e6b800" strokeWidth="1.5" fill="none" />
      <circle cx="32" cy="54" r="6" fill="#ffd32a" stroke="#e6b800" strokeWidth="1.5" />
      <ellipse cx="24" cy="22" rx="4" ry="7" fill="white" opacity="0.35" transform="rotate(-20 24 22)" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

const STARS = [
  { left: '6%',  top: '8%',  delay: '0s' },
  { left: '18%', top: '14%', delay: '0.7s' },
  { left: '32%', top: '6%',  delay: '1.4s' },
  { left: '52%', top: '10%', delay: '0.3s' },
  { left: '68%', top: '5%',  delay: '1.1s' },
  { left: '80%', top: '15%', delay: '0.5s' },
  { left: '90%', top: '8%',  delay: '1.8s' },
  { left: '10%', top: '70%', delay: '0.9s' },
  { left: '25%', top: '78%', delay: '1.6s' },
  { left: '75%', top: '72%', delay: '0.2s' },
  { left: '88%', top: '65%', delay: '1.3s' },
  { left: '45%', top: '82%', delay: '0.8s' },
]

export default function LoginPage() {
  const { loading } = useAuth()
  const [error, setError] = useState(null)

  const handleGoogleSignIn = async () => {
    setError(null)
    try {
      await signInWithPopup(firebaseAuth, googleProvider)
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Đăng nhập thất bại. Vui lòng thử lại.')
        console.error(err)
      }
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center px-4"
         style={{ background: 'linear-gradient(180deg, #1aadd9 0%, #4cbfe8 35%, #87ceeb 65%, #c2ebf9 100%)' }}>

      {/* ── Atmosphere blobs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-doraemon-400 opacity-20 blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-96 h-96 rounded-full bg-accent-yellow opacity-15 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 w-64 h-64 rounded-full bg-pink-300 opacity-15 blur-3xl" />
      </div>

      {/* ── Clouds ── */}
      <Cloud className="absolute top-[6%]  opacity-90 login-cloud w-[220px]" style={{ animationDuration: '20s' }} />
      <Cloud className="absolute top-[18%] opacity-80 login-cloud w-[300px]" style={{ animationDuration: '28s', animationDelay: '-10s', animationDirection: 'reverse' }} />
      <Cloud className="absolute top-[8%]  opacity-85 login-cloud w-[160px]" style={{ animationDuration: '16s', animationDelay: '-6s' }} />
      <Cloud className="absolute top-[62%] opacity-75 login-cloud w-[250px]" style={{ animationDuration: '24s', animationDelay: '-14s', animationDirection: 'reverse' }} />
      <Cloud className="absolute top-[74%] opacity-80 login-cloud w-[180px]" style={{ animationDuration: '19s', animationDelay: '-3s' }} />

      {/* ── Stars ── */}
      <div className="absolute inset-0 pointer-events-none">
        {STARS.map((s, i) => (
          <span key={i} className="absolute text-lg login-star select-none"
                style={{ left: s.left, top: s.top, animationDelay: s.delay }}>
            ⭐
          </span>
        ))}
      </div>

      {/* ── Characters (hidden on small screens) ── */}
      <div className="absolute inset-0 pointer-events-none hidden sm:block">
        <div className="absolute login-bob opacity-80" style={{ left: '8%',  top: '35%', animationDelay: '0s' }}>
          <DoraemonChar />
        </div>
        <div className="absolute login-bob opacity-75" style={{ left: '22%', top: '48%', animationDelay: '0.6s' }}>
          <NobitaChar />
        </div>
        <div className="absolute login-bob opacity-75" style={{ right: '22%', top: '42%', animationDelay: '1.2s' }}>
          <ShizukaChar />
        </div>
        <div className="absolute login-bob opacity-70" style={{ right: '8%',  top: '46%', animationDelay: '1.8s' }}>
          <GianChar />
        </div>
        <div className="absolute login-bob opacity-70" style={{ left: '46%', top: '58%', animationDelay: '0.9s' }}>
          <SuneoChar />
        </div>
      </div>

      {/* ── Ground strip ── */}
      <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
           style={{ background: 'linear-gradient(180deg, transparent, rgba(80,180,80,0.25))' }} />

      {/* ── Login Card ── */}
      <div className="relative z-10 w-full max-w-sm page-enter">
        <div className="rounded-4xl p-8 text-center"
             style={{
               background: 'rgba(255,255,255,0.88)',
               backdropFilter: 'blur(16px)',
               WebkitBackdropFilter: 'blur(16px)',
               border: '1.5px solid rgba(255,255,255,0.7)',
               boxShadow: '0 20px 60px rgba(0,42,101,0.22), 0 0 0 1px rgba(255,255,255,0.5)',
             }}>

          {/* Bell */}
          <div className="mb-2 drop-shadow-md">
            <BellIcon />
          </div>

          <h1 className="text-4xl font-black text-doraemon-700 tracking-tight mb-1">
            LuyenThi
          </h1>
          <p className="text-sm font-semibold text-doraemon-500 mb-1">
            Nền tảng luyện thi thông minh
          </p>
          <p className="text-xs text-doraemon-300 mb-8">
            ✦ Học vui – Thi giỏi – Tiến xa ✦
          </p>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-full border-2 border-doraemon-200 bg-white px-6 py-3 font-bold text-doraemon-700 transition-all duration-200 hover:border-doraemon-400 hover:bg-doraemon-50 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            style={{ boxShadow: '0 4px 14px rgba(0,149,200,0.2)' }}
          >
            <GoogleIcon />
            {loading ? 'Đang đăng nhập…' : 'Đăng nhập với Google'}
          </button>

          {/* Decorative emoji row */}
          <div className="mt-6 flex items-center justify-center gap-3 text-xl select-none">
            <span>🤖</span><span>📚</span><span>⭐</span><span>🎯</span><span>🏆</span>
          </div>

          <p className="mt-4 text-xs text-doraemon-300">
            Bằng cách đăng nhập, bạn đồng ý với điều khoản dịch vụ.
          </p>
        </div>
      </div>
    </div>
  )
}

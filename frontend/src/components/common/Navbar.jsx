import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold text-brand-600">LuyenThi</Link>

      <div className="flex items-center gap-6">
        <Link to="/exams" className="text-sm text-gray-600 hover:text-brand-600">Exams</Link>
        <Link to="/leaderboard" className="text-sm text-gray-600 hover:text-brand-600">Leaderboard</Link>
        {user?.role === 'admin' && (
          <Link to="/admin/exams" className="text-sm text-orange-600 hover:text-orange-700 font-medium">Admin</Link>
        )}
        <Link to="/profile">
          <img
            src={user?.photo_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'U')}
            alt="avatar"
            className="h-8 w-8 rounded-full object-cover border border-gray-200"
          />
        </Link>
        <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500">
          Logout
        </button>
      </div>
    </nav>
  )
}

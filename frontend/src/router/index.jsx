import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/common/ProtectedRoute'
import AdminRoute from '../components/common/AdminRoute'
import Navbar from '../components/common/Navbar'
import { useAuth } from '../context/AuthContext'

import LoginPage from '../pages/auth/LoginPage'
import HomePage from '../pages/dashboard/HomePage'
import ExamListPage from '../pages/dashboard/ExamListPage'
import LeaderboardPage from '../pages/dashboard/LeaderboardPage'
import ExamPage from '../pages/exam/ExamPage'
import ResultPage from '../pages/exam/ResultPage'
import ProfilePage from '../pages/profile/ProfilePage'
import UsersPage from '../pages/admin/UsersPage'
import ExamsPage from '../pages/admin/ExamsPage'
import CreateExamPage from '../pages/admin/CreateExamPage'
import ExamEditPage from '../pages/admin/ExamEditPage'
import QuestionEditorPage from '../pages/admin/QuestionEditorPage'

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}

export default function AppRouter() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />

      <Route path="/" element={<ProtectedRoute><Layout><HomePage /></Layout></ProtectedRoute>} />
      <Route path="/exams" element={<ProtectedRoute><Layout><ExamListPage /></Layout></ProtectedRoute>} />
      <Route path="/exams/:examID" element={<ProtectedRoute><ExamPage /></ProtectedRoute>} />
      <Route path="/exams/:examID/result" element={<ProtectedRoute><Layout><ResultPage /></Layout></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute><Layout><LeaderboardPage /></Layout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>} />

      <Route path="/admin" element={<Navigate to="/admin/exams" replace />} />
      <Route path="/admin/users" element={<AdminRoute><Layout><UsersPage /></Layout></AdminRoute>} />
      <Route path="/admin/exams" element={<AdminRoute><Layout><ExamsPage /></Layout></AdminRoute>} />
      {/* /new must come before /:examID so React Router matches it as static */}
      <Route path="/admin/exams/new" element={<AdminRoute><Layout><CreateExamPage /></Layout></AdminRoute>} />
      <Route path="/admin/exams/:examID" element={<AdminRoute><Layout><ExamEditPage /></Layout></AdminRoute>} />
      <Route path="/admin/exams/:examID/questions/new" element={<AdminRoute><Layout><QuestionEditorPage /></Layout></AdminRoute>} />
      <Route path="/admin/exams/:examID/questions/:qID/edit" element={<AdminRoute><Layout><QuestionEditorPage /></Layout></AdminRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { updateProfile } from '../../api/exams'
import { useQuery } from '@tanstack/react-query'
import { getHistory } from '../../api/exams'

const GRADES = ['pre-k', 'grade-1', 'grade-2', 'grade-3', 'grade-4', 'grade-5',
  'grade-6', 'grade-7', 'grade-8', 'grade-9', 'grade-10', 'grade-11', 'grade-12', 'general']

export default function ProfilePage() {
  const { user, setUser } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    age: user?.age || '',
    grade_level: user?.grade_level || 'general',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  const { data: histData } = useQuery({ queryKey: ['history'], queryFn: getHistory })
  const subs = histData?.submissions || []
  const totalExams = subs.length
  const avgPct = totalExams > 0
    ? (subs.reduce((s, x) => s + (x.percentage || 0), 0) / totalExams).toFixed(1)
    : null

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const updated = await updateProfile({ ...form, age: Number(form.age) })
      setUser(updated)
      setSaved(true)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Profile</h1>

      {/* Avatar + stats */}
      <div className="flex items-center gap-5 bg-white border border-gray-200 rounded-2xl p-6">
        <img
          src={user?.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&size=96`}
          alt="avatar"
          className="h-20 w-20 rounded-full border border-gray-200"
        />
        <div>
          <p className="font-semibold text-gray-800">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <div className="flex gap-4 mt-2 text-xs text-gray-400">
            <span>{totalExams} exams taken</span>
            {avgPct && <span>avg {avgPct}%</span>}
          </div>
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <h2 className="font-semibold text-gray-700">Edit Information</h2>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Age</label>
          <input
            type="number"
            min={3}
            max={99}
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Grade Level</label>
          <select
            value={form.grade_level}
            onChange={(e) => setForm({ ...form, grade_level: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {saved && <p className="text-sm text-green-600">Profile updated!</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-brand-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { adminListExams, adminCreateExam, adminDeleteExam, adminTogglePublish } from '../../api/admin'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const SUBJECTS = [
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'natural_sciences', label: 'Natural Sciences' },
  { value: 'social_sciences', label: 'Social Sciences & Languages' },
]

const GRADES = ['pre-k', 'grade-1', 'grade-2', 'grade-3', 'grade-4', 'grade-5',
  'grade-6', 'grade-7', 'grade-8', 'grade-9', 'grade-10', 'grade-11', 'grade-12', 'general']

function CreateModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    title: '', description: '', subject: 'mathematics',
    subject_detail: '', grade_level: 'general', time_limit_min: 0,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onCreate({ ...form, time_limit_min: Number(form.time_limit_min) })
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create exam')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="font-semibold text-gray-800 mb-4">Create Exam</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Title *</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Subject</label>
              <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                {SUBJECTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Subject Detail</label>
              <input value={form.subject_detail} onChange={(e) => setForm({ ...form, subject_detail: e.target.value })}
                placeholder="e.g. Algebra, Physics…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Grade Level</label>
              <select value={form.grade_level} onChange={(e) => setForm({ ...form, grade_level: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Time Limit (min)</label>
              <input type="number" min={0} value={form.time_limit_min}
                onChange={(e) => setForm({ ...form, time_limit_min: e.target.value })}
                placeholder="0 = unlimited"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 rounded-xl py-2 text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-brand-600 text-white rounded-xl py-2 text-sm font-semibold hover:bg-brand-700 disabled:opacity-50">
              {saving ? 'Creating…' : 'Create Exam'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ExamsPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['admin-exams'], queryFn: adminListExams })
  const [showCreate, setShowCreate] = useState(false)

  const createMut = useMutation({
    mutationFn: adminCreateExam,
    onSuccess: () => qc.invalidateQueries(['admin-exams']),
  })

  const deleteMut = useMutation({
    mutationFn: adminDeleteExam,
    onSuccess: () => qc.invalidateQueries(['admin-exams']),
  })

  const publishMut = useMutation({
    mutationFn: adminTogglePublish,
    onSuccess: () => qc.invalidateQueries(['admin-exams']),
  })

  const handleDelete = (exam) => {
    if (window.confirm(`Delete "${exam.title}"? This cannot be undone.`)) {
      deleteMut.mutate(exam.id)
    }
  }

  const exams = data?.exams || []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Exam Management</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
        >
          + New Exam
        </button>
      </div>

      {isLoading ? <LoadingSpinner /> : exams.length === 0 ? (
        <p className="text-gray-400 text-sm">No exams yet. Create your first one!</p>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Grade</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Questions</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {exams.map((exam) => (
                <tr key={exam.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{exam.title}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{exam.subject_detail || exam.subject}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{exam.grade_level}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{exam.question_count}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => publishMut.mutate(exam.id)}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium cursor-pointer transition-colors ${
                        exam.is_published
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {exam.is_published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/exams/${exam.id}`}
                        className="text-xs text-brand-600 hover:underline">Edit</Link>
                      <button onClick={() => handleDelete(exam)}
                        className="text-xs text-red-500 hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreate={(data) => createMut.mutateAsync(data)}
        />
      )}
    </div>
  )
}

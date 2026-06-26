import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { adminCreateExam } from '../../api/admin'

const SUBJECTS = [
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'natural_sciences', label: 'Natural Sciences' },
  { value: 'social_sciences', label: 'Social Sciences & Languages' },
]

const GRADES = [
  'pre-k', 'grade-1', 'grade-2', 'grade-3', 'grade-4', 'grade-5',
  'grade-6', 'grade-7', 'grade-8', 'grade-9', 'grade-10', 'grade-11', 'grade-12', 'general',
]

export default function CreateExamPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    description: '',
    subject: 'mathematics',
    subject_detail: '',
    grade_level: 'general',
    time_limit_min: 45,
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }))
    if (errors[k]) setErrors((e) => ({ ...e, [k]: null }))
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.subject) e.subject = 'Subject is required'
    if (!form.grade_level) e.grade_level = 'Grade level is required'
    if (!form.time_limit_min || Number(form.time_limit_min) <= 0) e.time_limit_min = 'Time limit must be > 0'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      const exam = await adminCreateExam({ ...form, time_limit_min: Number(form.time_limit_min) })
      navigate(`/admin/exams/${exam.id}`)
    } catch (err) {
      setErrors({ _form: err.response?.data?.error || 'Failed to create exam' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/exams" className="text-sm text-gray-500 hover:text-gray-700">
          ← Exam Management
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Exam</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="e.g. Toán lớp 10 - Đại số Chương 1"
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
              errors.title ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Brief description of the exam..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
            <select
              value={form.subject}
              onChange={(e) => set('subject', e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                errors.subject ? 'border-red-400' : 'border-gray-300'
              }`}
            >
              {SUBJECTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Detail</label>
            <input
              value={form.subject_detail}
              onChange={(e) => set('subject_detail', e.target.value)}
              placeholder="e.g. Algebra, Physics…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grade Level <span className="text-red-500">*</span>
            </label>
            <select
              value={form.grade_level}
              onChange={(e) => set('grade_level', e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                errors.grade_level ? 'border-red-400' : 'border-gray-300'
              }`}
            >
              {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            {errors.grade_level && <p className="text-xs text-red-500 mt-1">{errors.grade_level}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Limit (minutes) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              value={form.time_limit_min}
              onChange={(e) => set('time_limit_min', e.target.value)}
              placeholder="e.g. 45"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                errors.time_limit_min ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors.time_limit_min && <p className="text-xs text-red-500 mt-1">{errors.time_limit_min}</p>}
          </div>
        </div>

        {errors._form && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{errors._form}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Link
            to="/admin/exams"
            className="flex-1 text-center border border-gray-300 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-brand-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Creating…' : 'Create Exam →'}
          </button>
        </div>
      </form>
    </div>
  )
}

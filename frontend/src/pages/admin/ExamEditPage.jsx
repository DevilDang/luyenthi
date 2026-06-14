import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getExam } from '../../api/exams'
import {
  adminUpdateExam,
  adminTogglePublish,
  adminAddQuestion,
  adminUpdateQuestion,
  adminDeleteQuestion,
} from '../../api/admin'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import MathRenderer from '../../components/math/MathRenderer'

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'essay', label: 'Essay' },
]

function QuestionForm({ examID, question, onDone }) {
  const isEdit = Boolean(question?.id)
  const [form, setForm] = useState({
    order: question?.order || 1,
    type: question?.type || 'multiple_choice',
    content: question?.content || '',
    points: question?.points || 1,
    options: question?.options || [{ id: 'a', content: '' }, { id: 'b', content: '' }],
    correct_option_ids: question?.correct_option_ids || [],
    correct_answers: question?.correct_answers?.join('\n') || '',
    explanation: question?.explanation || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const qc = useQueryClient()

  const addOption = () => {
    const id = String.fromCharCode(97 + form.options.length)
    setForm({ ...form, options: [...form.options, { id, content: '' }] })
  }

  const updateOption = (idx, content) => {
    const opts = form.options.map((o, i) => i === idx ? { ...o, content } : o)
    setForm({ ...form, options: opts })
  }

  const toggleCorrect = (id) => {
    const cur = form.correct_option_ids
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    setForm({ ...form, correct_option_ids: next })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const payload = {
      order: Number(form.order),
      type: form.type,
      content: form.content,
      points: Number(form.points),
      explanation: form.explanation,
      ...(form.type === 'multiple_choice' ? {
        options: form.options.filter((o) => o.content),
        correct_option_ids: form.correct_option_ids,
      } : {}),
      ...(form.type === 'short_answer' ? {
        correct_answers: form.correct_answers.split('\n').map((s) => s.trim()).filter(Boolean),
      } : {}),
    }
    try {
      if (isEdit) {
        await adminUpdateQuestion(examID, question.id, payload)
      } else {
        await adminAddQuestion(examID, payload)
      }
      qc.invalidateQueries(['exam', examID])
      onDone()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save question')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[92vh] overflow-y-auto">
        <h3 className="font-semibold text-gray-800 mb-4">{isEdit ? 'Edit' : 'Add'} Question</h3>
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                {QUESTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Points</label>
              <input type="number" min={0.5} step={0.5} required value={form.points}
                onChange={(e) => setForm({ ...form, points: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Order</label>
              <input type="number" min={1} required value={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Question Content <span className="text-gray-400 text-xs">(Use $…$ for inline LaTeX, $$…$$ for display)</span>
            </label>
            <textarea required rows={4} value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="e.g. Solve for $x$: $$2x + 3 = 7$$"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y font-mono" />
            {form.content && (
              <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                <p className="text-xs text-gray-400 mb-1">Preview:</p>
                <MathRenderer content={form.content} />
              </div>
            )}
          </div>

          {form.type === 'multiple_choice' && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Options (check = correct answer)</label>
              <div className="space-y-2">
                {form.options.map((opt, i) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <input type="checkbox" checked={form.correct_option_ids.includes(opt.id)}
                      onChange={() => toggleCorrect(opt.id)} className="accent-brand-500" />
                    <span className="text-xs font-bold text-gray-400 w-5">{opt.id.toUpperCase()}.</span>
                    <input value={opt.content} onChange={(e) => updateOption(i, e.target.value)}
                      placeholder={`Option ${opt.id.toUpperCase()}`}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                ))}
              </div>
              {form.options.length < 6 && (
                <button type="button" onClick={addOption}
                  className="mt-2 text-xs text-brand-600 hover:underline">+ Add option</button>
              )}
            </div>
          )}

          {form.type === 'short_answer' && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Accepted Answers <span className="text-gray-400 text-xs">(one per line, case-insensitive)</span>
              </label>
              <textarea rows={3} value={form.correct_answers}
                onChange={(e) => setForm({ ...form, correct_answers: e.target.value })}
                placeholder="answer 1&#10;answer 2"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Explanation (optional)</label>
            <textarea rows={2} value={form.explanation}
              onChange={(e) => setForm({ ...form, explanation: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onDone}
              className="flex-1 border border-gray-300 rounded-xl py-2 text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-brand-600 text-white rounded-xl py-2 text-sm font-semibold hover:bg-brand-700 disabled:opacity-50">
              {saving ? 'Saving…' : isEdit ? 'Update' : 'Add Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ExamEditPage() {
  const { examID } = useParams()
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['exam', examID],
    queryFn: () => getExam(examID),
  })
  const [editQuestion, setEditQuestion] = useState(null)
  const [showAdd, setShowAdd] = useState(false)

  const publishMut = useMutation({
    mutationFn: () => adminTogglePublish(examID),
    onSuccess: () => qc.invalidateQueries(['exam', examID]),
  })

  const deleteMut = useMutation({
    mutationFn: (qID) => adminDeleteQuestion(examID, qID),
    onSuccess: () => qc.invalidateQueries(['exam', examID]),
  })

  if (isLoading) return <LoadingSpinner />

  const exam = data?.exam
  const questions = data?.questions || []

  return (
    <div className="space-y-6">
      {/* Exam header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{exam?.title}</h1>
            <p className="text-sm text-gray-500 mt-1">{exam?.description}</p>
            <div className="flex gap-4 mt-2 text-xs text-gray-400">
              <span>{exam?.subject_detail || exam?.subject}</span>
              <span>{exam?.grade_level}</span>
              <span>{exam?.total_points} pts</span>
              <span>{exam?.time_limit_min > 0 ? `${exam.time_limit_min} min` : 'No time limit'}</span>
            </div>
          </div>
          <button
            onClick={() => publishMut.mutate()}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              exam?.is_published
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {exam?.is_published ? 'Published' : 'Draft'} · Toggle
          </button>
        </div>
      </div>

      {/* Questions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-700">
            Questions ({questions.length}) · {exam?.total_points} / 100 pts
          </h2>
          <button
            onClick={() => setShowAdd(true)}
            className="bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            + Add Question
          </button>
        </div>

        {questions.length === 0 ? (
          <p className="text-gray-400 text-sm">No questions yet. Add the first one!</p>
        ) : (
          <div className="space-y-3">
            {questions.map((q, i) => (
              <div key={q.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-400">Q{i + 1}</span>
                      <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">{q.type}</span>
                      <span className="text-xs text-brand-600 font-medium">{q.points} pts</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      <MathRenderer content={q.content} />
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setEditQuestion(q)}
                      className="text-xs text-brand-600 hover:underline">Edit</button>
                    <button onClick={() => {
                      if (window.confirm('Delete this question?')) deleteMut.mutate(q.id)
                    }} className="text-xs text-red-500 hover:underline">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(showAdd || editQuestion) && (
        <QuestionForm
          examID={examID}
          question={editQuestion}
          onDone={() => { setShowAdd(false); setEditQuestion(null) }}
        />
      )}
    </div>
  )
}

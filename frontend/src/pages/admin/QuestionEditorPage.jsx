import { useState } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminAddQuestion, adminUpdateQuestion } from '../../api/admin'
import MarkdownEditor, { MarkdownPreview } from '../../components/editor/MarkdownEditor'

const QUESTION_TYPES = [
  { value: 'single_choice', label: 'Single Choice' },
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'essay', label: 'Essay' },
]

const TYPE_LABELS = Object.fromEntries(QUESTION_TYPES.map((t) => [t.value, t.label]))

function initForm(q) {
  return {
    order: q?.order ?? 1,
    type: q?.type ?? 'single_choice',
    content: q?.content ?? '',
    points: q?.points ?? 1,
    options: q?.options?.length
      ? q.options
      : [{ id: 'a', content: '' }, { id: 'b', content: '' }],
    correct_option_ids: q?.correct_option_ids ?? [],
    correct_answers: q?.correct_answers?.join('\n') ?? '',
    explanation: q?.explanation ?? '',
  }
}

function OptionsEditor({ form, setForm }) {
  const isSingle = form.type === 'single_choice'

  const addOption = () => {
    const id = String.fromCharCode(97 + form.options.length)
    setForm((f) => ({ ...f, options: [...f.options, { id, content: '' }] }))
  }

  const updateOption = (idx, content) =>
    setForm((f) => ({ ...f, options: f.options.map((o, i) => (i === idx ? { ...o, content } : o)) }))

  const removeOption = (idx) =>
    setForm((f) => ({ ...f, options: f.options.filter((_, i) => i !== idx) }))

  const toggleCorrect = (id) => {
    setForm((f) => {
      if (isSingle) return { ...f, correct_option_ids: [id] }
      const cur = f.correct_option_ids
      return {
        ...f,
        correct_option_ids: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
      }
    })
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Answer Options
        <span className="ml-1 text-xs text-gray-400 font-normal">
          ({isSingle ? 'select 1 correct' : 'select all correct'})
        </span>
      </label>
      <div className="space-y-2">
        {form.options.map((opt, i) => (
          <div key={opt.id} className="flex items-center gap-2">
            <input
              type={isSingle ? 'radio' : 'checkbox'}
              name="correct"
              checked={form.correct_option_ids.includes(opt.id)}
              onChange={() => toggleCorrect(opt.id)}
              className="accent-brand-500 shrink-0"
            />
            <span className="text-xs font-bold text-gray-400 w-5 shrink-0">
              {opt.id.toUpperCase()}.
            </span>
            <input
              value={opt.content}
              onChange={(e) => updateOption(i, e.target.value)}
              placeholder={`Option ${opt.id.toUpperCase()}`}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {form.options.length > 2 && (
              <button
                type="button"
                onClick={() => removeOption(i)}
                className="text-gray-400 hover:text-red-500 text-lg leading-none"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      {form.options.length < 6 && (
        <button
          type="button"
          onClick={addOption}
          className="mt-2 text-xs text-brand-600 hover:underline"
        >
          + Add option
        </button>
      )}
    </div>
  )
}

function QuestionPreview({ form }) {
  const isChoice = form.type === 'single_choice' || form.type === 'multiple_choice'

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Preview</span>
        <span className="text-xs px-2 py-0.5 bg-brand-50 text-brand-700 rounded-full font-medium">
          {TYPE_LABELS[form.type]}
        </span>
        <span className="text-xs text-gray-400 ml-auto">{form.points} pts</span>
      </div>

      <div className="text-sm text-gray-800 leading-relaxed">
        {form.content
          ? <MarkdownPreview source={form.content} />
          : <span className="text-gray-400 italic">Question content will appear here…</span>
        }
      </div>

      {isChoice && (
        <div className="space-y-2 pt-1">
          {form.options.filter((o) => o.content).map((opt) => (
            <div
              key={opt.id}
              className={`flex items-center gap-3 p-2.5 rounded-lg border text-sm ${
                form.correct_option_ids.includes(opt.id)
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200'
              }`}
            >
              <input
                type={form.type === 'single_choice' ? 'radio' : 'checkbox'}
                checked={form.correct_option_ids.includes(opt.id)}
                readOnly
                className="accent-brand-500"
              />
              <span className="font-medium text-gray-500 w-5">{opt.id.toUpperCase()}.</span>
              <span>{opt.content}</span>
            </div>
          ))}
          {form.options.every((o) => !o.content) && (
            <p className="text-gray-400 text-xs italic">Options will appear here…</p>
          )}
        </div>
      )}

      {form.type === 'short_answer' && (
        <input
          readOnly
          placeholder="Student types answer here…"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-400 bg-gray-50"
        />
      )}

      {form.type === 'essay' && (
        <textarea
          readOnly
          rows={4}
          placeholder="Student writes essay here…"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-400 bg-gray-50 resize-none"
        />
      )}

      {form.explanation && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 mb-1">Explanation</p>
          <div className="text-sm text-gray-600">
            <MarkdownPreview source={form.explanation} />
          </div>
        </div>
      )}
    </div>
  )
}

export default function QuestionEditorPage() {
  const { examID, qID } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const qc = useQueryClient()

  const existingQuestion = location.state?.question
  const isEdit = Boolean(qID)

  const [form, setForm] = useState(() => initForm(existingQuestion))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const addMut = useMutation({
    mutationFn: (payload) => adminAddQuestion(examID, payload),
    onSuccess: () => {
      qc.invalidateQueries(['admin-exam', examID])
      navigate(`/admin/exams/${examID}`)
    },
  })

  const updateMut = useMutation({
    mutationFn: (payload) => adminUpdateQuestion(examID, qID, payload),
    onSuccess: () => {
      qc.invalidateQueries(['admin-exam', examID])
      navigate(`/admin/exams/${examID}`)
    },
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.content.trim()) { setError('Question content is required'); return }
    if (Number(form.points) <= 0) { setError('Points must be greater than 0'); return }

    const isChoice = form.type === 'single_choice' || form.type === 'multiple_choice'
    if (isChoice && form.options.filter((o) => o.content).length < 2) {
      setError('At least 2 options with content are required')
      return
    }
    if (isChoice && form.correct_option_ids.length === 0) {
      setError('Please select at least one correct answer')
      return
    }
    if (form.type === 'short_answer') {
      const answers = form.correct_answers.split('\n').map((s) => s.trim()).filter(Boolean)
      if (!answers.length) { setError('At least one accepted answer is required'); return }
    }

    setSaving(true)
    setError(null)

    const payload = {
      order: Number(form.order),
      type: form.type,
      content: form.content,
      points: Number(form.points),
      explanation: form.explanation,
      ...(form.type === 'single_choice' || form.type === 'multiple_choice'
        ? {
            options: form.options.filter((o) => o.content),
            correct_option_ids: form.correct_option_ids,
          }
        : {}),
      ...(form.type === 'short_answer'
        ? {
            correct_answers: form.correct_answers.split('\n').map((s) => s.trim()).filter(Boolean),
          }
        : {}),
    }

    try {
      if (isEdit) {
        await updateMut.mutateAsync(payload)
      } else {
        await addMut.mutateAsync(payload)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save question')
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          to={`/admin/exams/${examID}`}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to exam
        </Link>
      </div>

      <h1 className="text-xl font-bold text-gray-800 mb-6">
        {isEdit ? 'Edit Question' : 'Add Question'}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: editor form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => set('type', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {QUESTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
              <input
                type="number"
                min={0.5}
                step={0.5}
                required
                value={form.points}
                onChange={(e) => set('points', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <input
                type="number"
                min={1}
                required
                value={form.order}
                onChange={(e) => set('order', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Content
              <span className="ml-1 text-xs text-gray-400 font-normal">
                (Markdown supported — use $…$ for inline math, $$…$$ for display)
              </span>
            </label>
            <MarkdownEditor
              value={form.content}
              onChange={(v) => set('content', v)}
              height={240}
            />
          </div>

          {(form.type === 'single_choice' || form.type === 'multiple_choice') && (
            <OptionsEditor form={form} setForm={setForm} />
          )}

          {form.type === 'short_answer' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Accepted Answers
                <span className="ml-1 text-xs text-gray-400 font-normal">
                  (one per line, case-insensitive)
                </span>
              </label>
              <textarea
                rows={4}
                value={form.correct_answers}
                onChange={(e) => set('correct_answers', e.target.value)}
                placeholder="answer 1&#10;answer 2&#10;1/3"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none font-mono"
              />
            </div>
          )}

          {form.type === 'essay' && (
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800">
              Essay questions are manually graded. Students will see a text area to write their answer.
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Explanation <span className="text-gray-400 font-normal text-xs">(optional — shown after submission)</span>
            </label>
            <MarkdownEditor
              value={form.explanation}
              onChange={(v) => set('explanation', v)}
              height={150}
              preview="edit"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <Link
              to={`/admin/exams/${examID}`}
              className="flex-1 text-center border border-gray-300 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-brand-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving…' : isEdit ? 'Update Question' : 'Add Question'}
            </button>
          </div>
        </form>

        {/* Right: live preview */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <QuestionPreview form={form} />
        </div>
      </div>
    </div>
  )
}

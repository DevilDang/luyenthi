import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getExam, submitExam } from '../../api/exams'
import { useTimer } from '../../hooks/useTimer'
import QuestionCard from '../../components/question/QuestionCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Navbar from '../../components/common/Navbar'

export default function ExamPage() {
  const { examID } = useParams()
  const navigate = useNavigate()
  const startedAt = useRef(new Date().toISOString())
  const [answers, setAnswers] = useState({}) // { [questionID]: { text?, options? } }
  const [submitting, setSubmitting] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['exam', examID],
    queryFn: () => getExam(examID),
  })

  const exam = data?.exam
  const questions = data?.questions || []

  const handleExpire = () => handleSubmit(true)

  const { formatted } = useTimer(exam?.time_limit_min || 0, handleExpire)

  async function handleSubmit(forced = false) {
    if (submitting) return
    if (!forced) {
      const unanswered = questions.filter((q) => {
        const a = answers[q.id]
        return !a || (!a.text && (!a.options || a.options.length === 0))
      })
      if (unanswered.length > 0 && !window.confirm(`${unanswered.length} question(s) unanswered. Submit anyway?`)) return
    }
    setSubmitting(true)
    try {
      const payload = {
        started_at: startedAt.current,
        answers: questions.map((q) => {
          const a = answers[q.id] || {}
          return {
            question_id: q.id,
            answer_text: a.text || '',
            answer_options: a.options || [],
          }
        }),
      }
      const result = await submitExam(examID, payload)
      navigate(`/exams/${examID}/result`, { state: { submission: result, questions } })
    } catch {
      alert('Failed to submit exam. Please try again.')
      setSubmitting(false)
    }
  }

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto py-12"><LoadingSpinner size="lg" /></div>
    </div>
  )
  if (isError || !exam) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto py-12 text-center text-red-500">Exam not found.</div>
    </div>
  )

  const answered = Object.keys(answers).filter((id) => {
    const a = answers[id]
    return a?.text || a?.options?.length > 0
  }).length

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Sticky exam header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-gray-800 truncate max-w-xs">{exam.title}</h1>
            <p className="text-xs text-gray-400">{answered}/{questions.length} answered</p>
          </div>
          <div className="flex items-center gap-4">
            {formatted && (
              <span className={`font-mono text-sm font-bold ${formatted <= '05:00' ? 'text-red-500' : 'text-gray-700'}`}>
                {formatted}
              </span>
            )}
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="bg-brand-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 flex gap-6">
        {/* Question navigation sidebar */}
        <aside className="hidden md:block shrink-0">
          <div className="sticky top-24 bg-white border border-gray-200 rounded-xl p-4 w-40">
            <p className="text-xs font-semibold text-gray-500 mb-3">Questions</p>
            <div className="grid grid-cols-4 gap-1">
              {questions.map((q, i) => {
                const a = answers[q.id]
                const done = a?.text || a?.options?.length > 0
                return (
                  <button
                    key={q.id}
                    onClick={() => setActiveIdx(i)}
                    className={`h-7 w-7 rounded text-xs font-medium transition-colors ${
                      i === activeIdx
                        ? 'bg-brand-600 text-white'
                        : done
                        ? 'bg-brand-100 text-brand-700'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Questions */}
        <div className="flex-1 space-y-5">
          {questions.map((q, i) => (
            <div key={q.id} id={`q-${i}`}>
              <QuestionCard
                question={q}
                index={i}
                answer={answers[q.id] || {}}
                onChange={(val) => setAnswers((prev) => ({ ...prev, [q.id]: val }))}
                disabled={submitting}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

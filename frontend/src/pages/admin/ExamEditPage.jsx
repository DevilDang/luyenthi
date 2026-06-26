import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminGetExam, adminTogglePublish, adminDeleteQuestion } from '../../api/admin'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { MarkdownPreview } from '../../components/editor/MarkdownEditor'

const TYPE_LABELS = {
  single_choice: 'Single Choice',
  multiple_choice: 'Multiple Choice',
  short_answer: 'Short Answer',
  essay: 'Essay',
}

const TYPE_COLORS = {
  single_choice: 'bg-blue-50 text-blue-700',
  multiple_choice: 'bg-indigo-50 text-indigo-700',
  short_answer: 'bg-amber-50 text-amber-700',
  essay: 'bg-purple-50 text-purple-700',
}

export default function ExamEditPage() {
  const { examID } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-exam', examID],
    queryFn: () => adminGetExam(examID),
  })

  const publishMut = useMutation({
    mutationFn: () => adminTogglePublish(examID),
    onSuccess: () => qc.invalidateQueries(['admin-exam', examID]),
  })

  const deleteMut = useMutation({
    mutationFn: (qID) => adminDeleteQuestion(examID, qID),
    onSuccess: () => qc.invalidateQueries(['admin-exam', examID]),
  })

  if (isLoading) return <LoadingSpinner />

  const exam = data?.exam
  const questions = data?.questions || []

  const handleDelete = (q) => {
    if (window.confirm(`Delete question ${q.order}?`)) {
      deleteMut.mutate(q.id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/exams" className="text-sm text-gray-500 hover:text-gray-700">
          ← Exam Management
        </Link>
      </div>

      {/* Exam header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{exam?.title}</h1>
            {exam?.description && (
              <p className="text-sm text-gray-500 mt-1">{exam.description}</p>
            )}
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
              <span>{exam?.subject_detail || exam?.subject}</span>
              <span>·</span>
              <span>{exam?.grade_level}</span>
              <span>·</span>
              <span>{exam?.time_limit_min > 0 ? `${exam.time_limit_min} min` : 'No time limit'}</span>
              <span>·</span>
              <span>{questions.length} questions</span>
              <span>·</span>
              <span>{exam?.total_points} / 100 pts</span>
            </div>
          </div>
          <button
            onClick={() => publishMut.mutate()}
            disabled={publishMut.isPending}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 ${
              exam?.is_published
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {exam?.is_published ? 'Published' : 'Draft'} · Toggle
          </button>
        </div>
      </div>

      {/* Questions list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-700">Questions</h2>
          <Link
            to={`/admin/exams/${examID}/questions/new`}
            className="bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            + Add Question
          </Link>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm mb-2">No questions yet.</p>
            <Link
              to={`/admin/exams/${examID}/questions/new`}
              className="text-brand-600 text-sm hover:underline"
            >
              Add the first question →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q, i) => (
              <div key={q.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-gray-400">Q{i + 1}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[q.type] || 'bg-gray-100 text-gray-500'}`}>
                        {TYPE_LABELS[q.type] || q.type}
                      </span>
                      <span className="text-xs text-brand-600 font-medium">{q.points} pts</span>
                    </div>
                    <div className="text-sm text-gray-700 line-clamp-2">
                      <MarkdownPreview source={q.content} />
                    </div>
                    {(q.type === 'single_choice' || q.type === 'multiple_choice') && q.options?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {q.options.map((opt) => (
                          <span
                            key={opt.id}
                            className={`text-xs px-2 py-0.5 rounded ${
                              q.correct_option_ids?.includes(opt.id)
                                ? 'bg-green-100 text-green-700 font-medium'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {opt.id.toUpperCase()}. {opt.content.slice(0, 30)}
                            {opt.content.length > 30 ? '…' : ''}
                          </span>
                        ))}
                      </div>
                    )}
                    {q.type === 'short_answer' && q.correct_answers?.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        Accepted: {q.correct_answers.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link
                      to={`/admin/exams/${examID}/questions/${q.id}/edit`}
                      state={{ question: q }}
                      className="text-xs text-brand-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(q)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

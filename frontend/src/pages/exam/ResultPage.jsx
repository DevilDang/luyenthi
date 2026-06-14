import { useLocation, useNavigate, Link } from 'react-router-dom'
import QuestionCard from '../../components/question/QuestionCard'

export default function ResultPage() {
  const { state } = useLocation()
  const navigate = useNavigate()

  if (!state?.submission) {
    navigate('/')
    return null
  }

  const { submission, questions = [] } = state
  const { score, max_score, percentage, status, answers } = submission

  const resultMap = Object.fromEntries(answers.map((a) => [a.question_id, a]))

  const scoreColor =
    percentage >= 80
      ? 'text-green-600'
      : percentage >= 50
      ? 'text-yellow-600'
      : 'text-red-600'

  return (
    <div className="space-y-8">
      {/* Score card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <p className="text-sm text-gray-500 mb-2">Your Score</p>
        <p className={`text-6xl font-bold ${scoreColor}`}>{percentage?.toFixed(0)}%</p>
        <p className="text-gray-500 mt-2">{score} / {max_score} points</p>

        {status === 'pending_essay_grade' && (
          <div className="mt-4 inline-block bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm px-4 py-2 rounded-lg">
            Essay questions are pending manual review. Score may change.
          </div>
        )}

        <div className="mt-6 flex justify-center gap-4">
          <Link
            to="/exams"
            className="bg-brand-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            Back to Exams
          </Link>
          <Link
            to="/"
            className="border border-gray-300 text-gray-700 px-6 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>

      {/* Per-question breakdown */}
      {questions.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-700 mb-4">Question Review</h2>
          <div className="space-y-4">
            {questions.map((q, i) => (
              <QuestionCard
                key={q.id}
                question={q}
                index={i}
                answer={{
                  text: resultMap[q.id]?.answer_text,
                  options: resultMap[q.id]?.answer_options,
                }}
                onChange={() => {}}
                disabled
                result={resultMap[q.id]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

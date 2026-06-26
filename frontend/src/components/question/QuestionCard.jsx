import { MarkdownPreview } from '../editor/MarkdownEditor'
import AnswerInput from './AnswerInput'

export default function QuestionCard({ question, index, answer, onChange, disabled, result }) {
  const statusColor = result
    ? result.is_correct === true
      ? 'border-green-400 bg-green-50'
      : result.is_correct === false
      ? 'border-red-400 bg-red-50'
      : 'border-yellow-400 bg-yellow-50' // essay
    : 'border-gray-200 bg-white'

  return (
    <div className={`rounded-xl border-2 p-5 transition-colors ${statusColor}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Question {index + 1}
        </span>
        <span className="text-xs font-medium text-brand-600">
          {question.points} {question.points === 1 ? 'pt' : 'pts'}
        </span>
      </div>

      <div className="text-sm text-gray-800 leading-relaxed">
        <MarkdownPreview source={question.content} />
      </div>

      <AnswerInput
        question={question}
        value={answer}
        onChange={onChange}
        disabled={disabled}
      />

      {result && result.is_correct === false && result.type !== 'essay' && (
        <p className="mt-3 text-xs text-red-600 font-medium">
          Incorrect · {result.points_earned} / {question.points} pts
        </p>
      )}
      {result && result.is_correct === true && (
        <p className="mt-3 text-xs text-green-600 font-medium">
          Correct · +{result.points_earned} pts
        </p>
      )}
      {result && result.type === 'essay' && (
        <p className="mt-3 text-xs text-yellow-700">Essay — pending manual review</p>
      )}
    </div>
  )
}

/**
 * Renders the appropriate answer input for a given question type.
 * Props:
 *   question   – question object (type, options)
 *   value      – current answer state ({ text, options })
 *   onChange   – (value) => void
 *   disabled   – bool
 */
export default function AnswerInput({ question, value = {}, onChange, disabled }) {
  const { type, options = [] } = question

  if (type === 'multiple_choice') {
    const isMulti = question.allow_multiple
    const selected = value.options || []

    const toggle = (id) => {
      if (isMulti) {
        const next = selected.includes(id)
          ? selected.filter((x) => x !== id)
          : [...selected, id]
        onChange({ options: next })
      } else {
        onChange({ options: [id] })
      }
    }

    return (
      <div className="space-y-2 mt-3">
        {options.map((opt) => {
          const checked = selected.includes(opt.id)
          return (
            <label
              key={opt.id}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                checked ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <input
                type={isMulti ? 'checkbox' : 'radio'}
                checked={checked}
                onChange={() => !disabled && toggle(opt.id)}
                className="accent-brand-500"
                disabled={disabled}
              />
              <span className="text-sm">{opt.content}</span>
            </label>
          )
        })}
      </div>
    )
  }

  if (type === 'short_answer') {
    return (
      <input
        type="text"
        value={value.text || ''}
        onChange={(e) => onChange({ text: e.target.value })}
        disabled={disabled}
        placeholder="Your answer…"
        className="mt-3 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
      />
    )
  }

  if (type === 'essay') {
    return (
      <textarea
        value={value.text || ''}
        onChange={(e) => onChange({ text: e.target.value })}
        disabled={disabled}
        placeholder="Write your answer here…"
        rows={6}
        className="mt-3 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60 resize-y"
      />
    )
  }

  return null
}

import katex from 'katex'

/**
 * Renders a string containing LaTeX delimiters:
 *   $$...$$ → display math block
 *   $...$   → inline math
 * Any surrounding plain text is rendered as-is.
 */
export default function MathRenderer({ content = '', className = '' }) {
  const parts = tokenize(content)

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.type === 'text') {
          return <span key={i}>{part.value}</span>
        }
        try {
          const html = katex.renderToString(part.value, {
            displayMode: part.type === 'display',
            throwOnError: false,
            trust: false,
            macros: { '\\ce': '\\text{#1}' }, // fallback for mhchem if not loaded
          })
          return (
            <span
              key={i}
              className={part.type === 'display' ? 'block my-2' : 'inline'}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )
        } catch {
          return <span key={i} className="text-red-500">{part.value}</span>
        }
      })}
    </span>
  )
}

function tokenize(str) {
  const result = []
  let remaining = str

  while (remaining.length > 0) {
    const displayIdx = remaining.indexOf('$$')
    const inlineIdx = remaining.indexOf('$')

    if (displayIdx === -1 && inlineIdx === -1) {
      result.push({ type: 'text', value: remaining })
      break
    }

    if (displayIdx !== -1 && (inlineIdx === -1 || displayIdx <= inlineIdx)) {
      if (displayIdx > 0) result.push({ type: 'text', value: remaining.slice(0, displayIdx) })
      const end = remaining.indexOf('$$', displayIdx + 2)
      if (end === -1) { result.push({ type: 'text', value: remaining }); break }
      result.push({ type: 'display', value: remaining.slice(displayIdx + 2, end) })
      remaining = remaining.slice(end + 2)
    } else {
      if (inlineIdx > 0) result.push({ type: 'text', value: remaining.slice(0, inlineIdx) })
      const end = remaining.indexOf('$', inlineIdx + 1)
      if (end === -1) { result.push({ type: 'text', value: remaining }); break }
      result.push({ type: 'inline', value: remaining.slice(inlineIdx + 1, end) })
      remaining = remaining.slice(end + 1)
    }
  }

  return result
}

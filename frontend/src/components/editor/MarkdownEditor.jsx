import MDEditor from '@uiw/react-md-editor'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'
import 'katex/dist/katex.min.css'

const PREVIEW_OPTS = {
  remarkPlugins: [remarkMath],
  rehypePlugins: [rehypeKatex],
}

export default function MarkdownEditor({ value, onChange, height = 280, preview = 'live' }) {
  return (
    <div data-color-mode="light">
      <MDEditor
        value={value}
        onChange={(val) => onChange(val ?? '')}
        height={height}
        preview={preview}
        previewOptions={PREVIEW_OPTS}
      />
    </div>
  )
}

export function MarkdownPreview({ source }) {
  return (
    <div data-color-mode="light">
      <MDEditor.Markdown
        source={source || ''}
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        style={{ background: 'transparent', fontSize: '0.875rem' }}
      />
    </div>
  )
}

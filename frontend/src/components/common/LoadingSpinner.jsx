export default function LoadingSpinner({ size = 'md' }) {
  const cls = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' }[size]
  return (
    <div className="flex justify-center items-center py-8">
      <div className={`${cls} animate-spin rounded-full border-4 border-brand-500 border-t-transparent`} />
    </div>
  )
}

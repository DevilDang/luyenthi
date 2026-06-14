import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { listExams } from '../../api/exams'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const GRADES = ['pre-k', 'grade-1', 'grade-2', 'grade-3', 'grade-4', 'grade-5',
  'grade-6', 'grade-7', 'grade-8', 'grade-9', 'grade-10', 'grade-11', 'grade-12', 'general']

const SUBJECTS = [
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'natural_sciences', label: 'Natural Sciences' },
  { value: 'social_sciences', label: 'Social Sciences & Languages' },
]

const SUBJECT_BADGE = {
  mathematics: 'bg-blue-100 text-blue-700',
  natural_sciences: 'bg-green-100 text-green-700',
  social_sciences: 'bg-purple-100 text-purple-700',
}

export default function ExamListPage() {
  const [grade, setGrade] = useState('')
  const [subject, setSubject] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['exams', grade, subject],
    queryFn: () => listExams({ grade: grade || undefined, subject: subject || undefined }),
  })

  const exams = data?.exams || []

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Exams</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Grades</option>
          {GRADES.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Subjects</option>
          {SUBJECTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : exams.length === 0 ? (
        <p className="text-gray-400 text-sm">No exams found for the selected filters.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {exams.map((exam) => (
            <Link
              key={exam.id}
              to={`/exams/${exam.id}`}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-brand-400 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-semibold text-gray-800 group-hover:text-brand-600 transition-colors">
                  {exam.title}
                </h3>
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${SUBJECT_BADGE[exam.subject] || 'bg-gray-100 text-gray-600'}`}>
                  {exam.subject_detail || exam.subject}
                </span>
              </div>
              {exam.description && (
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{exam.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>{exam.grade_level}</span>
                <span>{exam.question_count} questions</span>
                <span>{exam.total_points} pts</span>
                {exam.time_limit_min > 0 && <span>{exam.time_limit_min} min</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

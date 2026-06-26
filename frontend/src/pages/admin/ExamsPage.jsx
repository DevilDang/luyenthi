import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { adminListExams, adminDeleteExam, adminTogglePublish, adminImportExam } from '../../api/admin'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function ExamsPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['admin-exams'], queryFn: adminListExams })
  const fileInputRef = useRef(null)
  const [importError, setImportError] = useState('')
  const [importing, setImporting] = useState(false)

  const deleteMut = useMutation({
    mutationFn: adminDeleteExam,
    onSuccess: () => qc.invalidateQueries(['admin-exams']),
  })

  const publishMut = useMutation({
    mutationFn: adminTogglePublish,
    onSuccess: () => qc.invalidateQueries(['admin-exams']),
  })

  const handleDelete = (exam) => {
    if (window.confirm(`Delete "${exam.title}"? All questions will be removed.`)) {
      deleteMut.mutate(exam.id)
    }
  }

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setImportError('')
    setImporting(true)

    let payload
    try {
      const text = await file.text()
      payload = JSON.parse(text.replace(/^﻿/, ''))
    } catch {
      setImportError('The file is not valid JSON. Please check the file format.')
      setImporting(false)
      return
    }

    try {
      await adminImportExam(payload)
      qc.invalidateQueries(['admin-exams'])
    } catch (err) {
      setImportError(err?.response?.data?.error || 'Import failed. Please try again.')
    } finally {
      setImporting(false)
    }
  }

  const exams = data?.exams || []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Exam Management</h1>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImportFile}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {importing ? 'Importing…' : 'Import JSON'}
          </button>
          <Link
            to="/admin/exams/new"
            className="bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            + New Exam
          </Link>
        </div>
      </div>

      {importError && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
          {importError}
        </div>
      )}

      {isLoading ? <LoadingSpinner /> : exams.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm mb-3">No exams yet.</p>
          <Link to="/admin/exams/new" className="text-brand-600 text-sm hover:underline">
            Create your first exam →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Grade</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Questions</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {exams.map((exam) => (
                <tr key={exam.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{exam.title}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{exam.subject_detail || exam.subject}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{exam.grade_level}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{exam.question_count}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => publishMut.mutate(exam.id)}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium cursor-pointer transition-colors ${
                        exam.is_published
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {exam.is_published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/exams/${exam.id}`} className="text-xs text-brand-600 hover:underline">
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(exam)} className="text-xs text-red-500 hover:underline">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

import { useQuery } from '@tanstack/react-query'
import { getLeaderboard } from '../../api/exams'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'

const MEDALS = ['🥇', '🥈', '🥉']

export default function LeaderboardPage() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery({ queryKey: ['leaderboard'], queryFn: getLeaderboard })
  const entries = data?.leaderboard || []

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Leaderboard</h1>

      {isLoading ? (
        <LoadingSpinner />
      ) : entries.length === 0 ? (
        <p className="text-gray-400 text-sm">No data yet. Be the first to complete an exam!</p>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Grade</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Total Score</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Exams</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Avg %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map((entry, i) => {
                const isMe = entry.user_id === user?.google_id
                return (
                  <tr key={entry.user_id} className={isMe ? 'bg-brand-50' : 'hover:bg-gray-50'}>
                    <td className="px-4 py-3 font-bold text-center">
                      {i < 3 ? MEDALS[i] : <span className="text-gray-400">#{i + 1}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={entry.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.name)}`}
                          alt={entry.name}
                          className="h-7 w-7 rounded-full"
                        />
                        <span className={`font-medium ${isMe ? 'text-brand-700' : 'text-gray-800'}`}>
                          {entry.name} {isMe && <span className="text-xs text-brand-400">(you)</span>}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{entry.grade_level}</td>
                    <td className="px-4 py-3 text-right font-bold text-brand-600">{entry.total_score}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{entry.exams_taken}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{entry.avg_percentage?.toFixed(1)}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

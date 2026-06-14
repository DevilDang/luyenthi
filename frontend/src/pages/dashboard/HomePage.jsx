import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getHistory, getLeaderboard } from '../../api/exams'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const SUBJECT_COLORS = {
  mathematics: 'bg-blue-100 text-blue-700',
  natural_sciences: 'bg-green-100 text-green-700',
  social_sciences: 'bg-purple-100 text-purple-700',
}

export default function HomePage() {
  const { user } = useAuth()
  const { data: histData, isLoading: histLoading } = useQuery({
    queryKey: ['history'],
    queryFn: getHistory,
  })
  const { data: lbData } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: getLeaderboard,
  })

  const recentSubs = histData?.submissions?.slice(0, 5) || []
  const topUsers = lbData?.leaderboard?.slice(0, 5) || []

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-500 rounded-2xl p-6 text-white flex items-center gap-4">
        <img
          src={user?.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}`}
          alt="avatar"
          className="h-14 w-14 rounded-full border-2 border-white/50"
        />
        <div>
          <h2 className="text-xl font-bold">Welcome back, {user?.name}!</h2>
          <p className="text-brand-100 text-sm mt-0.5">
            Grade: {user?.grade_level || '—'} &nbsp;·&nbsp; {user?.email}
          </p>
        </div>
        <Link
          to="/exams"
          className="ml-auto bg-white text-brand-600 font-semibold px-5 py-2 rounded-xl text-sm hover:bg-brand-50 transition-colors"
        >
          Browse Exams →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent history */}
        <section>
          <h3 className="font-semibold text-gray-700 mb-3">Recent Exams</h3>
          {histLoading ? (
            <LoadingSpinner />
          ) : recentSubs.length === 0 ? (
            <p className="text-sm text-gray-400">No exams taken yet.</p>
          ) : (
            <div className="space-y-2">
              {recentSubs.map((s) => (
                <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{s.exam_title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${SUBJECT_COLORS[s.subject] || 'bg-gray-100 text-gray-600'}`}>
                      {s.subject}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-brand-600">{s.percentage?.toFixed(0)}%</p>
                    <p className="text-xs text-gray-400">{s.score}/{s.max_score} pts</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Mini leaderboard */}
        <section>
          <h3 className="font-semibold text-gray-700 mb-3">Top Students</h3>
          <div className="space-y-2">
            {topUsers.map((u, i) => (
              <div key={u.user_id} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 w-5 text-center">#{i + 1}</span>
                <img
                  src={u.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}`}
                  alt={u.name}
                  className="h-7 w-7 rounded-full"
                />
                <span className="text-sm flex-1 truncate">{u.name}</span>
                <span className="text-sm font-semibold text-brand-600">{u.total_score} pts</span>
              </div>
            ))}
          </div>
          <Link to="/leaderboard" className="mt-3 block text-xs text-center text-brand-500 hover:underline">
            View full leaderboard →
          </Link>
        </section>
      </div>
    </div>
  )
}

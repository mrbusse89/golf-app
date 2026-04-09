import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDashboard } from '../api/dashboard';
import { formatScoreToPar, formatDate, scoreColor } from '../utils/helpers';
import { useAuth } from '../utils/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-500">Loading dashboard...</div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

  const { stats, recentRounds, scoreTrend, topCourses } = data;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome back, {user?.display_name || user?.displayName || user?.username}
        </h1>
        <Link
          to="/rounds/new"
          className="bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-800 transition-colors text-sm font-medium"
        >
          + Log Round
        </Link>
      </div>

      {stats.totalRounds === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg mb-4">No rounds logged yet. Get out there and play!</p>
          <Link to="/rounds/new" className="text-green-700 font-medium hover:underline">
            Log your first round →
          </Link>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Rounds Played" value={stats.totalRounds} />
            <StatCard label="Avg Score" value={stats.avgScore} />
            <StatCard label="Best Round" value={stats.bestScore} highlight />
            <StatCard label="Avg Putts" value={stats.avgPutts || '—'} />
          </div>

          {/* Score Trend Chart */}
          {scoreTrend.length > 1 && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">Score Trend</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={scoreTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date_played"
                    tickFormatter={(d) => formatDate(d)}
                    fontSize={12}
                  />
                  <YAxis domain={['dataMin - 3', 'dataMax + 3']} fontSize={12} />
                  <Tooltip
                    formatter={(val, name) => [val, name === 'total_score' ? 'Score' : 'Par']}
                    labelFormatter={(d) => formatDate(d)}
                  />
                  <Line
                    type="monotone"
                    dataKey="total_score"
                    stroke="#15803d"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Score"
                  />
                  <Line
                    type="monotone"
                    dataKey="course_par"
                    stroke="#d1d5db"
                    strokeDasharray="5 5"
                    dot={false}
                    name="Par"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Recent Rounds */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-gray-700">Recent Rounds</h2>
              <Link to="/rounds" className="text-sm text-green-700 hover:underline">View all →</Link>
            </div>
            <div className="divide-y">
              {recentRounds.map((r) => (
                <Link
                  key={r.id}
                  to={`/rounds/${r.id}`}
                  className="flex justify-between items-center py-3 hover:bg-gray-50 px-2 -mx-2 rounded transition-colors"
                >
                  <div>
                    <div className="font-medium text-gray-800">{r.course_name}</div>
                    <div className="text-sm text-gray-500">{formatDate(r.date_played)}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${scoreColor(r.total_score, r.course_par)}`}>
                      {r.total_score}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatScoreToPar(r.total_score, r.course_par)} (par {r.course_par})
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Top Courses */}
          {topCourses.length > 0 && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">Most Played Courses</h2>
              <div className="divide-y">
                {topCourses.map((c) => (
                  <Link
                    key={c.id}
                    to={`/courses/${c.id}`}
                    className="flex justify-between items-center py-3 hover:bg-gray-50 px-2 -mx-2 rounded transition-colors"
                  >
                    <div>
                      <div className="font-medium text-gray-800">{c.name}</div>
                      <div className="text-sm text-gray-500">{c.times_played} round{c.times_played !== 1 ? 's' : ''}</div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-gray-700">Avg: {Math.round(c.avg_score * 10) / 10}</div>
                      <div className="text-green-700">Best: {c.best_score}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, highlight }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 text-center">
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${highlight ? 'text-green-700' : 'text-gray-800'}`}>
        {value}
      </div>
    </div>
  );
}

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

  if (loading) return <div className="text-center py-12 text-[#004D35]" style={{ fontFamily: "'Playfair Display', serif" }}>Loading dashboard...</div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

  const { stats, recentRounds, scoreTrend, topCourses } = data;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#004D35]" style={{ fontFamily: "'Playfair Display', serif" }}>
          Welcome back, {user?.display_name || user?.displayName || user?.username}
        </h1>
        <Link
          to="/rounds/new"
          className="bg-[#006747] text-white px-4 py-2 rounded-md hover:bg-[#004D35] transition-colors text-sm font-medium uppercase tracking-wider"
        >
          + Log Round
        </Link>
      </div>

      {stats.totalRounds === 0 ? (
        <div className="bg-white rounded-lg shadow-md border border-[#E8E0D0] p-8 text-center">
          <p className="text-[#5C5C5C] text-lg mb-4">No rounds logged yet. Get out there and play!</p>
          <Link to="/rounds/new" className="text-[#006747] font-medium hover:text-[#004D35] hover:underline">
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
            <div className="bg-white rounded-lg shadow-md border border-[#E8E0D0] p-5">
              <h2 className="text-lg font-semibold text-[#004D35] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Score Trend</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={scoreTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D0" />
                  <XAxis
                    dataKey="date_played"
                    tickFormatter={(d) => formatDate(d)}
                    fontSize={12}
                    stroke="#5C5C5C"
                  />
                  <YAxis domain={['dataMin - 3', 'dataMax + 3']} fontSize={12} stroke="#5C5C5C" />
                  <Tooltip
                    formatter={(val, name) => [val, name === 'total_score' ? 'Score' : 'Par']}
                    labelFormatter={(d) => formatDate(d)}
                    contentStyle={{ backgroundColor: '#FFF8E7', border: '1px solid #C8A951', borderRadius: '6px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total_score"
                    stroke="#006747"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#006747' }}
                    name="Score"
                  />
                  <Line
                    type="monotone"
                    dataKey="course_par"
                    stroke="#C8A951"
                    strokeDasharray="5 5"
                    dot={false}
                    name="Par"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Recent Rounds */}
          <div className="bg-white rounded-lg shadow-md border border-[#E8E0D0] p-5">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-[#004D35]" style={{ fontFamily: "'Playfair Display', serif" }}>Recent Rounds</h2>
              <Link to="/rounds" className="text-sm text-[#006747] hover:text-[#004D35] hover:underline uppercase tracking-wider">View all →</Link>
            </div>
            <div className="divide-y divide-[#E8E0D0]">
              {recentRounds.map((r) => (
                <Link
                  key={r.id}
                  to={`/rounds/${r.id}`}
                  className="flex justify-between items-center py-3 hover:bg-[#FFF8E7] px-2 -mx-2 rounded transition-colors"
                >
                  <div>
                    <div className="font-medium text-[#333]">{r.course_name}</div>
                    <div className="text-sm text-[#888]">{formatDate(r.date_played)}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${scoreColor(r.total_score, r.course_par)}`}>
                      {r.total_score}
                    </div>
                    <div className="text-xs text-[#888]">
                      {formatScoreToPar(r.total_score, r.course_par)} (par {r.course_par})
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Top Courses */}
          {topCourses.length > 0 && (
            <div className="bg-white rounded-lg shadow-md border border-[#E8E0D0] p-5">
              <h2 className="text-lg font-semibold text-[#004D35] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Most Played Courses</h2>
              <div className="divide-y divide-[#E8E0D0]">
                {topCourses.map((c) => (
                  <Link
                    key={c.id}
                    to={`/courses/${c.id}`}
                    className="flex justify-between items-center py-3 hover:bg-[#FFF8E7] px-2 -mx-2 rounded transition-colors"
                  >
                    <div>
                      <div className="font-medium text-[#333]">{c.name}</div>
                      <div className="text-sm text-[#888]">{c.times_played} round{c.times_played !== 1 ? 's' : ''}</div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-[#333]">Avg: {Math.round(c.avg_score * 10) / 10}</div>
                      <div className="text-[#006747] font-medium">Best: {c.best_score}</div>
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
    <div className={`rounded-lg shadow-md p-4 text-center border ${highlight ? 'bg-[#006747] border-[#004D35]' : 'bg-white border-[#E8E0D0]'}`}>
      <div className={`text-sm mb-1 uppercase tracking-wider text-xs ${highlight ? 'text-[#C8A951]' : 'text-[#888]'}`}>{label}</div>
      <div className={`text-2xl font-bold ${highlight ? 'text-white' : 'text-[#004D35]'}`}>
        {value}
      </div>
    </div>
  );
}

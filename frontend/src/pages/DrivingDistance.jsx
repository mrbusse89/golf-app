import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDrivingDistanceStats } from '../api/driving-distance';
import { formatDate } from '../utils/helpers';

export default function DrivingDistance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDrivingDistanceStats()
      .then(setData)
      .catch(() => setError('Failed to load driving distance stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-[#004D35]" style={{ fontFamily: "'Playfair Display', serif" }}>Loading...</div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

  const { stats, trend } = data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#004D35]" style={{ fontFamily: "'Playfair Display', serif" }}>
        Driving Distance Stats
      </h1>

      {stats.totalRoundsWithDistance === 0 ? (
        <div className="bg-white rounded-lg shadow-md border border-[#E8E0D0] p-8 text-center">
          <p className="text-[#5C5C5C] text-lg mb-4">No driving distance data yet. Log a round with driving distance to get started!</p>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Rounds Tracked" value={stats.totalRoundsWithDistance} />
            <StatCard label="Avg Distance" value={stats.avgDrivingDistance ? `${stats.avgDrivingDistance} yds` : '—'} highlight />
            <StatCard label="Longest" value={stats.longestDistance ? `${stats.longestDistance} yds` : '—'} />
            <StatCard label="Shortest" value={stats.shortestDistance ? `${stats.shortestDistance} yds` : '—'} />
          </div>

          {/* Driving Distance Trend Chart */}
          {trend.length > 1 && (
            <div className="bg-white rounded-lg shadow-md border border-[#E8E0D0] p-5">
              <h2 className="text-lg font-semibold text-[#004D35] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Distance Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D0" />
                  <XAxis
                    dataKey="date_played"
                    tickFormatter={(d) => formatDate(d)}
                    fontSize={12}
                    stroke="#5C5C5C"
                  />
                  <YAxis fontSize={12} stroke="#5C5C5C" label={{ value: 'Yards', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    formatter={(val) => [`${val} yds`, 'Distance']}
                    labelFormatter={(d) => formatDate(d)}
                    contentStyle={{ backgroundColor: '#FFF8E7', border: '1px solid #C8A951', borderRadius: '6px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avg_driving_distance"
                    stroke="#006747"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#006747' }}
                    name="Driving Distance"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Recent Rounds with Driving Distance */}
          {trend.length > 0 && (
            <div className="bg-white rounded-lg shadow-md border border-[#E8E0D0] p-5">
              <h2 className="text-lg font-semibold text-[#004D35] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Recent Rounds</h2>
              <div className="divide-y divide-[#E8E0D0]">
                {trend.map((r) => (
                  <div key={r.id} className="flex justify-between items-center py-3 px-2">
                    <div>
                      <div className="font-medium text-[#333]">{r.course_name}</div>
                      <div className="text-sm text-[#888]">{formatDate(r.date_played)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-[#006747]">
                        {r.avg_driving_distance} yds
                      </div>
                    </div>
                  </div>
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

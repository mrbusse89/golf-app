import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getHandicap, getHandicapHistory } from '../api/handicap';
import { formatDate } from '../utils/helpers';

export default function Handicap() {
  const [handicapData, setHandicapData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    async function load() {
      try {
        const hcp = await getHandicap();
        setHandicapData(hcp);

        const hist = await getHandicapHistory();
        setHistoryData(hist.history || []);
      } catch (err) {
        setError('Failed to load handicap data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="text-center py-12 text-[#004D35]">Loading handicap...</div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

  if (!handicapData || handicapData.handicapIndex === null) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#004D35]" style={{ fontFamily: "'Playfair Display', serif" }}>
          Handicap Tracker
        </h1>
        <div className="bg-white rounded-lg shadow-md border border-[#E8E0D0] p-8 text-center">
          <p className="text-[#5C5C5C] text-lg mb-4">No handicap data yet.</p>
          <p className="text-[#888] mb-4">Log at least one round to calculate your handicap index.</p>
          <p className="text-sm text-[#666]">Handicap is calculated using the best 8 of your last 20 rounds (score differentials × 0.96).</p>
        </div>
      </div>
    );
  }

  const { handicapIndex, roundsUsed, roundsAvailable, trendData, rawDifferentials } = handicapData;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#004D35]" style={{ fontFamily: "'Playfair Display', serif" }}>
          Handicap Tracker
        </h1>
        <p className="text-sm text-[#888] mt-1">Standard USGA handicap calculation</p>
      </div>

      {/* Main Handicap Card */}
      <div className="bg-gradient-to-br from-[#006747] to-[#004D35] rounded-lg shadow-md p-8 text-white">
        <div className="text-center">
          <p className="text-sm uppercase tracking-widest opacity-90 mb-2">Current Handicap Index</p>
          <div className="text-5xl font-bold mb-1">{handicapIndex.toFixed(1)}</div>
          <p className="text-sm opacity-75">Using best {roundsUsed} of {roundsAvailable} rounds</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-[#E8E0D0]">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-3 text-sm font-medium uppercase tracking-wider transition-colors ${
            activeTab === 'overview'
              ? 'text-[#006747] border-b-2 border-[#006747]'
              : 'text-[#888] hover:text-[#004D35]'
          }`}
        >
          Trend
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className={`px-4 py-3 text-sm font-medium uppercase tracking-wider transition-colors ${
            activeTab === 'details'
              ? 'text-[#006747] border-b-2 border-[#006747]'
              : 'text-[#888] hover:text-[#004D35]'
          }`}
        >
          Details
        </button>
      </div>

      {/* Trend Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Handicap Trend Chart */}
          {trendData.length > 1 && (
            <div className="bg-white rounded-lg shadow-md border border-[#E8E0D0] p-5">
              <h2 className="text-lg font-semibold text-[#004D35] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                Handicap Trend
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D0" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => formatDate(d)}
                    fontSize={12}
                    stroke="#5C5C5C"
                  />
                  <YAxis fontSize={12} stroke="#5C5C5C" />
                  <Tooltip
                    formatter={(val, name) => [
                      name === 'handicapIndex' ? val.toFixed(1) : val,
                      name === 'handicapIndex' ? 'Handicap' : 'Rounds'
                    ]}
                    labelFormatter={(d) => formatDate(d)}
                    contentStyle={{ backgroundColor: '#FFF8E7', border: '1px solid #C8A951', borderRadius: '6px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="handicapIndex"
                    stroke="#006747"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#006747' }}
                    name="Handicap"
                  />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-[#888] mt-3">
                Your handicap is recalculated as new rounds are added, using the best 8 of your last 20 rounds.
              </p>
            </div>
          )}

          {/* Score Differentials Chart */}
          {rawDifferentials && rawDifferentials.length > 0 && (
            <div className="bg-white rounded-lg shadow-md border border-[#E8E0D0] p-5">
              <h2 className="text-lg font-semibold text-[#004D35] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                Score Differentials
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={rawDifferentials.map((d, i) => ({
                    date: formatDate(d.date),
                    differential: parseFloat(d.differential.toFixed(1)),
                    isBestEight: i < Math.min(8, rawDifferentials.length)
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D0" />
                  <XAxis dataKey="date" fontSize={11} stroke="#5C5C5C" />
                  <YAxis fontSize={12} stroke="#5C5C5C" />
                  <Tooltip
                    formatter={(val) => [val.toFixed(1), 'Differential']}
                    contentStyle={{ backgroundColor: '#FFF8E7', border: '1px solid #C8A951', borderRadius: '6px' }}
                  />
                  <Bar dataKey="differential" fill="#006747" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-[#888] mt-3">
                Differential = (Score - Course Rating) × 113 ÷ Slope Rating. Lower is better.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label="Rounds Used"
              value={roundsUsed}
              subtext="(of best 8)"
            />
            <StatCard
              label="Best Differential"
              value={handicapData.bestRoundDifferential}
              subtext="(lowest score variance)"
            />
            <StatCard
              label="Total Rounds"
              value={roundsAvailable}
              subtext="(available for calculation)"
            />
          </div>

          {/* Detailed History Table */}
          {historyData.length > 0 && (
            <div className="bg-white rounded-lg shadow-md border border-[#E8E0D0] overflow-hidden">
              <div className="p-5 border-b border-[#E8E0D0]">
                <h2 className="text-lg font-semibold text-[#004D35]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Round History
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#F5F0E8] border-b border-[#E8E0D0]">
                    <tr>
                      <th className="px-4 py-3 text-left text-[#004D35] font-semibold">Date</th>
                      <th className="px-4 py-3 text-left text-[#004D35] font-semibold">Course</th>
                      <th className="px-4 py-3 text-right text-[#004D35] font-semibold">Score</th>
                      <th className="px-4 py-3 text-right text-[#004D35] font-semibold">Course Rating</th>
                      <th className="px-4 py-3 text-right text-[#004D35] font-semibold">Slope</th>
                      <th className="px-4 py-3 text-right text-[#004D35] font-semibold">Differential</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.map((round, idx) => (
                      <tr key={round.id} className="border-b border-[#E8E0D0] hover:bg-[#FFF8E7] transition-colors">
                        <td className="px-4 py-3 text-[#333]">{formatDate(round.date)}</td>
                        <td className="px-4 py-3 text-[#333]">{round.courseName}</td>
                        <td className="px-4 py-3 text-right font-medium text-[#333]">{round.score}</td>
                        <td className="px-4 py-3 text-right text-[#666]">{round.courseRating.toFixed(1)}</td>
                        <td className="px-4 py-3 text-right text-[#666]">{round.slopeRating.toFixed(0)}</td>
                        <td className={`px-4 py-3 text-right font-medium ${
                          round.differential <= (rawDifferentials ? rawDifferentials[Math.min(7, rawDifferentials.length - 1)].differential : 999)
                            ? 'text-[#006747] bg-green-50'
                            : 'text-[#888]'
                        }`}>
                          {round.differential.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 bg-[#F5F0E8] text-xs text-[#666]">
                Handicap formula: Best 8 of last 20 differentials × 0.96
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-[#FFF8E7] border border-[#C8A951] rounded-lg p-4">
        <p className="text-sm text-[#333] mb-2">
          <strong>How your handicap is calculated:</strong>
        </p>
        <ul className="text-xs text-[#666] space-y-1 ml-4 list-disc">
          <li><strong>Score Differential</strong> = (Your Score - Course Rating) × 113 ÷ Slope Rating</li>
          <li><strong>Best 8</strong> = Your lowest 8 differentials of your last 20 rounds</li>
          <li><strong>Average</strong> = Sum of best 8 ÷ 8</li>
          <li><strong>Handicap Index</strong> = Average × 0.96 (USGA standard)</li>
        </ul>
      </div>
    </div>
  );
}

function StatCard({ label, value, subtext }) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-[#E8E0D0] p-5 text-center">
      <p className="text-xs uppercase tracking-widest text-[#888] mb-2">{label}</p>
      <p className="text-2xl font-bold text-[#004D35]">{value}</p>
      {subtext && <p className="text-xs text-[#888] mt-1">{subtext}</p>}
    </div>
  );
}

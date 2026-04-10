import { useState, useEffect } from 'react';
import { getLeaderboard } from '../api/leaderboard';
import { useAuth } from '../utils/AuthContext';

export default function FriendsLeaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getLeaderboard()
      .then((data) => setLeaderboard(data.leaderboard))
      .catch(() => setError('Failed to load leaderboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-[#004D35]">Loading leaderboard...</div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

  // Separate current user from friends
  const currentUserIndex = leaderboard.findIndex(entry => entry.id === user?.id);
  const currentUserEntry = currentUserIndex !== -1 ? leaderboard[currentUserIndex] : null;
  const friendsEntries = leaderboard.filter(entry => entry.id !== user?.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#004D35]" style={{ fontFamily: "'Playfair Display', serif" }}>
          Friends Leaderboard
        </h1>
        <p className="text-[#5C5C5C] text-sm mt-1">Last 30 days</p>
      </div>

      {/* Current User Card */}
      {currentUserEntry && (
        <div className="bg-gradient-to-r from-[#006747] to-[#004D35] rounded-lg shadow-md border border-[#004D35] p-5 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
                {currentUserEntry.display_name || currentUserEntry.username}
              </h2>
              <p className="text-sm text-[#C8A951] mt-1">You</p>
            </div>
            <div className="text-right space-y-1">
              <div className="text-3xl font-bold">{currentUserEntry.avg_score || '—'}</div>
              <div className="text-xs uppercase tracking-wider text-[#B8E6D5]">Avg Score</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold">{currentUserEntry.rounds_count}</div>
              <div className="text-xs uppercase tracking-wider text-[#B8E6D5] mt-1">Rounds</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{currentUserEntry.best_score || '—'}</div>
              <div className="text-xs uppercase tracking-wider text-[#B8E6D5] mt-1">Best</div>
            </div>
            {currentUserEntry.handicap != null && (
              <div>
                <div className="text-2xl font-bold">{currentUserEntry.handicap}</div>
                <div className="text-xs uppercase tracking-wider text-[#B8E6D5] mt-1">Handicap</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Friends Leaderboard Table */}
      <div className="bg-white rounded-lg shadow-md border border-[#E8E0D0] overflow-hidden">
        <div className="p-5 border-b border-[#E8E0D0]">
          <h2 className="text-lg font-semibold text-[#004D35]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Friends ({friendsEntries.length})
          </h2>
        </div>

        {friendsEntries.length === 0 ? (
          <div className="p-5 text-center text-[#5C5C5C]">
            <p className="text-sm">No friends yet. Add friends to see their scores!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E8E0D0] bg-[#FFF8E7]">
                  <th className="px-5 py-3 text-left font-semibold text-[#004D35]">Name</th>
                  <th className="px-5 py-3 text-right font-semibold text-[#004D35]">Avg Score</th>
                  <th className="px-5 py-3 text-right font-semibold text-[#004D35]">Best</th>
                  <th className="px-5 py-3 text-right font-semibold text-[#004D35]">Rounds</th>
                  <th className="px-5 py-3 text-right font-semibold text-[#004D35]">Handicap</th>
                </tr>
              </thead>
              <tbody>
                {friendsEntries.map((entry, index) => (
                  <tr key={entry.id} className={`border-b border-[#E8E0D0] ${index % 2 === 0 ? 'bg-white' : 'bg-[#FFF8E7]'} hover:bg-[#F5F0E8] transition-colors`}>
                    <td className="px-5 py-4">
                      <div className="font-medium text-[#333]">{entry.display_name || entry.username}</div>
                      <div className="text-xs text-[#888]">@{entry.username}</div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="font-semibold text-[#006747] text-base">
                        {entry.avg_score || '—'}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="font-medium text-[#333]">{entry.best_score || '—'}</div>
                    </td>
                    <td className="px-5 py-4 text-right text-[#5C5C5C]">
                      {entry.rounds_count}
                    </td>
                    <td className="px-5 py-4 text-right text-[#5C5C5C]">
                      {entry.handicap != null ? entry.handicap : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-[#FFF8E7] rounded-lg border border-[#E8E0D0] p-4">
        <p className="text-xs text-[#5C5C5C] leading-relaxed">
          <span className="font-semibold">Note:</span> Leaderboard shows rounds from the last 30 days. Average score is calculated from all rounds played in this period. Best round is your lowest score.
        </p>
      </div>
    </div>
  );
}

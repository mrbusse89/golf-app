import { useState, useEffect } from 'react';
import { getFriends, sendFriendRequest, respondToRequest, removeFriend, getFriendRounds } from '../api/friends';
import { formatDate, formatScoreToPar, scoreColor } from '../utils/helpers';

export default function Friends() {
  const [data, setData] = useState({ friends: [], pendingReceived: [], pendingSent: [] });
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friendRounds, setFriendRounds] = useState([]);
  const [loadingRounds, setLoadingRounds] = useState(false);

  function load() {
    setLoading(true);
    getFriends().then(setData).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleSendRequest(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!username.trim()) return;
    try {
      await sendFriendRequest(username.trim());
      setSuccess(`Friend request sent to ${username}`);
      setUsername('');
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send request');
    }
  }

  async function handleRespond(id, action) {
    await respondToRequest(id, action);
    load();
  }

  async function handleRemove(id, name) {
    if (!confirm(`Remove ${name} as a friend?`)) return;
    await removeFriend(id);
    if (selectedFriend?.friendship_id === id) { setSelectedFriend(null); setFriendRounds([]); }
    load();
  }

  async function viewFriendRounds(friend) {
    setSelectedFriend(friend);
    setLoadingRounds(true);
    try {
      const { rounds } = await getFriendRounds(friend.friend_id);
      setFriendRounds(rounds);
    } catch {
      setFriendRounds([]);
    } finally {
      setLoadingRounds(false);
    }
  }

  if (loading) return <div className="text-center py-12 text-[#004D35]">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#004D35]" style={{ fontFamily: "'Playfair Display', serif" }}>Friends</h1>

      {/* Add Friend */}
      <div className="bg-white rounded-lg shadow-md border border-[#E8E0D0] p-5">
        <h2 className="text-lg font-semibold text-[#004D35] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Add Friend</h2>
        <form onSubmit={handleSendRequest} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex-1 border border-[#D4C9B0] rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C8A951]"
          />
          <button type="submit" className="bg-[#006747] text-white px-4 py-2 rounded-md text-sm hover:bg-[#004D35] transition-colors uppercase tracking-wider">
            Send Request
          </button>
        </form>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        {success && <p className="text-[#006747] text-sm mt-2">{success}</p>}
      </div>

      {/* Pending Received */}
      {data.pendingReceived.length > 0 && (
        <div className="bg-white rounded-lg shadow-md border border-[#E8E0D0] p-5">
          <h2 className="text-lg font-semibold text-[#004D35] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Friend Requests</h2>
          <div className="divide-y divide-[#E8E0D0]">
            {data.pendingReceived.map((r) => (
              <div key={r.friendship_id} className="flex justify-between items-center py-3">
                <div>
                  <div className="font-medium text-[#333]">{r.display_name || r.username}</div>
                  <div className="text-xs text-[#888]">@{r.username}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRespond(r.friendship_id, 'accept')}
                    className="bg-[#006747] text-white px-3 py-1 rounded text-sm hover:bg-[#004D35] uppercase tracking-wider"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRespond(r.friendship_id, 'decline')}
                    className="border border-[#D4C9B0] text-[#888] px-3 py-1 rounded text-sm hover:bg-[#FFF8E7]"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Sent */}
      {data.pendingSent.length > 0 && (
        <div className="bg-white rounded-lg shadow-md border border-[#E8E0D0] p-5">
          <h2 className="text-xs font-medium text-[#888] mb-2 uppercase tracking-wider">Pending Requests Sent</h2>
          <div className="space-y-1">
            {data.pendingSent.map((r) => (
              <div key={r.friendship_id} className="text-sm text-[#888]">
                Waiting for <span className="font-medium text-[#333]">@{r.username}</span> to accept
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="bg-white rounded-lg shadow-md border border-[#E8E0D0] p-5">
        <h2 className="text-lg font-semibold text-[#004D35] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
          My Friends ({data.friends.length})
        </h2>
        {data.friends.length === 0 ? (
          <p className="text-[#888] text-sm">No friends yet. Add someone by their username above!</p>
        ) : (
          <div className="divide-y divide-[#E8E0D0]">
            {data.friends.map((f) => (
              <div key={f.friendship_id} className="py-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-[#333]">{f.display_name || f.username}</div>
                    <div className="text-xs text-[#888]">
                      @{f.username}
                      {f.handicap != null && ` · Handicap: ${f.handicap}`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => viewFriendRounds(f)}
                      className="text-sm text-[#006747] hover:text-[#004D35] hover:underline"
                    >
                      View Rounds
                    </button>
                    <button
                      onClick={() => handleRemove(f.friendship_id, f.display_name || f.username)}
                      className="text-sm text-red-400 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Friend's Rounds */}
      {selectedFriend && (
        <div className="bg-white rounded-lg shadow-md border border-[#E8E0D0] p-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-[#004D35]" style={{ fontFamily: "'Playfair Display', serif" }}>
              {selectedFriend.display_name || selectedFriend.username}'s Recent Rounds
            </h2>
            <button onClick={() => { setSelectedFriend(null); setFriendRounds([]); }} className="text-sm text-[#888] hover:underline">
              Close
            </button>
          </div>
          {loadingRounds ? (
            <p className="text-[#888] text-sm">Loading...</p>
          ) : friendRounds.length === 0 ? (
            <p className="text-[#888] text-sm">No rounds logged yet.</p>
          ) : (
            <div className="divide-y divide-[#E8E0D0]">
              {friendRounds.map((r) => (
                <div key={r.id} className="flex justify-between items-center py-3">
                  <div>
                    <div className="font-medium text-[#333]">{r.course_name}</div>
                    <div className="text-sm text-[#888]">{formatDate(r.date_played)}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${scoreColor(r.total_score, r.course_par)}`}>
                      {r.total_score}
                    </div>
                    <div className="text-xs text-[#888]">{formatScoreToPar(r.total_score, r.course_par)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

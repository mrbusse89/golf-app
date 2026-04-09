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

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Friends</h1>

      {/* Add Friend */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Add Friend</h2>
        <form onSubmit={handleSendRequest} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button type="submit" className="bg-green-700 text-white px-4 py-2 rounded-md text-sm hover:bg-green-800 transition-colors">
            Send Request
          </button>
        </form>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
      </div>

      {/* Pending Received */}
      {data.pendingReceived.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Friend Requests</h2>
          <div className="divide-y">
            {data.pendingReceived.map((r) => (
              <div key={r.friendship_id} className="flex justify-between items-center py-3">
                <div>
                  <div className="font-medium text-gray-800">{r.display_name || r.username}</div>
                  <div className="text-xs text-gray-500">@{r.username}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRespond(r.friendship_id, 'accept')}
                    className="bg-green-700 text-white px-3 py-1 rounded text-sm hover:bg-green-800"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRespond(r.friendship_id, 'decline')}
                    className="border border-gray-300 text-gray-600 px-3 py-1 rounded text-sm hover:bg-gray-50"
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
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Pending Requests Sent</h2>
          <div className="space-y-1">
            {data.pendingSent.map((r) => (
              <div key={r.friendship_id} className="text-sm text-gray-600">
                Waiting for <span className="font-medium">@{r.username}</span> to accept
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          My Friends ({data.friends.length})
        </h2>
        {data.friends.length === 0 ? (
          <p className="text-gray-500 text-sm">No friends yet. Add someone by their username above!</p>
        ) : (
          <div className="divide-y">
            {data.friends.map((f) => (
              <div key={f.friendship_id} className="py-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-800">{f.display_name || f.username}</div>
                    <div className="text-xs text-gray-500">
                      @{f.username}
                      {f.handicap != null && ` · Handicap: ${f.handicap}`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => viewFriendRounds(f)}
                      className="text-sm text-green-700 hover:underline"
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
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-700">
              {selectedFriend.display_name || selectedFriend.username}'s Recent Rounds
            </h2>
            <button onClick={() => { setSelectedFriend(null); setFriendRounds([]); }} className="text-sm text-gray-500 hover:underline">
              Close
            </button>
          </div>
          {loadingRounds ? (
            <p className="text-gray-500 text-sm">Loading...</p>
          ) : friendRounds.length === 0 ? (
            <p className="text-gray-500 text-sm">No rounds logged yet.</p>
          ) : (
            <div className="divide-y">
              {friendRounds.map((r) => (
                <div key={r.id} className="flex justify-between items-center py-3">
                  <div>
                    <div className="font-medium text-gray-800">{r.course_name}</div>
                    <div className="text-sm text-gray-500">{formatDate(r.date_played)}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${scoreColor(r.total_score, r.course_par)}`}>
                      {r.total_score}
                    </div>
                    <div className="text-xs text-gray-500">{formatScoreToPar(r.total_score, r.course_par)}</div>
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

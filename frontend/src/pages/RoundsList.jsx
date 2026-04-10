import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRounds, deleteRound } from '../api/rounds';
import { formatDate, formatScoreToPar, scoreColor } from '../utils/helpers';

export default function RoundsList() {
  const [rounds, setRounds] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState('date_played');
  const [loading, setLoading] = useState(true);
  const limit = 20;

  function load() {
    setLoading(true);
    getRounds({ limit, offset: page * limit, sort })
      .then((data) => { setRounds(data.rounds); setTotal(data.total); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [page, sort]);

  async function handleDelete(id, name) {
    if (!confirm(`Delete round at ${name}?`)) return;
    await deleteRound(id);
    load();
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-[#004D35]" style={{ fontFamily: "'Playfair Display', serif" }}>My Rounds</h1>
        <div className="flex gap-2 items-center">
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(0); }}
            className="text-sm border border-[#D4C9B0] rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-[#C8A951]"
          >
            <option value="date_played">By Date</option>
            <option value="total_score">By Score</option>
          </select>
          <Link
            to="/rounds/new"
            className="bg-[#006747] text-white px-3 py-1 rounded-md hover:bg-[#004D35] transition-colors text-sm font-medium uppercase tracking-wider"
          >
            + Log Round
          </Link>
        </div>
      </div>

      <p className="text-sm text-[#888] mb-3">{total} round{total !== 1 ? 's' : ''} total</p>

      {loading ? (
        <div className="text-center py-8 text-[#004D35]">Loading...</div>
      ) : rounds.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md border border-[#E8E0D0] p-8 text-center">
          <p className="text-[#888] mb-3">No rounds logged yet.</p>
          <Link to="/rounds/new" className="text-[#006747] font-medium hover:text-[#004D35] hover:underline">Log your first round →</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {rounds.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-lg shadow-md border border-[#E8E0D0] p-4 flex justify-between items-center hover:border-[#C8A951] transition-all"
            >
              <Link to={`/rounds/${r.id}`} className="flex-1 hover:opacity-80 transition-opacity">
                <div className="font-medium text-[#333]">{r.course_name}</div>
                <div className="text-sm text-[#888]">
                  {formatDate(r.date_played)}
                  {r.total_putts ? ` · ${r.total_putts} putts` : ''}
                </div>
              </Link>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className={`text-xl font-bold ${scoreColor(r.total_score, r.course_par)}`}>
                    {r.total_score}
                  </div>
                  <div className="text-xs text-[#888]">{formatScoreToPar(r.total_score, r.course_par)}</div>
                </div>
                <button
                  onClick={() => handleDelete(r.id, r.course_name)}
                  className="text-[#ccc] hover:text-red-500 transition-colors text-sm"
                  title="Delete round"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1 border border-[#D4C9B0] rounded text-sm disabled:opacity-30 hover:bg-[#FFF8E7] text-[#004D35] transition-colors"
          >
            ← Prev
          </button>
          <span className="px-3 py-1 text-sm text-[#888]">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1 border border-[#D4C9B0] rounded text-sm disabled:opacity-30 hover:bg-[#FFF8E7] text-[#004D35] transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

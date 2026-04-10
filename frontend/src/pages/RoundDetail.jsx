import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getRound, deleteRound } from '../api/rounds';
import { formatDate, formatScoreToPar, scoreColor } from '../utils/helpers';

export default function RoundDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [round, setRound] = useState(null);
  const [holeScores, setHoleScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRound(id)
      .then((data) => {
        setRound(data.round);
        setHoleScores(data.holeScores || []);
      })
      .catch(() => navigate('/rounds'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!confirm('Delete this round?')) return;
    await deleteRound(id);
    navigate('/rounds');
  }

  if (loading) return <div className="text-center py-12 text-[#004D35]">Loading...</div>;
  if (!round) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link to="/rounds" className="text-sm text-[#006747] hover:text-[#004D35] hover:underline uppercase tracking-wider">← Back to rounds</Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-md border border-[#E8E0D0] p-5">
        <div className="flex justify-between items-start">
          <div>
            <Link to={`/courses/${round.course_id}`} className="text-xl font-bold text-[#004D35] hover:text-[#006747]" style={{ fontFamily: "'Playfair Display', serif" }}>
              {round.course_name}
            </Link>
            <p className="text-[#888] text-sm">{formatDate(round.date_played)}</p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${scoreColor(round.total_score, round.course_par)}`}>
              {round.total_score}
            </div>
            <div className="text-sm text-[#888]">
              {formatScoreToPar(round.total_score, round.course_par)} (par {round.course_par})
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg shadow-md border border-[#E8E0D0] p-5">
        <h2 className="text-lg font-semibold text-[#004D35] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Round Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-xs text-[#888] uppercase tracking-wider">Putts</div>
            <div className="text-xl font-bold text-[#004D35]">{round.total_putts || '—'}</div>
          </div>
          <div>
            <div className="text-xs text-[#888] uppercase tracking-wider">Fairways</div>
            <div className="text-xl font-bold text-[#004D35]">{round.fairways_hit ?? '—'}</div>
          </div>
          <div>
            <div className="text-xs text-[#888] uppercase tracking-wider">GIR</div>
            <div className="text-xl font-bold text-[#004D35]">{round.greens_in_regulation ?? '—'}</div>
          </div>
          <div>
            <div className="text-xs text-[#888] uppercase tracking-wider">Tees</div>
            <div className="text-xl font-bold text-[#004D35]">{round.tees_played || '—'}</div>
          </div>
        </div>
      </div>

      {/* Weather & Notes */}
      {(round.weather || round.notes) && (
        <div className="bg-white rounded-lg shadow-md border border-[#E8E0D0] p-5">
          {round.weather && (
            <div className="mb-2">
              <span className="text-xs font-medium text-[#888] uppercase tracking-wider">Weather: </span>
              <span className="text-sm text-[#333]">{round.weather}</span>
            </div>
          )}
          {round.notes && (
            <div>
              <span className="text-xs font-medium text-[#888] uppercase tracking-wider">Notes: </span>
              <span className="text-sm text-[#333]">{round.notes}</span>
            </div>
          )}
        </div>
      )}

      {/* Hole-by-hole */}
      {holeScores.length > 0 && (
        <div className="bg-white rounded-lg shadow-md border border-[#E8E0D0] p-5">
          <h2 className="text-lg font-semibold text-[#004D35] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Hole-by-Hole</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E8E0D0] text-[#888]">
                  <th className="py-2 text-left text-xs uppercase tracking-wider">Hole</th>
                  <th className="py-2 text-center text-xs uppercase tracking-wider">Strokes</th>
                  <th className="py-2 text-center text-xs uppercase tracking-wider">Putts</th>
                  <th className="py-2 text-center text-xs uppercase tracking-wider">FW</th>
                  <th className="py-2 text-center text-xs uppercase tracking-wider">GIR</th>
                </tr>
              </thead>
              <tbody>
                {holeScores.map((h) => (
                  <tr key={h.hole_number} className="border-b border-[#E8E0D0] last:border-0">
                    <td className="py-2 font-medium text-[#004D35]">{h.hole_number}</td>
                    <td className="py-2 text-center font-bold text-[#333]">{h.strokes}</td>
                    <td className="py-2 text-center text-[#888]">{h.putts ?? '—'}</td>
                    <td className="py-2 text-center">{h.fairway_hit === 1 ? '✓' : h.fairway_hit === 0 ? '✗' : '—'}</td>
                    <td className="py-2 text-center">{h.gir === 1 ? '✓' : h.gir === 0 ? '✗' : '—'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[#C8A951] font-semibold">
                  <td className="py-2 text-[#004D35]">Total</td>
                  <td className="py-2 text-center text-[#333]">{holeScores.reduce((s, h) => s + h.strokes, 0)}</td>
                  <td className="py-2 text-center text-[#888]">
                    {holeScores.some((h) => h.putts != null) ? holeScores.reduce((s, h) => s + (h.putts || 0), 0) : '—'}
                  </td>
                  <td className="py-2 text-center">
                    {holeScores.filter((h) => h.fairway_hit === 1).length}/{holeScores.filter((h) => h.fairway_hit != null).length}
                  </td>
                  <td className="py-2 text-center">
                    {holeScores.filter((h) => h.gir === 1).length}/{holeScores.filter((h) => h.gir != null).length}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Delete */}
      <div className="flex justify-end">
        <button
          onClick={handleDelete}
          className="text-red-400 hover:text-red-600 text-sm font-medium transition-colors"
        >
          Delete this round
        </button>
      </div>
    </div>
  );
}

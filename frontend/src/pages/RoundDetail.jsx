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

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;
  if (!round) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link to="/rounds" className="text-sm text-green-700 hover:underline">← Back to rounds</Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-start">
          <div>
            <Link to={`/courses/${round.course_id}`} className="text-xl font-bold text-gray-800 hover:text-green-700">
              {round.course_name}
            </Link>
            <p className="text-gray-500 text-sm">{formatDate(round.date_played)}</p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${scoreColor(round.total_score, round.course_par)}`}>
              {round.total_score}
            </div>
            <div className="text-sm text-gray-500">
              {formatScoreToPar(round.total_score, round.course_par)} (par {round.course_par})
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Round Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-500">Putts</div>
            <div className="text-xl font-bold text-gray-800">{round.total_putts || '—'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Fairways</div>
            <div className="text-xl font-bold text-gray-800">{round.fairways_hit ?? '—'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">GIR</div>
            <div className="text-xl font-bold text-gray-800">{round.greens_in_regulation ?? '—'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Tees</div>
            <div className="text-xl font-bold text-gray-800">{round.tees_played || '—'}</div>
          </div>
        </div>
      </div>

      {/* Weather & Notes */}
      {(round.weather || round.notes) && (
        <div className="bg-white rounded-lg shadow p-4">
          {round.weather && (
            <div className="mb-2">
              <span className="text-sm font-medium text-gray-500">Weather: </span>
              <span className="text-sm text-gray-700">{round.weather}</span>
            </div>
          )}
          {round.notes && (
            <div>
              <span className="text-sm font-medium text-gray-500">Notes: </span>
              <span className="text-sm text-gray-700">{round.notes}</span>
            </div>
          )}
        </div>
      )}

      {/* Hole-by-hole */}
      {holeScores.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Hole-by-Hole</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="py-2 text-left">Hole</th>
                  <th className="py-2 text-center">Strokes</th>
                  <th className="py-2 text-center">Putts</th>
                  <th className="py-2 text-center">FW</th>
                  <th className="py-2 text-center">GIR</th>
                </tr>
              </thead>
              <tbody>
                {holeScores.map((h) => (
                  <tr key={h.hole_number} className="border-b last:border-0">
                    <td className="py-2 font-medium">{h.hole_number}</td>
                    <td className="py-2 text-center font-bold">{h.strokes}</td>
                    <td className="py-2 text-center text-gray-600">{h.putts ?? '—'}</td>
                    <td className="py-2 text-center">{h.fairway_hit === 1 ? '✓' : h.fairway_hit === 0 ? '✗' : '—'}</td>
                    <td className="py-2 text-center">{h.gir === 1 ? '✓' : h.gir === 0 ? '✗' : '—'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t font-semibold">
                  <td className="py-2">Total</td>
                  <td className="py-2 text-center">{holeScores.reduce((s, h) => s + h.strokes, 0)}</td>
                  <td className="py-2 text-center text-gray-600">
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
          className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
        >
          Delete this round
        </button>
      </div>
    </div>
  );
}

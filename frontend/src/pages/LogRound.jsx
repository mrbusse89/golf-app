import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCourses } from '../api/courses';
import { createRound } from '../api/rounds';

export default function LogRound() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHoles, setShowHoles] = useState(false);

  const [form, setForm] = useState({
    courseId: '',
    datePlayed: new Date().toISOString().split('T')[0],
    totalScore: '',
    totalPutts: '',
    fairwaysHit: '',
    greensInRegulation: '',
    avgDrivingDistance: '',
    notes: '',
    weather: '',
    teesPlayed: ''
  });

  const [holeScores, setHoleScores] = useState(
    Array.from({ length: 18 }, (_, i) => ({
      holeNumber: i + 1,
      strokes: '',
      putts: '',
      fairwayHit: null,
      gir: null
    }))
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      getCourses({ search, limit: 20 }).then(({ courses }) => setCourses(courses));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function updateHole(index, field, value) {
    setHoleScores((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.courseId || !form.totalScore) {
      setError('Please select a course and enter your total score');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        courseId: Number(form.courseId),
        datePlayed: form.datePlayed,
        totalScore: Number(form.totalScore),
        totalPutts: form.totalPutts ? Number(form.totalPutts) : undefined,
        fairwaysHit: form.fairwaysHit ? Number(form.fairwaysHit) : undefined,
        greensInRegulation: form.greensInRegulation ? Number(form.greensInRegulation) : undefined,
        avgDrivingDistance: form.avgDrivingDistance ? Number(form.avgDrivingDistance) : undefined,
        notes: form.notes || undefined,
        weather: form.weather || undefined,
        teesPlayed: form.teesPlayed || undefined
      };

      if (showHoles) {
        const filledHoles = holeScores.filter((h) => h.strokes);
        if (filledHoles.length > 0) {
          payload.holeScores = filledHoles.map((h) => ({
            holeNumber: h.holeNumber,
            strokes: Number(h.strokes),
            putts: h.putts ? Number(h.putts) : undefined,
            fairwayHit: h.fairwayHit,
            gir: h.gir
          }));
        }
      }

      await createRound(payload);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to log round');
    } finally {
      setLoading(false);
    }
  }

  const selectedCourse = courses.find((c) => c.id === Number(form.courseId));

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-[#004D35] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Log a Round</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Course Selection */}
        <div className="bg-white rounded-lg shadow-md border border-[#E8E0D0] p-4 space-y-3">
          <label className="block text-sm font-medium text-[#004D35] uppercase tracking-wider">Course</label>
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-[#D4C9B0] rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#C8A951] focus:border-transparent"
          />
          {courses.length > 0 && !form.courseId && (
            <div className="max-h-48 overflow-y-auto border border-[#E8E0D0] rounded-md divide-y divide-[#E8E0D0]">
              {courses.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { updateField('courseId', c.id); setSearch(c.name); }}
                  className="w-full text-left px-3 py-2 hover:bg-[#FFF8E7] transition-colors"
                >
                  <div className="font-medium text-sm text-[#333]">{c.name}</div>
                  <div className="text-xs text-[#888]">{c.city}, {c.state} · Par {c.par} · {c.yardage} yds</div>
                </button>
              ))}
            </div>
          )}
          {selectedCourse && (
            <div className="flex items-center justify-between bg-[#006747] bg-opacity-10 px-3 py-2 rounded-md border border-[#006747] border-opacity-20">
              <div>
                <div className="font-medium text-[#004D35]">{selectedCourse.name}</div>
                <div className="text-xs text-[#006747]">Par {selectedCourse.par} · {selectedCourse.yardage} yds</div>
              </div>
              <button
                type="button"
                onClick={() => { updateField('courseId', ''); setSearch(''); }}
                className="text-[#006747] hover:text-[#004D35] text-sm font-medium"
              >
                Change
              </button>
            </div>
          )}
        </div>

        {/* Score & Details */}
        <div className="bg-white rounded-lg shadow-md border border-[#E8E0D0] p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#004D35] mb-1 uppercase tracking-wider text-xs">Date</label>
              <input
                type="date"
                value={form.datePlayed}
                onChange={(e) => updateField('datePlayed', e.target.value)}
                className="w-full border border-[#D4C9B0] rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#C8A951]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#004D35] mb-1 uppercase tracking-wider text-xs">Total Score *</label>
              <input
                type="number"
                value={form.totalScore}
                onChange={(e) => updateField('totalScore', e.target.value)}
                className="w-full border border-[#D4C9B0] rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#C8A951]"
                placeholder="85"
                min="40"
                max="200"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#004D35] mb-1 uppercase tracking-wider text-xs">Putts</label>
              <input
                type="number"
                value={form.totalPutts}
                onChange={(e) => updateField('totalPutts', e.target.value)}
                className="w-full border border-[#D4C9B0] rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#C8A951]"
                placeholder="32"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#004D35] mb-1 uppercase tracking-wider text-xs">Fairways</label>
              <input
                type="number"
                value={form.fairwaysHit}
                onChange={(e) => updateField('fairwaysHit', e.target.value)}
                className="w-full border border-[#D4C9B0] rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#C8A951]"
                placeholder="8"
                min="0"
                max="18"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#004D35] mb-1 uppercase tracking-wider text-xs">GIR</label>
              <input
                type="number"
                value={form.greensInRegulation}
                onChange={(e) => updateField('greensInRegulation', e.target.value)}
                className="w-full border border-[#D4C9B0] rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#C8A951]"
                placeholder="7"
                min="0"
                max="18"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#004D35] mb-1 uppercase tracking-wider text-xs">Avg Drive (yds)</label>
              <input
                type="number"
                value={form.avgDrivingDistance}
                onChange={(e) => updateField('avgDrivingDistance', e.target.value)}
                className="w-full border border-[#D4C9B0] rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#C8A951]"
                placeholder="250"
                min="0"
                max="450"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#004D35] mb-1 uppercase tracking-wider text-xs">Tees Played</label>
              <select
                value={form.teesPlayed}
                onChange={(e) => updateField('teesPlayed', e.target.value)}
                className="w-full border border-[#D4C9B0] rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#C8A951]"
              >
                <option value="">Select...</option>
                <option value="Black">Black</option>
                <option value="Blue">Blue</option>
                <option value="White">White</option>
                <option value="Gold">Gold</option>
                <option value="Red">Red</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#004D35] mb-1 uppercase tracking-wider text-xs">Weather</label>
              <input
                type="text"
                value={form.weather}
                onChange={(e) => updateField('weather', e.target.value)}
                className="w-full border border-[#D4C9B0] rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#C8A951]"
                placeholder="Sunny, 75°F"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#004D35] mb-1 uppercase tracking-wider text-xs">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              className="w-full border border-[#D4C9B0] rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#C8A951]"
              rows={2}
              placeholder="How'd it go?"
            />
          </div>
        </div>

        {/* Hole-by-hole toggle */}
        <div className="bg-white rounded-lg shadow-md border border-[#E8E0D0] p-4">
          <button
            type="button"
            onClick={() => setShowHoles(!showHoles)}
            className="text-sm text-[#006747] font-medium hover:text-[#004D35] hover:underline uppercase tracking-wider"
          >
            {showHoles ? '▼ Hide hole-by-hole scores' : '▶ Add hole-by-hole scores (optional)'}
          </button>

          {showHoles && (
            <div className="mt-4 space-y-2">
              <div className="grid grid-cols-12 gap-1 text-xs text-[#888] font-medium px-1 uppercase tracking-wider">
                <div className="col-span-1">#</div>
                <div className="col-span-3">Strokes</div>
                <div className="col-span-3">Putts</div>
                <div className="col-span-2">FW</div>
                <div className="col-span-2">GIR</div>
              </div>
              {holeScores.map((h, i) => (
                <div key={h.holeNumber} className="grid grid-cols-12 gap-1 items-center">
                  <div className="col-span-1 text-sm font-medium text-[#004D35]">{h.holeNumber}</div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      value={h.strokes}
                      onChange={(e) => updateHole(i, 'strokes', e.target.value)}
                      className="w-full border border-[#D4C9B0] rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#C8A951]"
                      min="1" max="15"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      value={h.putts}
                      onChange={(e) => updateHole(i, 'putts', e.target.value)}
                      className="w-full border border-[#D4C9B0] rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#C8A951]"
                      min="0" max="10"
                    />
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <input
                      type="checkbox"
                      checked={h.fairwayHit === 1}
                      onChange={(e) => updateHole(i, 'fairwayHit', e.target.checked ? 1 : 0)}
                      className="h-4 w-4 text-[#006747] rounded border-[#D4C9B0]"
                    />
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <input
                      type="checkbox"
                      checked={h.gir === 1}
                      onChange={(e) => updateHole(i, 'gir', e.target.checked ? 1 : 0)}
                      className="h-4 w-4 text-[#006747] rounded border-[#D4C9B0]"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#006747] text-white py-3 rounded-md hover:bg-[#004D35] transition-colors font-medium disabled:opacity-50 uppercase tracking-wider"
        >
          {loading ? 'Saving...' : 'Save Round'}
        </button>
      </form>
    </div>
  );
}

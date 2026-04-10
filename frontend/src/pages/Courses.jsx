import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCourses } from '../api/courses';

const US_STATES = ['AZ','AL','CA','CO','FL','GA','IL','IN','KS','KY','LA','MD','MI','MN','MO','MS','NC','NE','NJ','NV','NY','OH','OK','OR','SC','SD','TN','TX','WA','WI'];

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      getCourses({ search, state, limit: 100 })
        .then((data) => { setCourses(data.courses); setTotal(data.total); })
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [search, state]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#004D35] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Courses</h1>

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by name or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-[#D4C9B0] rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#C8A951] focus:border-transparent"
        />
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="border border-[#D4C9B0] rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#C8A951] focus:border-transparent"
        >
          <option value="">All States</option>
          {US_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <p className="text-sm text-[#888] mb-3">{total} course{total !== 1 ? 's' : ''} found</p>

      {loading ? (
        <div className="text-center py-8 text-[#004D35]">Loading courses...</div>
      ) : courses.length === 0 ? (
        <div className="text-center py-8 text-[#888]">No courses found matching your search.</div>
      ) : (
        <div className="grid gap-3">
          {courses.map((c) => (
            <Link
              key={c.id}
              to={`/courses/${c.id}`}
              className="bg-white rounded-lg shadow-md border border-[#E8E0D0] p-4 hover:shadow-lg hover:border-[#C8A951] transition-all flex justify-between items-center"
            >
              <div>
                <div className="font-semibold text-[#333]">{c.name}</div>
                <div className="text-sm text-[#888]">{c.city}, {c.state}</div>
              </div>
              <div className="text-right text-sm">
                <div className="text-[#004D35] font-medium">Par {c.par} · {c.holes} holes</div>
                <div className="text-[#888]">{c.yardage ? `${c.yardage.toLocaleString()} yds` : ''}</div>
                {c.slope_rating && (
                  <div className="text-[#aaa] text-xs">Slope {c.slope_rating} / Rating {c.course_rating}</div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

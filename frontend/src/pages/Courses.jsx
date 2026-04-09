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
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Courses</h1>

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by name or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">All States</option>
          {US_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <p className="text-sm text-gray-500 mb-3">{total} course{total !== 1 ? 's' : ''} found</p>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading courses...</div>
      ) : courses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No courses found matching your search.</div>
      ) : (
        <div className="grid gap-3">
          {courses.map((c) => (
            <Link
              key={c.id}
              to={`/courses/${c.id}`}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow flex justify-between items-center"
            >
              <div>
                <div className="font-semibold text-gray-800">{c.name}</div>
                <div className="text-sm text-gray-500">{c.city}, {c.state}</div>
              </div>
              <div className="text-right text-sm">
                <div className="text-gray-700">Par {c.par} · {c.holes} holes</div>
                <div className="text-gray-500">{c.yardage ? `${c.yardage.toLocaleString()} yds` : ''}</div>
                {c.slope_rating && (
                  <div className="text-gray-400 text-xs">Slope {c.slope_rating} / Rating {c.course_rating}</div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

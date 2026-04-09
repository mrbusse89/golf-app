import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourse } from '../api/courses';
import { getRounds } from '../api/rounds';
import { getReviews, createReview, deleteReview } from '../api/reviews';
import { formatDate, formatScoreToPar, scoreColor } from '../utils/helpers';
import { useAuth } from '../utils/AuthContext';

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [reviewStats, setReviewStats] = useState(null);
  const [myRounds, setMyRounds] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 4, title: '', body: '', conditionRating: 0, paceRating: 0, valueRating: 0 });
  const [reviewError, setReviewError] = useState('');

  function loadData() {
    Promise.all([
      getCourse(id),
      getRounds({ courseId: id, limit: 20 }),
      getReviews({ courseId: id })
    ]).then(([courseData, roundsData, reviewData]) => {
      setCourse(courseData.course);
      setReviewStats(courseData.reviewStats);
      setMyRounds(roundsData.rounds);
      setReviews(reviewData.reviews);
    }).finally(() => setLoading(false));
  }

  useEffect(() => { loadData(); }, [id]);

  async function handleSubmitReview(e) {
    e.preventDefault();
    setReviewError('');
    try {
      await createReview({ courseId: Number(id), ...reviewForm });
      setShowReviewForm(false);
      setReviewForm({ rating: 4, title: '', body: '', conditionRating: 0, paceRating: 0, valueRating: 0 });
      loadData();
    } catch (err) {
      setReviewError(err.response?.data?.error || 'Failed to submit review');
    }
  }

  async function handleDeleteReview(reviewId) {
    if (!confirm('Delete your review?')) return;
    await deleteReview(reviewId);
    loadData();
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;
  if (!course) return <div className="text-center py-12 text-red-500">Course not found</div>;

  const myReview = reviews.find((r) => r.user_id === user?.id);

  return (
    <div className="space-y-6">
      <div>
        <Link to="/courses" className="text-sm text-green-700 hover:underline">&larr; Back to courses</Link>
        <h1 className="text-2xl font-bold text-gray-800 mt-2">{course.name}</h1>
        <p className="text-gray-500">{course.city}, {course.state}</p>
      </div>

      {/* Course Info */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-500">Par</div>
            <div className="text-xl font-bold text-gray-800">{course.par}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Yardage</div>
            <div className="text-xl font-bold text-gray-800">{course.yardage?.toLocaleString() || '—'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Slope</div>
            <div className="text-xl font-bold text-gray-800">{course.slope_rating || '—'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Rating</div>
            <div className="text-xl font-bold text-gray-800">{course.course_rating || '—'}</div>
          </div>
        </div>
        {reviewStats?.avg_rating > 0 && (
          <div className="mt-3 pt-3 border-t text-center">
            <span className="text-yellow-500">{'★'.repeat(Math.round(reviewStats.avg_rating))}</span>
            <span className="text-gray-300">{'★'.repeat(5 - Math.round(reviewStats.avg_rating))}</span>
            <span className="text-sm text-gray-500 ml-2">
              {Math.round(reviewStats.avg_rating * 10) / 10} ({reviewStats.review_count} review{reviewStats.review_count !== 1 ? 's' : ''})
            </span>
          </div>
        )}
      </div>

      {/* My Rounds at this Course */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-700">My Rounds Here</h2>
          <Link to="/rounds/new" className="text-sm bg-green-700 text-white px-3 py-1 rounded hover:bg-green-800 transition-colors">
            + Log Round
          </Link>
        </div>
        {myRounds.length === 0 ? (
          <p className="text-gray-500 text-sm">No rounds logged at this course yet.</p>
        ) : (
          <div className="divide-y">
            {myRounds.map((r) => (
              <Link key={r.id} to={`/rounds/${r.id}`} className="flex justify-between items-center py-3 hover:bg-gray-50 px-2 -mx-2 rounded transition-colors">
                <div className="text-sm text-gray-600">{formatDate(r.date_played)}</div>
                <div className="flex items-center gap-3">
                  {r.total_putts && <span className="text-xs text-gray-500">{r.total_putts} putts</span>}
                  <span className={`text-lg font-bold ${scoreColor(r.total_score, course.par)}`}>{r.total_score}</span>
                  <span className="text-xs text-gray-500">{formatScoreToPar(r.total_score, course.par)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-700">Reviews</h2>
          {!myReview && !showReviewForm && (
            <button onClick={() => setShowReviewForm(true)} className="text-sm bg-green-700 text-white px-3 py-1 rounded hover:bg-green-800 transition-colors">
              Write Review
            </button>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <form onSubmit={handleSubmitReview} className="border rounded-md p-3 mb-4 space-y-3">
            {reviewError && <div className="text-red-600 text-sm">{reviewError}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Overall Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setReviewForm((f) => ({ ...f, rating: n }))}
                    className={`text-2xl ${n <= reviewForm.rating ? 'text-yellow-500' : 'text-gray-300'}`}>
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[['conditionRating', 'Condition'], ['paceRating', 'Pace'], ['valueRating', 'Value']].map(([key, label]) => (
                <div key={key}>
                  <label className="block text-xs text-gray-500 mb-1">{label}</label>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" onClick={() => setReviewForm((f) => ({ ...f, [key]: n }))}
                        className={`text-sm ${n <= reviewForm[key] ? 'text-yellow-500' : 'text-gray-300'}`}>
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <input
              type="text" placeholder="Review title" value={reviewForm.title}
              onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <textarea
              placeholder="Your thoughts on this course..." value={reviewForm.body}
              onChange={(e) => setReviewForm((f) => ({ ...f, body: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={3}
            />
            <div className="flex gap-2">
              <button type="submit" className="bg-green-700 text-white px-4 py-1 rounded text-sm hover:bg-green-800">Submit</button>
              <button type="button" onClick={() => setShowReviewForm(false)} className="text-gray-500 text-sm hover:underline">Cancel</button>
            </div>
          </form>
        )}

        {reviews.length === 0 && !showReviewForm ? (
          <p className="text-gray-500 text-sm">No reviews yet. Be the first!</p>
        ) : (
          <div className="divide-y">
            {reviews.map((r) => (
              <div key={r.id} className="py-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-yellow-500">{'★'.repeat(r.rating)}</span>
                    <span className="text-gray-300">{'★'.repeat(5 - r.rating)}</span>
                    {r.title && <span className="ml-2 font-medium text-gray-800">{r.title}</span>}
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-2">
                    <span>{r.display_name || r.username}</span>
                    {r.user_id === user?.id && (
                      <button onClick={() => handleDeleteReview(r.id)} className="text-red-400 hover:text-red-600">Delete</button>
                    )}
                  </div>
                </div>
                {r.body && <p className="text-sm text-gray-600 mt-1">{r.body}</p>}
                {(r.condition_rating || r.pace_rating || r.value_rating) && (
                  <div className="flex gap-4 mt-1 text-xs text-gray-500">
                    {r.condition_rating && <span>Condition: {r.condition_rating}/5</span>}
                    {r.pace_rating && <span>Pace: {r.pace_rating}/5</span>}
                    {r.value_rating && <span>Value: {r.value_rating}/5</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

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

  if (loading) return <div className="text-center py-12 text-[#004D35]">Loading...</div>;
  if (!course) return <div className="text-center py-12 text-red-500">Course not found</div>;

  const myReview = reviews.find((r) => r.user_id === user?.id);

  return (
    <div className="space-y-6">
      <div>
        <Link to="/courses" className="text-sm text-[#006747] hover:text-[#004D35] hover:underline uppercase tracking-wider">&larr; Back to courses</Link>
        <h1 className="text-2xl font-bold text-[#004D35] mt-2" style={{ fontFamily: "'Playfair Display', serif" }}>{course.name}</h1>
        <p className="text-[#888]">{course.city}, {course.state}</p>
      </div>

      {/* Course Info */}
      <div className="bg-white rounded-lg shadow-md border border-[#E8E0D0] p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-xs text-[#888] uppercase tracking-wider">Par</div>
            <div className="text-xl font-bold text-[#004D35]">{course.par}</div>
          </div>
          <div>
            <div className="text-xs text-[#888] uppercase tracking-wider">Yardage</div>
            <div className="text-xl font-bold text-[#004D35]">{course.yardage?.toLocaleString() || '—'}</div>
          </div>
          <div>
            <div className="text-xs text-[#888] uppercase tracking-wider">Slope</div>
            <div className="text-xl font-bold text-[#004D35]">{course.slope_rating || '—'}</div>
          </div>
          <div>
            <div className="text-xs text-[#888] uppercase tracking-wider">Rating</div>
            <div className="text-xl font-bold text-[#004D35]">{course.course_rating || '—'}</div>
          </div>
        </div>
        {reviewStats?.avg_rating > 0 && (
          <div className="mt-3 pt-3 border-t border-[#E8E0D0] text-center">
            <span className="text-[#C8A951]">{'★'.repeat(Math.round(reviewStats.avg_rating))}</span>
            <span className="text-[#E8E0D0]">{'★'.repeat(5 - Math.round(reviewStats.avg_rating))}</span>
            <span className="text-sm text-[#888] ml-2">
              {Math.round(reviewStats.avg_rating * 10) / 10} ({reviewStats.review_count} review{reviewStats.review_count !== 1 ? 's' : ''})
            </span>
          </div>
        )}
      </div>

      {/* My Rounds at this Course */}
      <div className="bg-white rounded-lg shadow-md border border-[#E8E0D0] p-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-[#004D35]" style={{ fontFamily: "'Playfair Display', serif" }}>My Rounds Here</h2>
          <Link to="/rounds/new" className="text-sm bg-[#006747] text-white px-3 py-1 rounded hover:bg-[#004D35] transition-colors uppercase tracking-wider">
            + Log Round
          </Link>
        </div>
        {myRounds.length === 0 ? (
          <p className="text-[#888] text-sm">No rounds logged at this course yet.</p>
        ) : (
          <div className="divide-y divide-[#E8E0D0]">
            {myRounds.map((r) => (
              <Link key={r.id} to={`/rounds/${r.id}`} className="flex justify-between items-center py-3 hover:bg-[#FFF8E7] px-2 -mx-2 rounded transition-colors">
                <div className="text-sm text-[#888]">{formatDate(r.date_played)}</div>
                <div className="flex items-center gap-3">
                  {r.total_putts && <span className="text-xs text-[#888]">{r.total_putts} putts</span>}
                  <span className={`text-lg font-bold ${scoreColor(r.total_score, course.par)}`}>{r.total_score}</span>
                  <span className="text-xs text-[#888]">{formatScoreToPar(r.total_score, course.par)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-lg shadow-md border border-[#E8E0D0] p-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-[#004D35]" style={{ fontFamily: "'Playfair Display', serif" }}>Reviews</h2>
          {!myReview && !showReviewForm && (
            <button onClick={() => setShowReviewForm(true)} className="text-sm bg-[#006747] text-white px-3 py-1 rounded hover:bg-[#004D35] transition-colors uppercase tracking-wider">
              Write Review
            </button>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <form onSubmit={handleSubmitReview} className="border border-[#E8E0D0] rounded-md p-4 mb-4 space-y-3 bg-[#FFF8E7]">
            {reviewError && <div className="text-red-600 text-sm">{reviewError}</div>}
            <div>
              <label className="block text-xs font-medium text-[#004D35] mb-1 uppercase tracking-wider">Overall Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setReviewForm((f) => ({ ...f, rating: n }))}
                    className={`text-2xl ${n <= reviewForm.rating ? 'text-[#C8A951]' : 'text-[#E8E0D0]'}`}>
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[['conditionRating', 'Condition'], ['paceRating', 'Pace'], ['valueRating', 'Value']].map(([key, label]) => (
                <div key={key}>
                  <label className="block text-xs text-[#888] mb-1 uppercase tracking-wider">{label}</label>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" onClick={() => setReviewForm((f) => ({ ...f, [key]: n }))}
                        className={`text-sm ${n <= reviewForm[key] ? 'text-[#C8A951]' : 'text-[#E8E0D0]'}`}>
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
              className="w-full border border-[#D4C9B0] rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C8A951]"
            />
            <textarea
              placeholder="Your thoughts on this course..." value={reviewForm.body}
              onChange={(e) => setReviewForm((f) => ({ ...f, body: e.target.value }))}
              className="w-full border border-[#D4C9B0] rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C8A951]"
              rows={3}
            />
            <div className="flex gap-2">
              <button type="submit" className="bg-[#006747] text-white px-4 py-1 rounded text-sm hover:bg-[#004D35] uppercase tracking-wider">Submit</button>
              <button type="button" onClick={() => setShowReviewForm(false)} className="text-[#888] text-sm hover:underline">Cancel</button>
            </div>
          </form>
        )}

        {reviews.length === 0 && !showReviewForm ? (
          <p className="text-[#888] text-sm">No reviews yet. Be the first!</p>
        ) : (
          <div className="divide-y divide-[#E8E0D0]">
            {reviews.map((r) => (
              <div key={r.id} className="py-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[#C8A951]">{'★'.repeat(r.rating)}</span>
                    <span className="text-[#E8E0D0]">{'★'.repeat(5 - r.rating)}</span>
                    {r.title && <span className="ml-2 font-medium text-[#333]">{r.title}</span>}
                  </div>
                  <div className="text-xs text-[#aaa] flex items-center gap-2">
                    <span>{r.display_name || r.username}</span>
                    {r.user_id === user?.id && (
                      <button onClick={() => handleDeleteReview(r.id)} className="text-red-400 hover:text-red-600">Delete</button>
                    )}
                  </div>
                </div>
                {r.body && <p className="text-sm text-[#555] mt-1">{r.body}</p>}
                {(r.condition_rating || r.pace_rating || r.value_rating) && (
                  <div className="flex gap-4 mt-1 text-xs text-[#888]">
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

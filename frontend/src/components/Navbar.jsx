import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const linkClass = (path) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      location.pathname === path
        ? 'bg-green-700 text-white'
        : 'text-green-100 hover:bg-green-600 hover:text-white'
    }`;

  return (
    <nav className="bg-green-800 shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between h-14 items-center">
          <div className="flex items-center space-x-1">
            <Link to="/" className="text-white font-bold text-lg mr-4">
              ⛳ Golf Tracker
            </Link>
            {user && (
              <>
                <Link to="/" className={linkClass('/')}>Dashboard</Link>
                <Link to="/rounds/new" className={linkClass('/rounds/new')}>Log Round</Link>
                <Link to="/courses" className={linkClass('/courses')}>Courses</Link>
                <Link to="/rounds" className={linkClass('/rounds')}>My Rounds</Link>
                <Link to="/friends" className={linkClass('/friends')}>Friends</Link>
              </>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <span className="text-green-200 text-sm">{user.display_name || user.displayName || user.username}</span>
                <button
                  onClick={handleLogout}
                  className="text-green-200 hover:text-white text-sm px-3 py-1 rounded border border-green-600 hover:border-green-400 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="text-green-200 hover:text-white text-sm">Login</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

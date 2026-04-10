import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const linkClass = (path) =>
    `px-4 py-2 text-sm tracking-wide uppercase transition-all duration-200 ${
      location.pathname === path
        ? 'text-white border-b-2 border-[#C8A951]'
        : 'text-green-100 hover:text-white hover:border-b-2 hover:border-[#C8A951]/50'
    }`;

  return (
    <nav className="bg-[#006747] shadow-lg">
      {/* Top gold accent line */}
      <div className="h-1 bg-[#C8A951]"></div>

      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-[#C8A951] text-2xl">&#9971;</span>
            <span className="text-white text-xl tracking-wider" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Golf Tracker
            </span>
          </Link>

          {/* Desktop Nav */}
          {user && (
            <div className="hidden md:flex items-center space-x-1">
              <Link to="/" className={linkClass('/')}>Dashboard</Link>
              <Link to="/rounds/new" className={linkClass('/rounds/new')}>Log Round</Link>
              <Link to="/courses" className={linkClass('/courses')}>Courses</Link>
              <Link to="/rounds" className={linkClass('/rounds')}>Rounds</Link>
              <Link to="/friends" className={linkClass('/friends')}>Friends</Link>
              <Link to="/handicap" className={linkClass('/handicap')}>Handicap</Link>
              <Link to="/leaderboard" className={linkClass('/leaderboard')}>Leaderboard</Link>
              <Link to="/driving-distance" className={linkClass('/driving-distance')}>Driving</Link>
            </div>
          )}

          {/* User / Auth */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-[#C8A951] text-sm font-medium hidden sm:inline">
                  {user.display_name || user.displayName || user.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-green-200 hover:text-white text-sm px-3 py-1.5 rounded border border-[#C8A951]/40 hover:border-[#C8A951] transition-all duration-200"
                >
                  Logout
                </button>
                {/* Mobile menu button */}
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="md:hidden text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                  </svg>
                </button>
              </>
            ) : (
              <Link to="/login" className="text-[#C8A951] hover:text-white text-sm tracking-wide uppercase">
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && user && (
          <div className="md:hidden pb-4 border-t border-[#004D35]">
            <div className="flex flex-col space-y-1 pt-3">
              <Link to="/" onClick={() => setMenuOpen(false)} className="text-green-100 hover:text-white px-3 py-2 text-sm uppercase tracking-wide">Dashboard</Link>
              <Link to="/rounds/new" onClick={() => setMenuOpen(false)} className="text-green-100 hover:text-white px-3 py-2 text-sm uppercase tracking-wide">Log Round</Link>
              <Link to="/courses" onClick={() => setMenuOpen(false)} className="text-green-100 hover:text-white px-3 py-2 text-sm uppercase tracking-wide">Courses</Link>
              <Link to="/rounds" onClick={() => setMenuOpen(false)} className="text-green-100 hover:text-white px-3 py-2 text-sm uppercase tracking-wide">Rounds</Link>
              <Link to="/friends" onClick={() => setMenuOpen(false)} className="text-green-100 hover:text-white px-3 py-2 text-sm uppercase tracking-wide">Friends</Link>
              <Link to="/handicap" onClick={() => setMenuOpen(false)} className="text-green-100 hover:text-white px-3 py-2 text-sm uppercase tracking-wide">Handicap</Link>
              <Link to="/leaderboard" onClick={() => setMenuOpen(false)} className="text-green-100 hover:text-white px-3 py-2 text-sm uppercase tracking-wide">Leaderboard</Link>
              <Link to="/driving-distance" onClick={() => setMenuOpen(false)} className="text-green-100 hover:text-white px-3 py-2 text-sm uppercase tracking-wide">Driving</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

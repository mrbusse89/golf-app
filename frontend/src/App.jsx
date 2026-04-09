import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LogRound from './pages/LogRound';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import RoundsList from './pages/RoundsList';
import RoundDetail from './pages/RoundDetail';
import Friends from './pages/Friends';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/rounds/new" element={<ProtectedRoute><LogRound /></ProtectedRoute>} />
          <Route path="/rounds" element={<ProtectedRoute><RoundsList /></ProtectedRoute>} />
          <Route path="/rounds/:id" element={<ProtectedRoute><RoundDetail /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
          <Route path="/courses/:id" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
          <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ContentCreate from './pages/ContentCreate';
import ContentDetail from './pages/ContentDetail';
import ContentList from './pages/ContentList';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/content"
            element={
              <ProtectedRoute>
                <ContentList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/content/create"
            element={
              <ProtectedRoute>
                <ContentCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/content/:id"
            element={
              <ProtectedRoute>
                <ContentDetail />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import CreatePost from './pages/CreatePost';
import SearchPost from './pages/SearchPost';
import EditPost from './pages/EditPost';
import UserProfile from './pages/User';
import Settings from './pages/Settings';
import Comments from './pages/Comments';
import Popup from './components/Popup';

function RegisterAndLogout() {
  localStorage.clear();
  return <Register />;
}

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

function App() {
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const handleSessionExpired = () => {
      setSessionExpired(true);
    };
    window.addEventListener('session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, []);

  const handlePopupClose = () => {
    setSessionExpired(false);
    window.location.href = '/login';
  };

  return (
    <>
      {sessionExpired && (
        <Popup
          show={sessionExpired}
          onClose={handlePopupClose}
          title="Session Expired"
          message="Your session has expired. Please log in again."
        />
      )}
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route path="/register" element={<RegisterAndLogout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="*" element={<NotFound />} />
          <Route
            path="/post/create"
            element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            }
          />
          <Route
            path="/post/search"
            element={
              <ProtectedRoute>
                <SearchPost />
              </ProtectedRoute>
            }
          />
          <Route
            path="/post/:postId/edit"
            element={
              <ProtectedRoute>
                <EditPost />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/:username"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/comments/:postId"
            element={
              <ProtectedRoute>
                <Comments />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

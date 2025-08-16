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

function RegisterAndLogout() {
  localStorage.clear();
  return <Register />;
}

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

function App() {

  return (
    <>
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
  )
}

export default App

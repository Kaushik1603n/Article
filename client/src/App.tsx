import './App.css'
import ProtectedRoute from './components/ProtectedRouteProps';
import PublicRoute from './components/PublicRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SettingsPage from './pages/SettingsPage';
import CreateArticlePage from './pages/CreateArticlePage';
import { ToastContainer } from "react-toastify";



function App() {
  return (
    <>
      <ToastContainer />
      <BrowserRouter>
        <Routes>

          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>} />
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>}
          />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-article"
            element={
              <ProtectedRoute>
                <CreateArticlePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/articles/my-articles"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/articles/edit/:id"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App

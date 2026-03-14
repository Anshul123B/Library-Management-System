import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layout Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import BookManagement from './pages/Books/BookManagement';
import BrowseBooks from './pages/Books/BrowseBooks';
import IssueBook from './pages/Issues/IssueBook';
import ReturnBook from './pages/Issues/ReturnBook';
import MyIssuesHistory from './pages/Issues/MyIssuesHistory';
import UsersList from './pages/Admin/UsersList';
import ActiveIssues from './pages/Admin/ActiveIssues';
import OverdueBooks from './pages/Admin/OverdueBooks';
import Reports from './pages/Admin/Reports';
import Memberships from './pages/Admin/Memberships';
import Movies from './pages/Admin/Movies';
import BrowseMovies from './pages/Admin/BrowseMovies';

import './App.css';

const AppLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer theme="dark" position="top-right" autoClose={3000} />
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout><Dashboard /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/books"
            element={
              <ProtectedRoute adminOnly>
                <AppLayout><BookManagement /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/browse-books"
            element={
              <ProtectedRoute>
                <AppLayout><BrowseBooks /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/issue-book"
            element={
              <ProtectedRoute>
                <AppLayout><IssueBook /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/return-book"
            element={
              <ProtectedRoute>
                <AppLayout><ReturnBook /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-issues"
            element={
              <ProtectedRoute>
                <AppLayout><MyIssuesHistory /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute adminOnly>
                <AppLayout><UsersList /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/active-issues"
            element={
              <ProtectedRoute adminOnly>
                <AppLayout><ActiveIssues /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/overdue-books"
            element={
              <ProtectedRoute adminOnly>
                <AppLayout><OverdueBooks /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute adminOnly>
                <AppLayout><Reports /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/memberships"
            element={
              <ProtectedRoute adminOnly>
                <AppLayout><Memberships /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/movies"
            element={
              <ProtectedRoute adminOnly>
                <AppLayout><Movies /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/browse-movies"
            element={
              <ProtectedRoute>
                <AppLayout><BrowseMovies /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import FlashcardsPage from './components/flashcards/FlashcardsPage';
import CategoriesPage from './components/categories/CategoriesPage';
import QuizzesPage from './components/quizzes/QuizzesPage';
import TrueFalsePage from './components/truefalse/TrueFalsePage';
import LandingPage from './components/landing/LandingPage';
import DashboardLayout from './components/layout/DashboardLayout';
import './App.css';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading">Cargando...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

// App Routes component
const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to="/flashcards" /> : <LandingPage />}
      />
      <Route
        path="/login"
        element={user ? <Navigate to="/flashcards" /> : <Login />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to="/flashcards" /> : <Signup />}
      />
      <Route
        path="/flashcards"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <FlashcardsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/quizzes/*"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <QuizzesPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/truefalse/*"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <TrueFalsePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <CategoriesPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

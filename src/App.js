import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import FlashcardsPage from './components/flashcards/FlashcardsPage';
import CategoriesPage from './components/categories/CategoriesPage';
import QuizzesPage from './components/quizzes/QuizzesPage';
import TrueFalsePage from './components/truefalse/TrueFalsePage';
import StudyGuidesPage from './components/studyguides/StudyGuidesPage';
import DashboardPage from './components/dashboard/DashboardPage';
import HistorialPage from './components/historial/HistorialPage';
import LibraryPage from './components/library/LibraryPage';
import ProfilePage from './components/profile/ProfilePage';
import GamesHubPage from './components/games/GamesHubPage';
import SurvivalModePage from './components/games/SurvivalModePage';
import MemoryModePage from './components/games/MemoryModePage';
import ContrarrelojModePage from './components/games/ContrarrelojModePage';
import EscrituraModePage from './components/games/EscrituraModePage';
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
        element={user ? <Navigate to="/categories" /> : <LandingPage />}        
      />
      <Route
        path="/login"
        element={user ? <Navigate to="/categories" /> : <Login />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to="/categories" /> : <Signup />}
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
      <Route
        path="/study-guides"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <StudyGuidesPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/historial"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <HistorialPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/biblioteca"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <LibraryPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ProfilePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/games"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <GamesHubPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/games/survival"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <SurvivalModePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/games/memoria"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <MemoryModePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/games/contrarreloj"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ContrarrelojModePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/games/escritura"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <EscrituraModePage />
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

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import FlashcardsPage from './components/flashcards/FlashcardsPage';
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
        path="/login"
        element={user ? <Navigate to="/flashcards" /> : <Login />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to="/flashcards" /> : <Signup />}
      />
      <Route
        path="/"
        element={<Navigate to="/flashcards" />}
      />
      <Route
        path="/flashcards/*"
        element={
          <ProtectedRoute>
            <FlashcardsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/flashcards" />} />
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

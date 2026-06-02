import React, { useEffect, useState } from "react";
/* eslint-disable @typescript-eslint/no-unused-vars */
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ConfirmDialogProvider } from "./contexts/ConfirmDialogContext";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import FlashcardsPage from "./components/flashcards/FlashcardsPage";
import CategoriesPage from "./components/categories/CategoriesPage";
import QuizzesPage from "./components/quizzes/QuizzesPage";
import TrueFalsePage from "./components/truefalse/TrueFalsePage";
import StudyGuidesPage from "./components/studyguides/StudyGuidesPage";
import DashboardPage from "./components/dashboard/DashboardPage";
import HistorialPage from "./components/historial/HistorialPage";
import LibraryPage from "./components/library/LibraryPage";
import ProfilePage from "./components/profile/ProfilePage";
import GamesHubPage from "./components/games/GamesHubPage";
import SurvivalModePage from "./components/games/SurvivalModePage";
import MemoryModePage from "./components/games/MemoryModePage";
import ContrarrelojModePage from "./components/games/ContrarrelojModePage";
import EscrituraModePage from "./components/games/EscrituraModePage";
import SpacedRepetitionPage from "./components/flashcards/SpacedRepetitionPage";
import ExamSimulationsPage from "./components/examsim/ExamSimulationsPage";
import NotFoundPage from "./components/shared/NotFoundPage";
import LandingPage from "./components/landing/LandingPage";
import MobileLandingPage from "./components/mobile/MobileLandingPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import OfflineBanner from "./components/shared/OfflineBanner";
import PwaInstallPrompt from "./components/shared/PwaInstallPrompt";
import IntroModulePage from "./components/intro/IntroModulePage";
import FaqPage from "./components/faq/FaqPage";
import MobileHomePage from "./components/mobile/MobileHomePage";
import MobileCreatePage from "./components/mobile/MobileCreatePage";
import MobileLibraryPage from "./components/mobile/MobileLibraryPage";
import MobileProfilePage from "./components/mobile/MobileProfilePage";
import Terms from "./components/terms/Terms";
import Policies from "./components/terms/Policies";
import { useOnboardingIntroGate } from "./hooks/useOnboardingIntroGate";
import "./App.css";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="app-loading-screen" role="status" aria-live="polite">
        <div className="app-loading-spinner" aria-hidden="true" />
        <p>Cargando tu espacio de estudio...</p>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  const LandingEntry: React.FC = () => {
    const [isMobileViewport, setIsMobileViewport] = useState(
      typeof window !== "undefined" ? window.innerWidth <= 900 : false,
    );
    useEffect(() => {
      const onResize = () => setIsMobileViewport(window.innerWidth <= 900);
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }, []);
    return isMobileViewport ? <MobileLandingPage /> : <LandingPage />;
  };

  const DashboardEntry: React.FC = () => {
    const [isMobileViewport, setIsMobileViewport] = useState(
      typeof window !== "undefined" ? window.innerWidth <= 900 : false,
    );
    const { isChecking, shouldShowIntro } = useOnboardingIntroGate();

    useEffect(() => {
      const onResize = () => setIsMobileViewport(window.innerWidth <= 900);
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }, []);

    if (isChecking) {
      return (
        <div className="app-loading-screen" role="status" aria-live="polite">
          <div className="app-loading-spinner" aria-hidden="true" />
          <p>Preparando tu espacio de estudio...</p>
        </div>
      );
    }

    if (shouldShowIntro) {
      return <Navigate to={isMobileViewport ? "/m/intro" : "/intro"} replace />;
    }

    return (
      <DashboardLayout>
        {isMobileViewport ? <MobileHomePage /> : <DashboardPage />}
      </DashboardLayout>
    );
  };

  const MobileHomeEntry: React.FC = () => {
    const { isChecking, shouldShowIntro } = useOnboardingIntroGate();

    if (isChecking) {
      return (
        <div className="app-loading-screen" role="status" aria-live="polite">
          <div className="app-loading-spinner" aria-hidden="true" />
          <p>Preparando tu espacio de estudio...</p>
        </div>
      );
    }

    if (shouldShowIntro) {
      return <Navigate to="/m/intro" replace />;
    }

    return (
      <DashboardLayout>
        <MobileHomePage />
      </DashboardLayout>
    );
  };

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" /> : <LandingEntry />}
      />
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to="/dashboard" /> : <Signup />}
      />
      <Route path="/terms" element={<Terms />} />
      <Route path="/policies" element={<Policies />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <ConfirmDialogProvider>
              <OfflineBanner />
              <PwaInstallPrompt />
              <div className="App">
                <a href="#main-content" className="app-skip-link">
                  Saltar al contenido principal
                </a>
                <AppRoutes />
              </div>
            </ConfirmDialogProvider>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

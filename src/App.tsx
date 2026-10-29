import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import { AppLayout } from './components/AppLayout';
import { PageFallback } from './components/PageFallback';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';

// Code-Splitting je Route: Landingpage sofort, alles andere (inkl. KaTeX/Canvas) erst bei Bedarf.
const AuthPage = lazy(() => import('./pages/AuthPage'));
const ChapterPage = lazy(() => import('./pages/ChapterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ExercisePage = lazy(() => import('./pages/ExercisePage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const TopicPage = lazy(() => import('./pages/TopicPage'));

/**
 * Routen
 *  öffentlich: /  /login  /register  /legal/:page
 *  geschützt:  /app  /app/topics/:topicId  /app/topics/:topicId/chapters/:subtopicId  /app/exercises/:exerciseId  /app/history
 */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/legal/:page" element={<LegalPage />} />
          <Route path="/app" element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="topics/:topicId" element={<TopicPage />} />
              <Route path="topics/:topicId/chapters/:subtopicId" element={<ChapterPage />} />
              <Route path="exercises/:exerciseId" element={<ExercisePage />} />
              <Route path="history" element={<HistoryPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

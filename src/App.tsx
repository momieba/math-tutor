import { BrowserRouter, Route, Routes } from 'react-router';
import { AppLayout } from './components/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import ChapterPage from './pages/ChapterPage';
import DashboardPage from './pages/DashboardPage';
import ExercisePage from './pages/ExercisePage';
import HistoryPage from './pages/HistoryPage';
import LandingPage from './pages/LandingPage';
import LegalPage from './pages/LegalPage';
import NotFoundPage from './pages/NotFoundPage';
import TopicPage from './pages/TopicPage';

/**
 * Routen
 *  öffentlich: /  /login  /register  /legal/:page
 *  geschützt:  /app  /app/topics/:topicId  /app/topics/:topicId/chapters/:subtopicId  /app/exercises/:exerciseId  /app/history
 */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </AuthProvider>
  );
}

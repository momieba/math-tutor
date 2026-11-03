import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import { AppLayout } from './components/AppLayout';
import { PageFallback } from './components/PageFallback';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import { configError } from './services/config';

// Code-Splitting je Route: Landingpage sofort, alles andere (inkl. KaTeX/Canvas) erst bei Bedarf.
const AccountPage = lazy(() => import('./pages/AccountPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const ChapterPage = lazy(() => import('./pages/ChapterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ExercisePage = lazy(() => import('./pages/ExercisePage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const ForgotPasswordPage = lazy(() => import('./pages/PasswordPages').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/PasswordPages').then((m) => ({ default: m.ResetPasswordPage })));
const TopicPage = lazy(() => import('./pages/TopicPage'));

/**
 * Routen
 *  öffentlich: /  /login  /register  /forgot-password  /reset-password  /legal/:page
 *  geschützt:  /app  /app/topics/:topicId  /app/topics/:topicId/chapters/:subtopicId  /app/exercises/:exerciseId  /app/history  /app/account
 */
export default function App() {
  if (configError) return <ConfigErrorPage message={configError} />;
  return (
    <AuthProvider>
      <ToastProvider>
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/legal/:page" element={<LegalPage />} />
          <Route path="/app" element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="topics/:topicId" element={<TopicPage />} />
              <Route path="topics/:topicId/chapters/:subtopicId" element={<ChapterPage />} />
              <Route path="exercises/:exerciseId" element={<ExercisePage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="account" element={<AccountPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

/** Fehlkonfigurierter Production-Build: lieber gar nicht starten als Kinderdaten unbemerkt nur im Browser speichern. */
function ConfigErrorPage({ message }: { message: string }) {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div role="alert" className="max-w-lg rounded-2xl border border-red-200 bg-red-50 p-6 space-y-2">
        <h1 className="text-xl font-bold text-red-900">Die App ist nicht richtig eingerichtet</h1>
        <p className="text-red-900">{message}</p>
      </div>
    </main>
  );
}

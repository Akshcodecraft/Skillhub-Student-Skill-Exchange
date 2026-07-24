import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AddSkillModal } from './components/skills/AddSkillModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { SessionsPage } from './pages/SessionsPage';
import { ChatPage } from './pages/ChatPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AdminPage } from './pages/AdminPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthPage } from './pages/AuthPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs text-zinc-500">
        Loading SkillHub...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
};

const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs text-zinc-500">
        Loading...
      </div>
    );
  }
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

function AppContent() {
  const [addSkillModalOpen, setAddSkillModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans antialiased transition-colors duration-200 selection:bg-indigo-500 selection:text-white">
      <Navbar onOpenAddSkill={() => setAddSkillModalOpen(true)} />

      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage onOpenAddSkill={() => setAddSkillModalOpen(true)} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace"
            element={
              <ProtectedRoute>
                <MarketplacePage onOpenAddSkill={() => setAddSkillModalOpen(true)} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions"
            element={
              <ProtectedRoute>
                <SessionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <LeaderboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminPage />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:uid"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      {/* Global Add Skill Modal */}
      <AddSkillModal
        isOpen={addSkillModalOpen}
        onClose={() => setAddSkillModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

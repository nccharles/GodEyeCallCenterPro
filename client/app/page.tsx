'use client';

import { useAuth } from '@/components/auth/auth-provider';
import { LoginPage } from '@/components/auth/login-page';
import { Dashboard } from '@/components/dashboard/dashboard';
import { useEffect } from 'react';

export default function Home() {
  const { user, loading,login } = useAuth();

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage  userGoogleLogin={login}/>;
  }

  return <Dashboard />;
}
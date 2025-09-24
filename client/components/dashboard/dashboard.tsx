'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { ChatsPage } from './pages/chats-page';
import { CallsPage } from './pages/calls-page';
import { TeamsPage } from './pages/teams-page';
import { SettingsPage } from './pages/settings-page';
import { NotificationProvider } from '@/components/notifications/notification-provider';
import { CallProvider } from '@/components/calls/call-provider';

export function Dashboard() {
  const [currentPage, setCurrentPage] = useState('chats');

  const renderPage = () => {
    switch (currentPage) {
      case 'chats':
        return <ChatsPage />;
      case 'calls':
        return <CallsPage />;
      case 'teams':
        return <TeamsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <ChatsPage />;
    }
  };

  return (
    <NotificationProvider>
      <CallProvider>
        <div className="flex h-screen bg-gray-50">
          <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto">
              {renderPage()}
            </main>
          </div>
        </div>
      </CallProvider>
    </NotificationProvider>
  );
}
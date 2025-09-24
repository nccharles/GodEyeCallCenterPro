'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'call' | 'chat' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: {
    total: number;
    calls: number;
    chats: number;
    system: number;
  };
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
  requestPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const notification: Notification = {
      ...notificationData,
      id: `notification-${Date.now()}`,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [notification, ...prev]);

    // Show toast
    toast(notification.title, {
      description: notification.message,
      duration: 5000,
    });

    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: notification.type,
        renotify: true
      });
    }
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }, []);

  const unreadCount = {
    total: notifications.filter(n => !n.read).length,
    calls: notifications.filter(n => !n.read && n.type === 'call').length,
    chats: notifications.filter(n => !n.read && n.type === 'chat').length,
    system: notifications.filter(n => !n.read && n.type === 'system').length,
  };

  // Simulate notifications for demo
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.2) { // 20% chance every 15 seconds
        const types = ['chat', 'system'] as const;
        const type = types[Math.floor(Math.random() * types.length)];
        
        addNotification({
          type,
          title: type === 'chat' ? 'New Message' : 'System Update',
          message: type === 'chat' ? 'You have a new message from a customer' : 'Your availability status has been updated'
        });
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [addNotification]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    clearNotifications,
    requestPermission
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
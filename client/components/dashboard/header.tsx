'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Bell, Phone, MessageCircle } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { useNotifications } from '@/components/notifications/notification-provider';
import { useCalls } from '@/components/calls/call-provider';

export function Header() {
  const { user, updateStatus } = useAuth();
  const { notifications, clearNotifications } = useNotifications();
  const { activeCall } = useCalls();

  const handleStatusChange = (isAvailable: boolean) => {
    updateStatus(isAvailable, user?.onCall || false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Call Center Pro</h1>
          
          {activeCall && (
            <Badge variant="destructive" className="animate-pulse">
              <Phone className="mr-1 h-3 w-3" />
              Active Call
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Availability Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Available</span>
            <Switch
              checked={user?.isAvailable || false}
              onCheckedChange={handleStatusChange}
              disabled={user?.onCall}
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearNotifications}
              className="relative"
            >
              <Bell className="h-4 w-4" />
              {notifications.length > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
                >
                  {notifications.length}
                </Badge>
              )}
            </Button>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MessageCircle className="h-4 w-4" />
            <span>Ready for new messages</span>
          </div>
        </div>
      </div>
    </header>
  );
}
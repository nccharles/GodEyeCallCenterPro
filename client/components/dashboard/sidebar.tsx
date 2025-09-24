'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Phone, 
  Users, 
  Settings, 
  LogOut,
  Bell
} from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/components/notifications/notification-provider';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const { user, tenant, team, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const menuItems = [
    { 
      id: 'chats', 
      label: 'Chats', 
      icon: MessageCircle, 
      badge: unreadCount.chats > 0 ? unreadCount.chats : undefined
    },
    { 
      id: 'calls', 
      label: 'Calls', 
      icon: Phone, 
      badge: unreadCount.calls > 0 ? unreadCount.calls : undefined
    },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.picture} alt={user?.name} />
            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {team?.name} • {tenant?.name}
            </p>
          </div>
        </div>
        
        <div className="mt-3 flex items-center justify-between">
          <Badge 
            variant={user?.isAvailable ? 'default' : 'secondary'}
            className="text-xs"
          >
            {user?.isAvailable ? 'Available' : 'Away'}
          </Badge>
          {user?.onCall && (
            <Badge variant="destructive" className="text-xs">
              On Call
            </Badge>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={currentPage === item.id ? 'default' : 'ghost'}
              className={cn(
                'w-full justify-start h-10',
                currentPage === item.id && 'bg-blue-600 text-white hover:bg-blue-700'
              )}
              onClick={() => onPageChange(item.id)}
            >
              <Icon className="mr-3 h-4 w-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge variant="destructive" className="text-xs">
                  {item.badge}
                </Badge>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={logout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, User, Shield, Palette, Globe, Volume2 } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';

export function SettingsPage() {
  const { user, tenant } = useAuth();
  const [notifications, setNotifications] = useState({
    newMessages: true,
    incomingCalls: true,
    statusChanges: false,
    dailySummary: true
  });

  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'UTC-5',
    soundEnabled: true
  });

  return (
    <div className="p-6 space-y-6">
      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Profile Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.picture} alt={user?.name} />
              <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue={user?.name} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue={user?.email} disabled />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role">Role</Label>
              <Input id="role" defaultValue={user?.role} disabled />
            </div>
            <div>
              <Label htmlFor="organization">Organization</Label>
              <Input id="organization" defaultValue={tenant?.name} disabled />
            </div>
          </div>
          
          <Button>Update Profile</Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notification Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>New Messages</Label>
              <p className="text-sm text-gray-600">Get notified when you receive new chat messages</p>
            </div>
            <Switch
              checked={notifications.newMessages}
              onCheckedChange={(checked) =>
                setNotifications(prev => ({ ...prev, newMessages: checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Incoming Calls</Label>
              <p className="text-sm text-gray-600">Get notified about incoming calls</p>
            </div>
            <Switch
              checked={notifications.incomingCalls}
              onCheckedChange={(checked) =>
                setNotifications(prev => ({ ...prev, incomingCalls: checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Status Changes</Label>
              <p className="text-sm text-gray-600">Get notified when team members change status</p>
            </div>
            <Switch
              checked={notifications.statusChanges}
              onCheckedChange={(checked) =>
                setNotifications(prev => ({ ...prev, statusChanges: checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Daily Summary</Label>
              <p className="text-sm text-gray-600">Receive daily performance summaries</p>
            </div>
            <Switch
              checked={notifications.dailySummary}
              onCheckedChange={(checked) =>
                setNotifications(prev => ({ ...prev, dailySummary: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Appearance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Theme</Label>
            <Select
              value={preferences.theme}
              onValueChange={(value) =>
                setPreferences(prev => ({ ...prev, theme: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Language</Label>
            <Select
              value={preferences.language}
              onValueChange={(value) =>
                setPreferences(prev => ({ ...prev, language: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audio Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Volume2 className="h-5 w-5" />
            <span>Audio Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Sound Notifications</Label>
              <p className="text-sm text-gray-600">Play sounds for notifications and calls</p>
            </div>
            <Switch
              checked={preferences.soundEnabled}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, soundEnabled: checked }))
              }
            />
          </div>
          
          <div>
            <Label>Ringtone</Label>
            <Select defaultValue="default">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="classic">Classic</SelectItem>
                <SelectItem value="modern">Modern</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full">
            Change Password
          </Button>
          <Button variant="outline" className="w-full">
            Enable Two-Factor Authentication
          </Button>
          <Button variant="destructive" className="w-full">
            Sign Out All Devices
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
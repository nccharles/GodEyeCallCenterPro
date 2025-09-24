'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Phone, MessageCircle, Clock } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';

interface Agent {
  id: string;
  name: string;
  avatar: string;
  email: string;
  role: string;
  status: 'available' | 'busy' | 'away';
  onCall: boolean;
  activeChats: number;
  totalCalls: number;
  avgResponseTime: string;
}

export function TeamsPage() {
  const { tenant, team } = useAuth();
  
  const agents: Agent[] = [
    {
      id: '1',
      name: 'John Smith',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?w=100&h=100&fit=crop',
      email: 'john@hospital.com',
      role: 'Senior Agent',
      status: 'available',
      onCall: false,
      activeChats: 3,
      totalCalls: 12,
      avgResponseTime: '2:30'
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?w=100&h=100&fit=crop',
      email: 'sarah@hospital.com',
      role: 'Agent',
      status: 'busy',
      onCall: true,
      activeChats: 2,
      totalCalls: 8,
      avgResponseTime: '3:15'
    },
    {
      id: '3',
      name: 'Michael Brown',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=100&h=100&fit=crop',
      email: 'michael@hospital.com',
      role: 'Agent',
      status: 'away',
      onCall: false,
      activeChats: 0,
      totalCalls: 5,
      avgResponseTime: '4:20'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-red-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'available': return 'default';
      case 'busy': return 'destructive';
      case 'away': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Team Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{agents.length}</p>
                <p className="text-sm text-gray-600">Team Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Phone className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{agents.filter(a => a.status === 'available').length}</p>
                <p className="text-sm text-gray-600">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{agents.reduce((sum, a) => sum + a.activeChats, 0)}</p>
                <p className="text-sm text-gray-600">Active Chats</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">3:02</p>
                <p className="text-sm text-gray-600">Avg Response</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>{team?.name} Team</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Organization:</strong> {tenant?.name}</p>
            <p><strong>Type:</strong> {tenant?.type === 'hospital' ? 'Healthcare' : 'Financial Services'}</p>
            <p><strong>Team:</strong> {team?.name}</p>
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agents.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={agent.avatar} alt={agent.name} />
                      <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${getStatusColor(agent.status)}`} />
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900">{agent.name}</h3>
                    <p className="text-sm text-gray-600">{agent.role}</p>
                    <p className="text-xs text-gray-500">{agent.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <p className="font-medium">{agent.activeChats}</p>
                    <p className="text-gray-600">Active Chats</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="font-medium">{agent.totalCalls}</p>
                    <p className="text-gray-600">Calls Today</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="font-medium">{agent.avgResponseTime}</p>
                    <p className="text-gray-600">Avg Response</p>
                  </div>
                  
                  <div className="text-center">
                    <Badge variant={getStatusVariant(agent.status)} className="capitalize">
                      {agent.onCall ? 'On Call' : agent.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
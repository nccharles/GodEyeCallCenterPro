'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff,
  PictureInPicture,
  Clock,
  Users
} from 'lucide-react';
import { useCalls } from '@/components/calls/call-provider';

interface Call {
  id: string;
  customerName: string;
  customerAvatar: string;
  type: 'voice' | 'video';
  status: 'incoming' | 'active' | 'on-hold' | 'ended';
  duration: string;
  priority: 'low' | 'medium' | 'high';
}

export function CallsPage() {
  const { activeCall, incomingCall, answerCall, endCall, toggleMute, toggleVideo, enablePiP } = useCalls();
  const [calls] = useState<Call[]>([
    {
      id: '1',
      customerName: 'David Johnson',
      customerAvatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?w=100&h=100&fit=crop',
      type: 'video',
      status: 'active',
      duration: '05:42',
      priority: 'high'
    },
    {
      id: '2',
      customerName: 'Maria Santos',
      customerAvatar: 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?w=100&h=100&fit=crop',
      type: 'voice',
      status: 'on-hold',
      duration: '03:21',
      priority: 'medium'
    },
    {
      id: '3',
      customerName: 'Robert Chen',
      customerAvatar: 'https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg?w=100&h=100&fit=crop',
      type: 'voice',
      status: 'ended',
      duration: '12:35',
      priority: 'low'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'incoming': return 'destructive';
      case 'on-hold': return 'secondary';
      case 'ended': return 'outline';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Incoming Call Alert */}
      {incomingCall && (
        <Card className="border-red-500 bg-red-50 animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={incomingCall.customerAvatar} alt={incomingCall.customerName} />
                  <AvatarFallback>{incomingCall.customerName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900">{incomingCall.customerName}</h3>
                  <p className="text-sm text-gray-600">Incoming {incomingCall.type} call</p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button variant="destructive" onClick={() => endCall()}>
                  <PhoneOff className="h-4 w-4 mr-2" />
                  Decline
                </Button>
                <Button onClick={() => answerCall(incomingCall.id)}>
                  <Phone className="h-4 w-4 mr-2" />
                  Answer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Call Controls */}
      {activeCall && (
        <Card className="border-green-500 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-green-600" />
              <span>Active Call</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={activeCall.customerAvatar} alt={activeCall.customerName} />
                  <AvatarFallback>{activeCall.customerName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900">{activeCall.customerName}</h3>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{activeCall.duration}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={toggleMute}>
                  {activeCall.muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                {activeCall.type === 'video' && (
                  <>
                    <Button variant="ghost" size="sm" onClick={toggleVideo}>
                      {activeCall.videoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={enablePiP}>
                      <PictureInPicture className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button variant="destructive" size="sm" onClick={endCall}>
                  <PhoneOff className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Phone className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">24</p>
                <p className="text-sm text-gray-600">Total Calls</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">4:32</p>
                <p className="text-sm text-gray-600">Avg Duration</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-gray-600">In Queue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Video className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-gray-600">Video Calls</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {calls.map((call) => (
              <div key={call.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={call.customerAvatar} alt={call.customerName} />
                      <AvatarFallback>{call.customerName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute -top-1 -right-1 h-3 w-3 rounded-full ${getPriorityColor(call.priority)}`} />
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900">{call.customerName}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      {call.type === 'video' ? <Video className="h-3 w-3" /> : <Phone className="h-3 w-3" />}
                      <span>{call.type} call</span>
                      <span>•</span>
                      <span>{call.duration}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge variant={getStatusColor(call.status)}>
                    {call.status}
                  </Badge>
                  
                  {call.status === 'active' && (
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        <Mic className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm">
                        <PhoneOff className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  X,
  Move
} from 'lucide-react';

interface CallData {
  id: string;
  customerName: string;
  customerAvatar: string;
  type: 'voice' | 'video';
  duration: string;
  muted: boolean;
  videoOff: boolean;
}

interface PictureInPictureWindowProps {
  call: CallData;
  onClose: () => void;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
}

export function PictureInPictureWindow({
  call,
  onClose,
  onEndCall,
  onToggleMute,
  onToggleVideo
}: PictureInPictureWindowProps) {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep window within viewport bounds
      const maxX = window.innerWidth - 320;
      const maxY = window.innerHeight - 200;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  return (
    <div
      ref={windowRef}
      className="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200 w-80 select-none"
      style={{
        left: position.x,
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-blue-600 text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4" />
          <span className="text-sm font-medium">Active Call</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white hover:bg-blue-700 h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* Video/Avatar Area */}
      <div className="bg-gray-900 h-32 flex items-center justify-center relative">
        {call.type === 'video' && !call.videoOff ? (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <span className="text-white text-sm">Customer Video</span>
          </div>
        ) : (
          <Avatar className="h-16 w-16">
            <AvatarImage src={call.customerAvatar} alt={call.customerName} />
            <AvatarFallback>{call.customerName.charAt(0)}</AvatarFallback>
          </Avatar>
        )}
        
        {/* Small self-video for video calls */}
        {call.type === 'video' && (
          <div className="absolute top-2 right-2 w-16 h-12 bg-gray-700 rounded border-2 border-white">
            <div className="w-full h-full flex items-center justify-center text-white text-xs">
              {call.videoOff ? 'Off' : 'You'}
            </div>
          </div>
        )}
      </div>

      {/* Call Info */}
      <div className="p-3 text-center border-b border-gray-200">
        <h3 className="font-medium text-gray-900">{call.customerName}</h3>
        <p className="text-sm text-gray-600">{call.duration}</p>
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-2 p-3">
        <Button
          variant={call.muted ? 'destructive' : 'ghost'}
          size="sm"
          onClick={onToggleMute}
        >
          {call.muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        
        {call.type === 'video' && (
          <Button
            variant={call.videoOff ? 'destructive' : 'ghost'}
            size="sm"
            onClick={onToggleVideo}
          >
            {call.videoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
          </Button>
        )}
        
        <Button
          variant="destructive"
          size="sm"
          onClick={onEndCall}
        >
          <PhoneOff className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
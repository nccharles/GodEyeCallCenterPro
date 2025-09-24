'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { PictureInPictureWindow } from './picture-in-picture-window';

interface CallData {
  id: string;
  customerName: string;
  customerAvatar: string;
  type: 'voice' | 'video';
  duration: string;
  muted: boolean;
  videoOff: boolean;
}

interface CallContextType {
  activeCall: CallData | null;
  incomingCall: CallData | null;
  pipEnabled: boolean;
  answerCall: (callId: string) => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  enablePiP: () => void;
  disablePiP: () => void;
  simulateIncomingCall: () => void;
}

const CallContext = createContext<CallContextType | null>(null);

export function CallProvider({ children }: { children: React.ReactNode }) {
  const [activeCall, setActiveCall] = useState<CallData | null>(null);
  const [incomingCall, setIncomingCall] = useState<CallData | null>(null);
  const [pipEnabled, setPipEnabled] = useState(false);
  const callTimer = useRef<NodeJS.Timeout | null>(null);
  const callDuration = useRef(0);

  const generateMockCall = (): CallData => ({
    id: `call-${Date.now()}`,
    customerName: 'Emma Wilson',
    customerAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=100&h=100&fit=crop',
    type: Math.random() > 0.5 ? 'video' : 'voice',
    duration: '00:00',
    muted: false,
    videoOff: false
  });

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCallTimer = useCallback(() => {
    callDuration.current = 0;
    callTimer.current = setInterval(() => {
      callDuration.current += 1;
      setActiveCall(prev => prev ? { ...prev, duration: formatDuration(callDuration.current) } : null);
    }, 1000);
  }, []);

  const stopCallTimer = useCallback(() => {
    if (callTimer.current) {
      clearInterval(callTimer.current);
      callTimer.current = null;
    }
    callDuration.current = 0;
  }, []);

  const answerCall = useCallback((callId: string) => {
    if (incomingCall && incomingCall.id === callId) {
      setActiveCall({ ...incomingCall });
      setIncomingCall(null);
      startCallTimer();
      
      // Show notification
      if (Notification.permission === 'granted') {
        new Notification('Call answered', {
          body: `Connected to ${incomingCall.customerName}`,
          icon: '/icon-192x192.png'
        });
      }
    }
  }, [incomingCall, startCallTimer]);

  const endCall = useCallback(() => {
    setActiveCall(null);
    setIncomingCall(null);
    setPipEnabled(false);
    stopCallTimer();
  }, [stopCallTimer]);

  const toggleMute = useCallback(() => {
    setActiveCall(prev => prev ? { ...prev, muted: !prev.muted } : null);
  }, []);

  const toggleVideo = useCallback(() => {
    setActiveCall(prev => prev ? { ...prev, videoOff: !prev.videoOff } : null);
  }, []);

  const enablePiP = useCallback(() => {
    setPipEnabled(true);
  }, []);

  const disablePiP = useCallback(() => {
    setPipEnabled(false);
  }, []);

  const simulateIncomingCall = useCallback(() => {
    if (!activeCall && !incomingCall) {
      const call = generateMockCall();
      setIncomingCall(call);
      
      // Show notification
      if (Notification.permission === 'granted') {
        new Notification('Incoming Call', {
          body: `${call.type} call from ${call.customerName}`,
          icon: '/icon-192x192.png',
          requireInteraction: true
        });
      }
      
      // Auto-dismiss after 30 seconds
      setTimeout(() => {
        setIncomingCall(prev => prev?.id === call.id ? null : prev);
      }, 30000);
    }
  }, [activeCall, incomingCall]);

  // Simulate incoming calls periodically for demo
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every 30 seconds
        simulateIncomingCall();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [simulateIncomingCall]);

  const value: CallContextType = {
    activeCall,
    incomingCall,
    pipEnabled,
    answerCall,
    endCall,
    toggleMute,
    toggleVideo,
    enablePiP,
    disablePiP,
    simulateIncomingCall
  };

  return (
    <CallContext.Provider value={value}>
      {children}
      {pipEnabled && activeCall && (
        <PictureInPictureWindow
          call={activeCall}
          onClose={disablePiP}
          onEndCall={endCall}
          onToggleMute={toggleMute}
          onToggleVideo={toggleVideo}
        />
      )}
    </CallContext.Provider>
  );
}

export function useCalls() {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCalls must be used within a CallProvider');
  }
  return context;
}
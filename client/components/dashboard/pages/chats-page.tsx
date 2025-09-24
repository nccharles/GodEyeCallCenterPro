'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Paperclip, 
  Mic, 
  Phone,
  Video,
  MoreHorizontal
} from 'lucide-react';

interface Chat {
  id: string;
  customerName: string;
  customerAvatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  status: 'active' | 'waiting' | 'resolved';
  priority: 'low' | 'medium' | 'high';
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'voice';
  isAgent: boolean;
}

export function ChatsPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      customerName: 'Emma Wilson',
      customerAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=100&h=100&fit=crop',
      lastMessage: 'I need help with my account',
      timestamp: '2 min ago',
      unread: 3,
      status: 'active',
      priority: 'high'
    },
    {
      id: '2',
      customerName: 'Michael Brown',
      customerAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=100&h=100&fit=crop',
      lastMessage: 'Thank you for the assistance',
      timestamp: '15 min ago',
      unread: 0,
      status: 'resolved',
      priority: 'medium'
    },
    {
      id: '3',
      customerName: 'Lisa Garcia',
      customerAvatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?w=100&h=100&fit=crop',
      lastMessage: 'Waiting for response...',
      timestamp: '1 hour ago',
      unread: 1,
      status: 'waiting',
      priority: 'low'
    }
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: '1',
      senderName: 'Emma Wilson',
      content: 'Hello, I need help with my account',
      timestamp: '10:30 AM',
      type: 'text',
      isAgent: false
    },
    {
      id: '2',
      senderId: 'agent',
      senderName: 'You',
      content: 'Hi Emma! I\'d be happy to help you with your account. What specific issue are you experiencing?',
      timestamp: '10:32 AM',
      type: 'text',
      isAgent: true
    },
    {
      id: '3',
      senderId: '1',
      senderName: 'Emma Wilson',
      content: 'I can\'t access my online banking and I\'m getting an error message',
      timestamp: '10:33 AM',
      type: 'text',
      isAgent: false
    }
  ]);

  const handleSendMessage = () => {
    if (!message.trim() || !selectedChat) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'agent',
      senderName: 'You',
      content: message.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      isAgent: true
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Update chat last message
    setChats(prev => prev.map(chat => 
      chat.id === selectedChat 
        ? { ...chat, lastMessage: message.trim(), timestamp: 'now' }
        : chat
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'waiting': return 'secondary';
      case 'resolved': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="flex h-full">
      {/* Chat List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Active Chats</h2>
          <p className="text-sm text-gray-600">{chats.length} conversations</p>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {chats.map((chat) => (
              <Card 
                key={chat.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedChat === chat.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedChat(chat.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={chat.customerAvatar} alt={chat.customerName} />
                        <AvatarFallback>{chat.customerName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -top-1 -right-1 h-3 w-3 rounded-full ${getPriorityColor(chat.priority)}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {chat.customerName}
                        </h3>
                        <Badge variant={getStatusColor(chat.status)} className="text-xs">
                          {chat.status}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-gray-600 truncate mt-1">
                        {chat.lastMessage}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">{chat.timestamp}</span>
                        {chat.unread > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {chat.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={chats.find(c => c.id === selectedChat)?.customerAvatar} />
                    <AvatarFallback>
                      {chats.find(c => c.id === selectedChat)?.customerName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {chats.find(c => c.id === selectedChat)?.customerName}
                    </h3>
                    <p className="text-sm text-gray-600">Online now</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isAgent ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.isAgent
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${
                        msg.isAgent ? 'text-blue-100' : 'text-gray-600'
                      }`}>
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Mic className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <Input
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                </div>
                <Button onClick={handleSendMessage} disabled={!message.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No chat selected</h3>
              <p className="text-gray-600">Choose a conversation from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import { NextResponse } from 'next/server';

export async function GET() {
  const chats = [
    {
      id: '1',
      customerId: 'customer1',
      customerName: 'Emma Wilson',
      agentId: '1',
      tenantId: '1',
      messages: [
        {
          id: '1',
          senderId: 'customer1',
          content: 'Hello, I need help with my account',
          timestamp: '2024-01-20T10:30:00Z',
          type: 'text'
        },
        {
          id: '2',
          senderId: '1',
          content: 'Hi! I\'d be happy to help you with your account.',
          timestamp: '2024-01-20T10:31:00Z',
          type: 'text'
        }
      ]
    }
  ];

  return NextResponse.json(chats);
}

export async function POST(request: Request) {
  const body = await request.json();
  
  // In a real app, you'd save to database
  const newMessage = {
    id: `msg-${Date.now()}`,
    ...body,
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(newMessage);
}
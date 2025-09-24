import { NextResponse } from 'next/server';

export async function GET() {
  const calls = [
    {
      id: '1',
      customerId: 'customer1',
      customerName: 'David Johnson',
      agentId: '1',
      tenantId: '1',
      type: 'video',
      status: 'active',
      startTime: '2024-01-20T10:15:00Z'
    },
    {
      id: '2',
      customerId: 'customer2',
      customerName: 'Maria Santos',
      agentId: '2',
      tenantId: '1',
      type: 'voice',
      status: 'on-hold',
      startTime: '2024-01-20T10:20:00Z'
    }
  ];

  return NextResponse.json(calls);
}

export async function POST(request: Request) {
  const body = await request.json();
  
  // In a real app, you'd save to database and handle WebRTC signaling
  const newCall = {
    id: `call-${Date.now()}`,
    ...body,
    startTime: new Date().toISOString(),
    status: 'incoming'
  };

  return NextResponse.json(newCall);
}
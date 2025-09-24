import { NextResponse } from 'next/server';

export async function GET() {
  const agents = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john@hospital.com',
      tenantId: '1',
      teamId: '1',
      status: 'available',
      onCall: false,
      activeChats: 3,
      totalCalls: 12
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      email: 'sarah@hospital.com',
      tenantId: '1',
      teamId: '1',
      status: 'busy',
      onCall: true,
      activeChats: 2,
      totalCalls: 8
    },
    {
      id: '3',
      name: 'Michael Brown',
      email: 'michael@bank.com',
      tenantId: '2',
      teamId: '4',
      status: 'away',
      onCall: false,
      activeChats: 0,
      totalCalls: 5
    }
  ];

  return NextResponse.json(agents);
}
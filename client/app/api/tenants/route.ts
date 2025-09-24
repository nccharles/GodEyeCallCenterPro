import { NextResponse } from 'next/server';

export async function GET() {
  const tenants = [
    {
      id: '1',
      name: 'Metro Hospital',
      type: 'hospital',
      teams: [
        { id: '1', name: 'Emergency', tenantId: '1' },
        { id: '2', name: 'Pharmacy', tenantId: '1' },
        { id: '3', name: 'Billing', tenantId: '1' }
      ]
    },
    {
      id: '2',
      name: 'First National Bank',
      type: 'bank',
      teams: [
        { id: '4', name: 'Account Services', tenantId: '2' },
        { id: '5', name: 'Loan Department', tenantId: '2' },
        { id: '6', name: 'Fraud Department', tenantId: '2' }
      ]
    }
  ];

  return NextResponse.json(tenants);
}
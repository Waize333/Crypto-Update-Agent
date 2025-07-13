import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const response = await fetch('https://automationist1.app.n8n.cloud/webhook/3a701ca8-d330-4ceb-80fa-4a535f1c9411', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trigger: true }),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook failed with status ${response.status}`);
    }

    return NextResponse.json({ success: true, message: 'n8n workflow triggered' });
  } catch (error) {
    console.error('Error triggering webhook:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
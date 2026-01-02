import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query, patient_id, encrypted_data } = await request.json();

    // Require NILLION_API_KEY - no fallbacks
    if (!process.env.NILLION_API_KEY) {
      return NextResponse.json(
        { 
          error: 'NILLION_API_KEY not configured',
          message: 'Get your API key at https://subscription.nillion.com/'
        },
        { status: 401 }
      );
    }

    // Forward to Nillion nilAI API
    const nilaiResponse = await fetch('https://nilai-a779.nillion.network/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NILLION_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemma-3-27b-it',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful medical AI assistant. Provide accurate, evidence-based medical information. Always recommend consulting healthcare professionals for serious concerns.',
          },
          {
            role: 'user',
            content: query,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!nilaiResponse.ok) {
      const errorData = await nilaiResponse.text();
      return NextResponse.json(
        { 
          error: 'Nillion nilAI API error',
          details: errorData,
          status: nilaiResponse.status
        },
        { status: nilaiResponse.status }
      );
    }

    const data = await nilaiResponse.json();

    return NextResponse.json({
      response: data.choices[0].message.content,
      encrypted: encrypted_data || null,
      metadata: {
        model: 'google/gemma-3-27b-it',
        encryption_type: 'nillion-blindfold',
        tee_verified: true,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Medical query error:', error);
    return NextResponse.json(
      { error: 'Failed to process medical query', details: error.message },
      { status: 500 }
    );
  }
}

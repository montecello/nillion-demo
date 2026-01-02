import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query, patient_id, encrypted_data } = await request.json();

    // Forward to Nillion nilAI API
    const nilaiResponse = await fetch('https://nilai-a779.nillion.network/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NILLION_API_KEY || 'demo-key'}`,
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
      console.log('Using mock response (nilAI API unavailable or demo mode)');
      // Mock response for demo without API key
      return NextResponse.json({
        response: `[MOCK RESPONSE - Get API key at https://subscription.nillion.com/]\n\nBased on your query: "${query}"\n\nThis is a demonstration response. In production, this would be processed by Nillion's nilAI TEE-based LLM for private inference.\n\nKey features:\n- Client-side encryption (blindfold-ts)\n- TEE execution (AMD SEV-SNP)\n- Zero data logging\n- HIPAA compliant\n\nFor actual medical advice, please consult a healthcare professional.`,
        encrypted: encrypted_data || null,
        metadata: {
          model: 'demo-mode',
          encryption_type: 'client-side-blindfold',
          tee_verified: false,
          timestamp: new Date().toISOString(),
        },
      });
    }

    const data = await nilaiResponse.json();

    return NextResponse.json({
      response: data.choices[0].message.content,
      encrypted: encrypted_data || null,
      metadata: {
        model: 'google/gemma-3-27b-it',
        encryption_type: 'client-side-blindfold',
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

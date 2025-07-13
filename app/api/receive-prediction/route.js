import { NextResponse } from 'next/server';

// In-memory prediction store (replace with DB in production)
let predictions = [];

export async function POST(request) {
  try {
    const body = await request.json();

    // Destructure & validate required fields
    const {
      prediction_id,
      timestamp,
      sentiment,
      confidence,
      reasoning,
      recommendation
    } = body;

    const errors = [];

    if (!prediction_id || typeof prediction_id !== 'string') errors.push('prediction_id');
    if (!timestamp || isNaN(Date.parse(timestamp))) errors.push('timestamp');
    if (!sentiment || !["Positive", "Neutral", "Negative"].includes(sentiment)) errors.push('sentiment');
    if (typeof confidence !== 'number' || confidence < 0 || confidence > 1) errors.push('confidence');
    if (!reasoning || typeof reasoning !== 'string') errors.push('reasoning');
    if (!["Trade", "Caution", "Wait"].includes(recommendation)) errors.push('recommendation');

    if (errors.length > 0) {
      return NextResponse.json(
        { error: `Missing or invalid field(s): ${errors.join(', ')}` },
        { status: 400 }
      );
    }

    // Normalize sentiment for UI rendering
    const sentimentMap = {
      Positive: 'bullish',
      Neutral: 'neutral',
      Negative: 'bearish'
    };

    const prediction = {
      prediction_id,
      timestamp,
      sentiment: sentimentMap[sentiment], // UI-friendly format
      confidence: Math.round(confidence * 100), // Convert to percentage
      reasoning,
      recommendation
    };

    // Store in memory (replace with DB in production)
    predictions.unshift(prediction);
    if (predictions.length > 100) predictions = predictions.slice(0, 100);

    return NextResponse.json({
      success: true,
      message: 'Prediction received and processed',
      data: {
        prediction_id,
        timestamp,
        total_predictions: predictions.length
      }
    });

  } catch (error) {
    console.error('❌ JSON parse/server error:', error);
    return NextResponse.json(
      { error: 'Invalid JSON format or server error' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    return NextResponse.json({
      success: true,
      predictions: predictions.slice(0, limit),
      total: predictions.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}

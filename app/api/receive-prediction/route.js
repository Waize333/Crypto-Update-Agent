import { NextResponse } from 'next/server';

// In-memory storage for demo (use database in production)
let predictions = [];

export async function POST(request) {
  try {
    const prediction = await request.json();
    
    // Validate the prediction structure
    const requiredFields = ['prediction_id', 'timestamp', 'sentiment', 'confidence', 'reasoning', 'recommendation'];
    const missingFields = requiredFields.filter(field => !prediction[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing fields:', missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` }, 
        { status: 400 }
      );
    }
    
    // Validate sentiment values
    const validSentiments = ['bullish', 'bearish', 'neutral'];
    if (!validSentiments.includes(prediction.sentiment)) {
      return NextResponse.json(
        { error: 'Invalid sentiment. Must be: bullish, bearish, or neutral' }, 
        { status: 400 }
      );
    }
    
    // Validate confidence range
    if (prediction.confidence < 0 || prediction.confidence > 100) {
      return NextResponse.json(
        { error: 'Confidence must be between 0 and 100' }, 
        { status: 400 }
      );
    }
    
    // Add timestamp if not provided
    if (!prediction.timestamp) {
      prediction.timestamp = new Date().toISOString();
    }
    
    // Store prediction (in production, save to database)
    predictions.unshift(prediction);
    
    // Keep only last 100 predictions in memory
    if (predictions.length > 100) {
      predictions = predictions.slice(0, 100);
    }
    
    console.log('✅ New prediction received:', {
      id: prediction.prediction_id,
      sentiment: prediction.sentiment,
      confidence: prediction.confidence,
      timestamp: prediction.timestamp
    });
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Prediction received and processed',
      data: {
        prediction_id: prediction.prediction_id,
        timestamp: prediction.timestamp,
        total_predictions: predictions.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error processing prediction:', error);
    return NextResponse.json(
      { error: 'Invalid JSON format or server error' }, 
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve predictions (optional)
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
    console.error('❌ Error retrieving predictions:', error);
    return NextResponse.json(
      { error: 'Server error' }, 
      { status: 500 }
    );
  }
}

// CORS headers for cross-origin requests
export async function OPTIONS(request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
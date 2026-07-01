import { NextRequest, NextResponse } from 'next/server';
import { processUSSDRequest } from '@/app/lib/data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, phoneNumber, text } = body;

    if (!sessionId || !phoneNumber) {
      return NextResponse.json(
        { error: 'Missing required parameters "sessionId" and "phoneNumber"' },
        { status: 400 }
      );
    }

    const responseText = processUSSDRequest(sessionId, phoneNumber, text || '');
    
    // USSD returns content-type text/plain with CON or END prefix usually
    // We will return it as a JSON payload for easy frontend integration,
    // plus also a raw string option or text/plain depending on header.
    const acceptHeader = request.headers.get('accept') || '';
    if (acceptHeader.includes('text/plain')) {
      return new Response(responseText, {
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    return NextResponse.json({
      response: responseText,
      isEnd: responseText.startsWith('END')
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const phoneNumber = searchParams.get('phoneNumber');
    const text = searchParams.get('text') || '';

    if (!sessionId || !phoneNumber) {
      return NextResponse.json(
        { error: 'Missing required parameters "sessionId" and "phoneNumber"' },
        { status: 400 }
      );
    }

    const responseText = processUSSDRequest(sessionId, phoneNumber, text);

    return NextResponse.json({
      response: responseText,
      isEnd: responseText.startsWith('END')
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

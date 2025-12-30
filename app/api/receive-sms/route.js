import { NextResponse } from 'next/server';
export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    const userAgent = request.headers.get('user-agent') || '';
    const xVonageSignature = request.headers.get('x-vonage-signature') || '';
    const xVonageTimestamp = request.headers.get('x-vonage-timestamp') || '';
    const method = request.method;
    const url = request.url;
    let body;
    let rawBody;
    rawBody = await request.text();
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const params = new URLSearchParams(rawBody);
      body = {
        text: params.get('text') || params.get('message') || params.get('body'),
        msisdn: params.get('msisdn') || params.get('from') || params.get('sender'),
        to: params.get('to') || params.get('recipient'),
        messageId: params.get('messageId') || params.get('message-id') || params.get('id'),
        'message-timestamp': params.get('message-timestamp') || params.get('timestamp') || params.get('date'),
        from: params.get('from'),
        keyword: params.get('keyword'),
        'message-id': params.get('message-id'),
        timestamp: params.get('timestamp'),
        type: params.get('type'),
        concat: params.get('concat'),
        'concat-ref': params.get('concat-ref'),
        'concat-total': params.get('concat-total'),
        'concat-part': params.get('concat-part'),
        data: params.get('data'),
        udh: params.get('udh'),
        network_code: params.get('network-code'),
        price: params.get('price'),
        currency: params.get('currency')
      };
    } else if (contentType.includes('application/json')) {
      try {
        body = JSON.parse(rawBody);
      } catch {
        body = {};
      }
    } else {
      try {
        body = JSON.parse(rawBody);
      } catch {
        const params = new URLSearchParams(rawBody);
        body = {
          text: params.get('text') || params.get('message') || params.get('body'),
          msisdn: params.get('msisdn') || params.get('from') || params.get('sender'),
          to: params.get('to') || params.get('recipient'),
          messageId: params.get('messageId') || params.get('message-id') || params.get('id'),
          'message-timestamp': params.get('message-timestamp') || params.get('timestamp') || params.get('date'),
          from: params.get('from'),
          keyword: params.get('keyword'),
          'message-id': params.get('message-id'),
          timestamp: params.get('timestamp'),
          type: params.get('type'),
          concat: params.get('concat'),
          'concat-ref': params.get('concat-ref'),
          'concat-total': params.get('concat-total'),
          'concat-part': params.get('concat-part'),
          data: params.get('data'),
          udh: params.get('udh'),
          network_code: params.get('network-code'),
          price: params.get('price'),
          currency: params.get('currency')
        };
      }
    }
    const text = body.text || body.message || body.body || '';
    const msisdn = body.msisdn || body.from || body.sender || '';
    const debugInfo = {
      method,
      url,
      contentType,
      userAgent,
      vonageSignature: xVonageSignature ? 'present' : 'missing',
      vonageTimestamp: xVonageTimestamp,
      bodyKeys: Object.keys(body),
      receivedData: body,
      rawBody: rawBody?.substring(0, 1000),
      extractedText: text,
      extractedMsisdn: msisdn
    };
    if (!text || !msisdn) {
      const errorResponse = NextResponse.json({
        error: 'Missing text or msisdn',
        debug: debugInfo
      }, { status: 400 });
      errorResponse.headers.set('Access-Control-Allow-Origin', '*');
      errorResponse.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
      errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type');
      return errorResponse;
    }
    try {
      // Disabled: Appwrite integration removed
      const newMessage = { id: 'disabled' };
      // const { createSMSMessage } = await import('../../../lib/appwrite/queries/sms-messages.ts');
      // const newMessage = await createSMSMessage({
      //   originalText: text,
      //   correctedText: text,
      //   phoneNumber: msisdn
      // });
      const response = NextResponse.json({ 
        message: 'SMS received and processed',
        correctedText: text,
        messageId: newMessage.id,
        vonageMessageId: body.messageId || body['message-id'],
        method: method,
        format: contentType.includes('application/x-www-form-urlencoded') ? 'form' : 'json',
        debug: debugInfo
      }, { status: 200 });
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      return response;
    } catch (dbError) {
      return NextResponse.json({
        error: 'Database error',
        details: dbError.message,
        type: 'database',
        debug: debugInfo
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({
      error: 'Request processing error',
      details: error.message,
      type: 'processing'
    }, { status: 500 });
  }
}
export async function GET() {
  const response = NextResponse.json({ 
    message: 'Vonage SMS webhook endpoint',
    status: 'active',
    timestamp: new Date().toISOString(),
    supportedMethods: ['POST'],
    supportedFormats: ['application/x-www-form-urlencoded', 'application/json', 'text/plain']
  });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}
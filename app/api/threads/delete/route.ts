import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, dataType, itemId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!dataType) {
      return NextResponse.json(
        { error: 'Data type is required (e.g., "posts", "comments", "profile")' },
        { status: 400 }
      );
    }

    if (dataType === 'posts' || dataType === 'comments' || dataType === 'profile') {
      return NextResponse.json({
        success: false,
        error: 'Threads API does not support deleting posts, comments, or profiles through this integration. Data can only be deleted directly on the Threads platform.',
        message: 'This endpoint is for logging purposes only. Actual deletion must be done on threads.net',
        userId,
        dataType,
        itemId: itemId || null,
        timestamp: new Date().toISOString()
      }, { status: 501 });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid data type. Only "posts", "comments", or "profile" are supported.',
      userId,
      dataType,
      itemId: itemId || null,
      timestamp: new Date().toISOString()
    }, { status: 400 });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, dataType, itemId, reason } = body;

    if (!userId || !dataType) {
      return NextResponse.json(
        { error: 'User ID and data type are required' },
        { status: 400 }
      );
    }

    if (dataType === 'posts' || dataType === 'comments' || dataType === 'profile') {
      return NextResponse.json({
        success: false,
        error: 'Threads API does not support soft deleting posts, comments, or profiles through this integration. Data can only be deleted directly on the Threads platform.',
        message: 'This endpoint is for logging purposes only. Actual deletion must be done on threads.net',
        userId,
        dataType,
        itemId: itemId || null,
        reason: reason || null,
        timestamp: new Date().toISOString()
      }, { status: 501 });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid data type. Only "posts", "comments", or "profile" are supported.',
      userId,
      dataType,
      itemId: itemId || null,
      reason: reason || null,
      timestamp: new Date().toISOString()
    }, { status: 400 });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

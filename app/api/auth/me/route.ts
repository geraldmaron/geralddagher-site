import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth/server-utils';

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();

    if (!user) {
      return NextResponse.json({
        user: null
      }, { status: 401 });
    }

    return NextResponse.json({
      user
    });

  } catch (error) {
    return NextResponse.json(
      {
        user: null,
        error: 'Authentication failed'
      },
      { status: 401 }
    );
  }
}

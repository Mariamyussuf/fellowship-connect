import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/server/auth.service';
import { RefreshSessionSchema } from '@/lib/validation';

const authService = new AuthService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = RefreshSessionSchema.parse(body);

    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({
        success: false,
        error: 'No active session'
      }, { status: 400 });
    }

    const result = await authService.refreshSession(
      sessionCookie,
      validatedData.idToken,
      validatedData.rememberMe ?? false
    );
    
    if (result.success) {
      // Set new session cookie
      const response = NextResponse.json({
        success: true,
        message: result.message
      }, { status: 200 });
      
      if (result.sessionCookie) {
        const maxAge = validatedData.rememberMe ? 60 * 60 * 24 * 14 : 60 * 60 * 24;
        response.cookies.set('session', result.sessionCookie, {
          maxAge,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
        });
      }
      
      return response;
    } else {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('Session refresh API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
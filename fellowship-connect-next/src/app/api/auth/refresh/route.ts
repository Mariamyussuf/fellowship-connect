import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/server/auth.service';

const authService = new AuthService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken } = body;
    
    if (!idToken) {
      return NextResponse.json({
        success: false,
        error: 'ID token is required'
      }, { status: 400 });
    }
    
    // Get session ID from cookie
    const sessionId = request.cookies.get('session')?.value;
    
    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'No active session'
      }, { status: 400 });
    }
    
    const result = await authService.refreshSession(sessionId);
    
    if (result.success) {
      // Set new session cookie
      const response = NextResponse.json({
        success: true,
        message: result.message
      }, { status: 200 });
      
      if (result.sessionCookie) {
        response.cookies.set('session', result.sessionCookie, {
          maxAge: 60 * 60 * 24 * 7, // 7 days
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
  } catch (error: any) {
    console.error('Session refresh API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
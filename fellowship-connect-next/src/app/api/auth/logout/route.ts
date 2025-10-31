import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/server/auth.service';

const authService = new AuthService();

export async function POST(request: NextRequest) {
  try {
    // Get session ID from cookie
    const sessionCookie = request.cookies.get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({
        success: false,
        error: 'No active session'
      }, { status: 400 });
    }
     
    const result = await authService.logout(sessionCookie);
    
    if (result.success) {
      // Clear session cookie
      const response = NextResponse.json({
        success: true,
        message: result.message
      }, { status: 200 });
      
      response.cookies.set('session', '', {
        maxAge: 0,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      });
      
      return response;
    } else {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('Logout API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
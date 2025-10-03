import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/server/auth.service';
import { withAuth } from '@/middleware/auth';

const authService = new AuthService();

export async function POST(request: NextRequest) {
  try {
    // Get session ID from cookie
    const sessionId = request.cookies.get('session')?.value;
    
    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'No active session'
      }, { status: 400 });
    }
    
    const result = await authService.logout(sessionId);
    
    if (result.success) {
      // Clear session cookie
      const response = NextResponse.json({
        success: true,
        message: result.message
      }, { status: 200 });
      
      response.cookies.delete('session');
      
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
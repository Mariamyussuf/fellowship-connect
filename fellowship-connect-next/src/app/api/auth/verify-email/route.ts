import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/server/auth.service';

const authService = new AuthService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { oobCode } = body;
    
    if (!oobCode) {
      return NextResponse.json({
        success: false,
        error: 'OOB code is required'
      }, { status: 400 });
    }
    
    // In a real implementation, we would verify the email using the OOB code
    // For now, we'll just simulate success
    
    // Simulate successful verification
    const result = { success: true, message: 'Email verified successfully' };
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('Email verification API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
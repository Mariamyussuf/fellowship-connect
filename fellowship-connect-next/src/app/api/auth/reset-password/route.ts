import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/server/auth.service';
import { ResetPasswordSchema } from '@/lib/validation';

const authService = new AuthService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = ResetPasswordSchema.parse(body);
    
    const result = await authService.resetPassword(validatedData.email);
    
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
  } catch (error: any) {
    console.error('Password reset API error:', error);
    
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
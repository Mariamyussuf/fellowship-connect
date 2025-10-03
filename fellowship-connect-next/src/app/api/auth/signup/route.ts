import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/server/auth.service';
import { SignupSchema } from '@/lib/validation';
import { withOptionalAuth } from '@/middleware/auth';
import { withSignupRateLimit } from '@/middleware/rate-limit';

const authService = new AuthService();

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await withSignupRateLimit(request);
    if (rateLimitResult.response) {
      return rateLimitResult.response;
    }
    
    const body = await request.json();
    
    // Validate input
    const validatedData = SignupSchema.parse(body);
    
    const result = await authService.signup(
      validatedData.email,
      validatedData.password,
      validatedData.displayName
    );
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        userId: result.userId
      }, { 
        status: 201,
        headers: rateLimitResult.headers || {}
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { 
        status: 400,
        headers: rateLimitResult.headers || {}
      });
    }
  } catch (error: unknown) {
    console.error('Signup API error:', error);
    
    // Handle Zod validation errors
    if (typeof error === 'object' && error !== null && (error as { name?: string }).name === 'ZodError') {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: (error as { errors?: unknown }).errors
      }, { status: 400 });
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
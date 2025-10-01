import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/server/auth.service';
import { LoginSchema } from '@/lib/validation';
import { withAuthRateLimit } from '@/middleware/rate-limit';
import { withSecurity } from '@/middleware/security';
import { withErrorHandling } from '@/middleware/error-handler';

const authService = new AuthService();

// Get allowed origins from environment variables
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];

async function handler(request: NextRequest) {
  // Apply security headers and CORS
  const securityHeaders = withSecurity(allowedOrigins)(request);
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: securityHeaders
    });
  }
  
  // Apply rate limiting
  const rateLimitResult = await withAuthRateLimit(request);
  if (rateLimitResult.response) {
    // Merge security headers with rate limit response
    const rateLimitResponse = rateLimitResult.response;
    Object.entries(securityHeaders).forEach(([key, value]) => {
      rateLimitResponse.headers.set(key, value);
    });
    return rateLimitResponse;
  }
  
  const body = await request.json();
  
  // Validate input
  const validatedData = LoginSchema.parse(body);
  
  const result = await authService.login(
    validatedData.email,
    validatedData.password
  );
  
  if (result.success) {
    // Set session cookie
    const response = NextResponse.json({
      success: true,
      message: result.message
    }, { 
      status: 200
    });
    
    // Add security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    // Add rate limit headers if available
    if (rateLimitResult.headers) {
      Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    }
    
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
    const response = NextResponse.json({
      success: false,
      error: result.message
    }, { 
      status: 401
    });
    
    // Add security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    // Add rate limit headers if available
    if (rateLimitResult.headers) {
      Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    }
    
    return response;
  }
}

export const POST = withErrorHandling(handler);
export const runtime = 'nodejs';
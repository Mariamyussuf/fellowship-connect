import { NextRequest, NextResponse } from 'next/server';
import { AttendanceService } from '@/services/server/attendance.service';
import { CheckInSchema } from '@/lib/validation';
import { withApiWriteRateLimit } from '@/middleware/rate-limit';
import { withSecurity } from '@/middleware/security';
import { withErrorHandling } from '@/middleware/error-handler';

const attendanceService = new AttendanceService();

// Get allowed origins from environment variables
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];

// Get client IP from request
function getClientIP(request: NextRequest): string {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return 'unknown';
}

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
  const rateLimitResult = await withApiWriteRateLimit(request);
  if (rateLimitResult.response) {
    // Merge security headers with rate limit response
    const rateLimitResponse = rateLimitResult.response;
    Object.entries(securityHeaders).forEach(([key, value]) => {
      rateLimitResponse.headers.set(key, value);
    });
    return rateLimitResponse;
  }
  
  // Authenticate user
  const user = request.user;

  if (!user) {
    const response = NextResponse.json({
      success: false,
      error: 'Authentication required'
    }, { status: 401 });
    
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
  
  const body = await request.json();
  
  // Validate input
  const validatedData = CheckInSchema.parse(body);
  
  const userId = user.uid;
  const ipAddress = getClientIP(request);
  
  const result = await attendanceService.checkIn(
    userId,
    validatedData.sessionId,
    validatedData.method,
    ipAddress
  );
  
  if (result.success) {
    const response = NextResponse.json({
      success: true,
      message: 'Check-in successful',
      attendanceId: result.attendanceId
    }, { status: 201 });
    
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
  } else {
    const response = NextResponse.json({
      success: false,
      error: result.message
    }, { status: 400 });
    
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
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors';

/**
 * Error handler middleware for Next.js API routes
 */

/**
 * Global error handler middleware
 * @param error Error object
 * @param request NextRequest
 * @returns NextResponse with error details
 */
export function errorHandler(error: any, request: NextRequest) {
  // Log error for monitoring
  console.error('API Error:', {
    error: error.message,
    stack: error.stack,
    url: request.url,
    method: request.method,
    timestamp: new Date().toISOString()
  });
  
  // Handle the error and get response details
  const errorResponse = handleApiError(error);
  
  // Create response with appropriate headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  // Add rate limit headers if it's a rate limit error
  if (errorResponse.error.code === 'RATE_LIMIT_ERROR' && (error as any).retryAfter) {
    headers['Retry-After'] = (error as any).retryAfter.toString();
  }
  
  return NextResponse.json(
    {
      success: false,
      error: errorResponse.error
    },
    {
      status: errorResponse.status,
      headers
    }
  );
}

/**
 * Wrapper function for API route handlers to catch and handle errors
 * @param handler API route handler function
 * @returns Wrapped handler with error handling
 */
export function withErrorHandling(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async function wrappedHandler(request: NextRequest) {
    try {
      return await handler(request);
    } catch (error: any) {
      return errorHandler(error, request);
    }
  };
}
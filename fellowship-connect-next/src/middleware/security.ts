import { NextRequest, NextResponse } from 'next/server';

/**
 * Security middleware for Next.js API routes
 * Adds security headers and handles CORS
 */

/**
 * Security headers middleware
 * @returns Middleware function that adds security headers
 */
export function withSecurityHeaders() {
  return function securityHeadersMiddleware(request: NextRequest) {
    const headers = {
      // Content Security Policy
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';",
      
      // Prevent browsers from MIME-sniffing
      'X-Content-Type-Options': 'nosniff',
      
      // Prevent clickjacking
      'X-Frame-Options': 'DENY',
      
      // XSS protection
      'X-XSS-Protection': '1; mode=block',
      
      // Strict Transport Security
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      
      // Referrer Policy
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      
      // Permissions Policy
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    };

    return headers;
  };
}

/**
 * CORS middleware
 * @param allowedOrigins Array of allowed origins
 * @returns Middleware function that handles CORS
 */
export function withCORS(allowedOrigins: string[] = []) {
  return function corsMiddleware(request: NextRequest) {
    const origin = request.headers.get('origin');
    const isAllowedOrigin = !allowedOrigins.length || allowedOrigins.includes(origin || '');
    
    const headers: Record<string, string> = {};
    
    if (isAllowedOrigin && origin) {
      headers['Access-Control-Allow-Origin'] = origin;
    }
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
      headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With';
      headers['Access-Control-Allow-Credentials'] = 'true';
      headers['Access-Control-Max-Age'] = '86400'; // 24 hours
    } else {
      // Regular requests
      headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE';
      headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With';
      headers['Access-Control-Allow-Credentials'] = 'true';
    }
    
    return headers;
  };
}

/**
 * Combined security middleware
 * @param allowedOrigins Array of allowed origins for CORS
 * @returns Middleware function that applies both security headers and CORS
 */
export function withSecurity(allowedOrigins: string[] = []) {
  const securityHeaders = withSecurityHeaders();
  const cors = withCORS(allowedOrigins);
  
  return function securityMiddleware(request: NextRequest) {
    const securityHeadersResult = securityHeaders(request);
    const corsResult = cors(request);
    
    return {
      ...securityHeadersResult,
      ...corsResult
    };
  };
}
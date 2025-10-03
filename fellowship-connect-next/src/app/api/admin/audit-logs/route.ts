import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '@/services/server/admin.service';

// Define the authenticated request type for App Router
interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email?: string;
    role?: string;
    uid: string;
  };
}

const adminService = new AdminService();

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

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authReq = request as AuthenticatedRequest;
    
    if (!authReq.user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }
    
    // Check if user has admin role (audit logs should only be accessible by super-admin)
    const userRole = authReq.user.role || 'member';
    const allowedRoles = ['super-admin'];
    const hasRole = allowedRoles.includes(userRole);
    
    if (!hasRole) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient permissions - only super-admins can access audit logs'
      }, { status: 403 });
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const filters: { action?: string; userId?: string } = {};
    
    if (searchParams.get('action')) {
      filters.action = searchParams.get('action') || undefined;
    }
    
    if (searchParams.get('userId')) {
      filters.userId = searchParams.get('userId') || undefined;
    }
    
    // Get pagination parameters
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') || '10') : 10;
    
    const userId = authReq.user.uid;
    const ipAddress = getClientIP(request);
    
    const result = await adminService.getAuditLogs(filters, { limit }, userId, ipAddress);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        logs: result.logs,
        lastDoc: result.lastDoc
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('Get audit logs API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
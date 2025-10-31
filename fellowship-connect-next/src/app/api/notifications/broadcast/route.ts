import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { requireRole } from '@/middleware/rbac';
import { SendNotificationSchema } from '@/lib/validation';
import { AuthenticatedUser } from '@/lib/authMiddleware';

// Define the authenticated request type for App Router
interface AuthenticatedRequest extends NextRequest {
  user?: AuthenticatedUser;
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authReq = request as AuthenticatedRequest;
    
    if (!authReq.user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }
    
    // Check if user has admin role
    const userRole = authReq.user.role || 'member';
    const allowedRoles = ['admin', 'super-admin'];
    const hasRole = allowedRoles.includes(userRole);
    
    if (!hasRole) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient permissions'
      }, { status: 403 });
    }
    
    const body = await request.json();
    
    // Validate input
    const validatedData = SendNotificationSchema.parse(body);
    
    // For now, we'll just simulate broadcasting a notification
    console.log('Broadcasting notification:', validatedData);
    
    // In a real implementation, you would get all users and send to them
    
    return NextResponse.json({
      success: true,
      message: 'Notification broadcast successfully'
    }, { status: 200 });
  } catch (error: unknown) {
    console.error('Broadcast notification API error:', error);
    
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
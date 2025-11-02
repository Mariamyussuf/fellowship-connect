import { NextRequest, NextResponse } from 'next/server';
import { PrayerService } from '@/services/server/prayer.service';
import { AuthenticatedUser, UserRole } from '@/lib/authMiddleware';

interface AuthenticatedRequest extends NextRequest {
  user?: AuthenticatedUser;
}

const prayerService = new PrayerService();
const ADMIN_ROLES = new Set<UserRole>(['admin', 'super-admin']);

type RouteParams = {
  params: {
    id: string;
  };
};

export async function DELETE(
  request: AuthenticatedRequest,
  { params }: RouteParams
) {
  const { id } = params;
  try {
    const user = request.user;
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }
    
    // Check if user has admin role
    const userRole = user.role || 'member';
    const hasRole = ADMIN_ROLES.has(userRole);
    
    if (!hasRole) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient permissions'
      }, { status: 403 });
    }
    
    // Note: The correct method for deleting welfare support requests should be implemented in the service
    // For now, we'll use a placeholder that will need to be updated when the service method is available
    const result = await prayerService.deleteWelfareSupportRequest(id);
    
    console.log('Deleted welfare support request', { 
      requestId: id, 
      deletedBy: user.uid 
    });
    
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
    console.error('Delete welfare support request API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
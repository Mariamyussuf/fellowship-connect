import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { requireRole } from '@/middleware/rbac';
import { PrayerService } from '@/services/server/prayer.service';
import { UpdateWelfareStatusSchema } from '@/lib/validation';

// Define the authenticated request type for App Router
interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

const prayerService = new PrayerService();

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    // Get the params from the context
    const params = await context.params;
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
    const validatedData = UpdateWelfareStatusSchema.parse(body);
    
    const result = await prayerService.updateWelfareStatus(
      params.id, 
      validatedData.status,
      validatedData.notes
    );
    
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
    console.error('Update welfare support request status API error:', error);
    
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
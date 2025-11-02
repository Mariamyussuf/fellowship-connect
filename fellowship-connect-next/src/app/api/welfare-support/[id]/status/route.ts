import { NextRequest, NextResponse } from 'next/server';
import { PrayerService } from '@/services/server/prayer.service';
import { UpdateWelfareStatusSchema } from '@/lib/validation';

const prayerService = new PrayerService();
const ADMIN_ROLES = new Set(['admin', 'super-admin']);

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    
    const body = await request.json();
    
    // Validate input
    const validatedData = UpdateWelfareStatusSchema.parse(body);
    
    const result = await prayerService.updateWelfareStatus(
      params.id, 
      validatedData.status,
      validatedData.notes
    );
    
    console.log('Updated welfare support status', { 
      requestId: params.id, 
      status: validatedData.status,
      updatedBy: user.uid 
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
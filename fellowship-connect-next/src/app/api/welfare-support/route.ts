import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { PrayerService } from '@/services/server/prayer.service';
import { SubmitWelfareSupportSchema } from '@/lib/validation';

const prayerService = new PrayerService();

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authReq = request as any;
    
    if (!authReq.user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Validate input
    const validatedData = SubmitWelfareSupportSchema.parse(body);
    
    const result = await prayerService.submitWelfareSupport(
      authReq.user.id,
      {
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        urgency: validatedData.urgency,
        isAnonymous: validatedData.isAnonymous
      }
    );
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Welfare support request submitted successfully',
        requestId: result.requestId
      }, { status: 201 });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Submit welfare support request API error:', error);
    
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authReq = request as any;
    
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
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const filters: any = {};
    
    if (searchParams.get('status')) {
      filters.status = searchParams.get('status');
    }
    
    // Convert pagination to limit/lastDoc
    let limit = 10;
    if (searchParams.get('limit')) {
      limit = parseInt(searchParams.get('limit') || '10');
    }
    
    const result = await prayerService.getWelfareRequests(
      filters,
      { limit }
    );
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        welfareSupportRequests: result.requests
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('List welfare support requests API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
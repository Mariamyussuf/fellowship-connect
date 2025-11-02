import { NextRequest, NextResponse } from 'next/server';
import { PrayerService } from '@/services/server/prayer.service';
import { SubmitWelfareSupportSchema } from '@/lib/validation';

const prayerService = new PrayerService();

export async function POST(request: NextRequest) {
  try {
    const user = request.user;
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Validate input
    const validatedData = SubmitWelfareSupportSchema.parse(body);
    
    const result = await prayerService.submitWelfareSupport(
      user.uid,
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
  } catch (error: unknown) {
    console.error('Submit welfare support request API error:', error);
    
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

export async function GET(request: NextRequest) {
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
    const filters: Record<string, unknown> = {};
    
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
  } catch (error: unknown) {
    console.error('List welfare support requests API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
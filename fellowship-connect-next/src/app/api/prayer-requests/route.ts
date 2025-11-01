import { NextRequest, NextResponse } from 'next/server';
import { PrayerService } from '@/services/server/prayer.service';
import { SubmitPrayerRequestSchema } from '@/lib/validation';

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
    const validatedData = SubmitPrayerRequestSchema.parse(body);
    
    console.log('Submitting prayer request', { userId: user.uid });
    const result = await prayerService.submitPrayerRequest(
      user.uid,
      {
        title: validatedData.title,
        description: validatedData.description,
        isPublic: validatedData.isPublic
      },
      validatedData.isAnonymous
    );
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Prayer request submitted successfully',
        requestId: result.requestId
      }, { status: 201 });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('Submit prayer request API error:', error);
    
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
    
    const result = await prayerService.getPrayerRequests(
      filters,
      { limit }
    );
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        prayerRequests: result.requests
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('List prayer requests API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
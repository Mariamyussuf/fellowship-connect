import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/services/server/notification.service';
import { UpdateNotificationPreferencesSchema } from '@/lib/validation';

const notificationService = new NotificationService();

export async function GET(request: NextRequest) {
  try {
    const user = request.user;

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }
    
    const result = await notificationService.getUserPreferences(user.uid);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        preferences: result.preferences
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('Get notification preferences API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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
    const validatedData = UpdateNotificationPreferencesSchema.parse(body);
    
    const result = await notificationService.updatePreferences(
      user.uid,
      validatedData
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
    console.error('Update notification preferences API error:', error);
    
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
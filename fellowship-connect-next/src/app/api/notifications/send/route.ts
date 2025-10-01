import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { NotificationService } from '@/services/server/notification.service';
import { SendNotificationSchema } from '@/lib/validation';

const notificationService = new NotificationService();

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
    const validatedData = SendNotificationSchema.parse(body);
    
    // For now, we'll just simulate sending a notification
    console.log('Sending notification:', validatedData);
    
    // In a real implementation, you would determine the recipient and send accordingly
    
    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully'
    }, { status: 200 });
  } catch (error: any) {
    console.error('Send notification API error:', error);
    
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

export const runtime = 'nodejs';
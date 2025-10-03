import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { MediaService } from '@/services/server/media.service';

// Define the authenticated request type for App Router
interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

const mediaService = new MediaService();

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
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
    
    const result = await mediaService.getSignedUrl(params.id);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        downloadUrl: result.url
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('Get download URL API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
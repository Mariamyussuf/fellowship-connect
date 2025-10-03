import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { UserService } from '@/services/server/user.service';

// Define the authenticated request type for App Router
interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

const userService = new UserService();

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authReq = request as AuthenticatedRequest;
    
    if (!authReq.user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }
    
    // Get search query parameter
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({
        success: false,
        error: 'Search query is required'
      }, { status: 400 });
    }
    
    const result = await userService.searchUsers(query);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        users: result.users
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('Search users API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
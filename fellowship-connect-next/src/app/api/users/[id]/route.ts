import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { requireRole, requireOwnership } from '@/middleware/rbac';
import { UserService } from '@/services/server/user.service';
import { UpdateProfileSchema } from '@/lib/validation';

const userService = new UserService();

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    // Get the params from the context
    const params = await context.params;
    // Authenticate user
    const authReq = request as any;
    
    if (!authReq.user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }
    
    // Check ownership or admin role
    const userRole = authReq.user.role || 'member';
    const isOwner = authReq.user.id === params.id;
    const isAdmin = ['admin', 'super-admin'].includes(userRole);
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient permissions'
      }, { status: 403 });
    }
    
    const result = await userService.getUser(params.id);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        user: result.user
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Get user profile API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    // Get the params from the context
    const params = await context.params;
    // Authenticate user
    const authReq = request as any;
    
    if (!authReq.user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }
    
    // Check ownership (only owners can update their own profile)
    const isOwner = authReq.user.id === params.id;
    
    if (!isOwner) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient permissions'
      }, { status: 403 });
    }
    
    const body = await request.json();
    
    // Validate input
    const validatedData = UpdateProfileSchema.parse(body);
    
    const result = await userService.updateUser(params.id, validatedData);
    
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
  } catch (error: any) {
    console.error('Update user profile API error:', error);
    
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

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    // Get the params from the context
    const params = await context.params;
    // Authenticate user
    const authReq = request as any;
    
    if (!authReq.user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }
    
    // Only super-admins can delete users
    const userRole = authReq.user.role || 'member';
    const isSuperAdmin = userRole === 'super-admin';
    
    if (!isSuperAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient permissions'
      }, { status: 403 });
    }
    
    const result = await userService.deleteUser(params.id);
    
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
  } catch (error: any) {
    console.error('Delete user API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
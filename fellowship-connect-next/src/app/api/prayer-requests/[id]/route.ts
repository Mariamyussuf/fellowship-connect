import { NextRequest, NextResponse } from 'next/server';
import { PrayerService } from '@/services/server/prayer.service';
import { UpdatePrayerStatusSchema } from '@/lib/validation';

const prayerService = new PrayerService();
const ADMIN_ROLES = new Set(['admin', 'super-admin']);

function authorize(request: NextRequest): { user: NonNullable<NextRequest['user']> } | NextResponse {
  const user = request.user;

  if (!user) {
    return NextResponse.json({
      success: false,
      error: 'Authentication required'
    }, { status: 401 });
  }

  if (!ADMIN_ROLES.has(user.role ?? 'member')) {
    return NextResponse.json({
      success: false,
      error: 'Insufficient permissions'
    }, { status: 403 });
  }

  return { user };
}

function handleError(error: unknown, context: string) {
  console.error(`${context} error:`, error);

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

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const auth = authorize(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  try {
    const body = await request.json();
    const { status } = UpdatePrayerStatusSchema.parse(body);

    console.log('Updating prayer request status', { id, userId: auth.user.uid, status });
    const result = await prayerService.updatePrayerStatus(id, status);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message
    }, { status: 200 });
  } catch (error: unknown) {
    return handleError(error, 'Update prayer request status API');
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const auth = authorize(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  try {
    console.log('Deleting prayer request', { id, userId: auth.user.uid });
    const result = await prayerService.deletePrayerRequest(id);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message
    }, { status: 200 });
  } catch (error: unknown) {
    return handleError(error, 'Delete prayer request API');
  }
}

export const runtime = 'nodejs';
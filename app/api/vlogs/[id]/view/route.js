import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Vlog from '@/models/Vlog';

export async function POST(request, { params }) {
  try {
    await connectDB();

    const vlog = await Vlog.findById(params.id);
    if (!vlog) {
      return NextResponse.json(
        { success: false, error: 'Vlog not found' },
        { status: 404 }
      );
    }

    // Increment view count
    vlog.viewCount += 1;
    await vlog.save();

    return NextResponse.json({
      success: true,
      data: { viewCount: vlog.viewCount },
    });

  } catch (error) {
    console.error('POST /api/vlogs/:id/view error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to increment view' },
      { status: 500 }
    );
  }
}
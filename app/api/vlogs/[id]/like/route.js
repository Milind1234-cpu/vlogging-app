import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Vlog from '@/models/Vlog';
import mongoose from 'mongoose';

export async function POST(request, { params: paramsPromise }) {
  try {
    const params = await paramsPromise;

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: 'Vlog not found' }, { status: 404 });
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Please log in to like vlogs' },
        { status: 401 }
      );
    }

    await connectDB();

    const vlog = await Vlog.findById(params.id);
    if (!vlog) {
      return NextResponse.json(
        { success: false, error: 'Vlog not found' },
        { status: 404 }
      );
    }

    const userId = session.user.id;
    const alreadyLiked = vlog.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      // Unlike — remove user from likes array
      vlog.likes.pull(userId);
      vlog.likeCount = Math.max(0, vlog.likeCount - 1);
    } else {
      // Like — add user to likes array
      vlog.likes.addToSet(userId);
      vlog.likeCount += 1;
    }

    await vlog.save();

    return NextResponse.json({
      success: true,
      data: {
        liked: !alreadyLiked,
        likeCount: vlog.likeCount,
      },
    });

  } catch (error) {
    console.error('POST /api/vlogs/:id/like error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Vlog from '@/models/Vlog';
import mongoose from 'mongoose';

export async function GET(request, { params: paramsPromise }) {
  try {
    const params = await paramsPromise;

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');

    await connectDB();

    const user = await User.findById(params.id)
      .select('-password')
      .lean();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const skip = (page - 1) * limit;

    const [vlogs, totalVlogs] = await Promise.all([
      Vlog.find({ creator: params.id, status: 'published' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('creator', 'name avatar')
        .lean(),
      Vlog.countDocuments({ creator: params.id, status: 'published' }),
    ]);

    // Calculate total views and likes across all vlogs
    const stats = await Vlog.aggregate([
      { $match: { creator: user._id } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$viewCount' },
          totalLikes: { $sum: '$likeCount' },
        },
      },
    ]);

    const totalViews = stats[0]?.totalViews || 0;
    const totalLikes = stats[0]?.totalLikes || 0;
    const totalPages = Math.ceil(totalVlogs / limit);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          ...user,
          totalViews,
          totalLikes,
          totalVlogs,
        },
        vlogs,
        pagination: {
          currentPage: page,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });

  } catch (error) {
    console.error('GET /api/users/:id error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
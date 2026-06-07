import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Vlog from '@/models/Vlog';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const creatorId = session.user.id;

    // Run all queries in parallel for speed
    const [allVlogs, topVlogs, recentVlogs] = await Promise.all([
      // All vlogs for stats calculation
      Vlog.find({ creator: creatorId }).lean(),
      // Top 5 by view count
      Vlog.find({ creator: creatorId })
        .sort({ viewCount: -1 })
        .limit(5)
        .lean(),
      // 5 most recently created
      Vlog.find({ creator: creatorId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    // Calculate stats
    const totalVlogs = allVlogs.length;
    const publishedVlogs = allVlogs.filter((v) => v.status === 'published').length;
    const draftVlogs = allVlogs.filter((v) => v.status === 'draft').length;
    const totalViews = allVlogs.reduce((sum, v) => sum + (v.viewCount || 0), 0);
    const totalLikes = allVlogs.reduce((sum, v) => sum + (v.likeCount || 0), 0);

    // Views this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const viewsThisMonth = allVlogs
      .filter((v) => new Date(v.createdAt) >= startOfMonth)
      .reduce((sum, v) => sum + (v.viewCount || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalVlogs,
          publishedVlogs,
          draftVlogs,
          totalViews,
          totalLikes,
          viewsThisMonth,
        },
        topVlogs,
        recentVlogs,
      },
    });

  } catch (error) {
    console.error('GET /api/dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
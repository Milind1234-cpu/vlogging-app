import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Vlog from '@/models/Vlog';

// GET /api/vlogs — paginated feed
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Read query params with defaults
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12') || 12));
    const sort = searchParams.get('sort') || 'newest';
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    const creator = searchParams.get('creator') || '';

    await connectDB();

    // Build the filter object
    const filter = { status: 'published' };

    // Add category filter if provided
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Add creator filter if provided (for profile page)
    if (creator) {
      filter.creator = creator;
    }

    // Add text search if provided
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort object
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      most_viewed: { viewCount: -1 },
      most_liked: { likeCount: -1 },
    };
    const sortBy = sortOptions[sort] || sortOptions.newest;

    // skip() tells MongoDB how many documents to skip for pagination
    // page 1: skip 0, page 2: skip 12, page 3: skip 24, etc.
    const skip = (page - 1) * limit;

    // Run query and count in parallel for speed
    const [vlogs, totalVlogs] = await Promise.all([
      Vlog.find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        // populate replaces creator ObjectId with actual user data
        // we only fetch name and avatar — not password or other sensitive fields
        .populate('creator', 'name avatar')
        .lean(), // .lean() returns plain JS objects instead of Mongoose docs — faster
      Vlog.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalVlogs / limit);

    return NextResponse.json({
      success: true,
      data: {
        vlogs,
        pagination: {
          currentPage: page,
          totalPages,
          totalVlogs,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });

  } catch (error) {
    console.error('GET /api/vlogs error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vlogs' },
      { status: 500 }
    );
  }
}

// POST /api/vlogs — create a new vlog (auth required)
export async function POST(request) {
  try {
    // Check if user is logged in
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      videoUrl,
      thumbnailUrl,
      cloudinaryPublicId,
      tags,
      category,
      duration,
      status,
    } = body;

    // Validate required fields
    if (!title || !videoUrl || !thumbnailUrl || !cloudinaryPublicId) {
      return NextResponse.json(
        { success: false, error: 'Title, video and thumbnail are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const vlog = await Vlog.create({
      title: title.trim(),
      description: description?.trim() || '',
      videoUrl,
      thumbnailUrl,
      cloudinaryPublicId,
      tags: tags || [],
      category: category || 'other',
      duration: duration || 0,
      status: status || 'published',
      creator: session.user.id, // attach logged in user as creator
    });

    // Populate creator info before returning
    await vlog.populate('creator', 'name avatar');

    return NextResponse.json(
      { success: true, data: { vlog } },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST /api/vlogs error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return NextResponse.json(
        { success: false, error: messages[0] },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create vlog' },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Vlog from '@/models/Vlog';
import cloudinary from '@/lib/cloudinary';

// GET /api/vlogs/:id — fetch single vlog
export async function GET(request, { params: paramsPromise }) {
  try {
    const params = await paramsPromise;
    await connectDB();

    const vlog = await Vlog.findById(params.id)
      .populate('creator', 'name avatar bio')
      .lean();

    if (!vlog) {
      return NextResponse.json(
        { success: false, error: 'Vlog not found' },
        { status: 404 }
      );
    }

    const session = await getServerSession(authOptions);
    const isLikedByCurrentUser = session
      ? vlog.likes.some((id) => id.toString() === session.user.id)
      : false;

    const relatedVlogs = await Vlog.find({
      _id: { $ne: vlog._id },
      category: vlog.category,
      status: 'published',
    })
      .limit(4)
      .populate('creator', 'name avatar')
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        vlog: { ...vlog, isLikedByCurrentUser },
        relatedVlogs,
      },
    });

  } catch (error) {
    console.error('GET /api/vlogs/:id error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vlog' },
      { status: 500 }
    );
  }
}

// PATCH /api/vlogs/:id — edit vlog (owner only)
export async function PATCH(request, { params: paramsPromise }) {
  try {
    const params = await paramsPromise;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
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

    if (vlog.creator.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden. You can only edit your own vlogs.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const allowedFields = ['title', 'description', 'thumbnailUrl', 'tags', 'category', 'status'];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        vlog[field] = body[field];
      }
    });

    await vlog.save();
    await vlog.populate('creator', 'name avatar');

    return NextResponse.json({ success: true, data: { vlog } });

  } catch (error) {
    console.error('PATCH /api/vlogs/:id error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update vlog' },
      { status: 500 }
    );
  }
}

// DELETE /api/vlogs/:id — delete vlog (owner only)
export async function DELETE(request, { params: paramsPromise }) {
  try {
    const params = await paramsPromise;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
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

    if (vlog.creator.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden. You can only delete your own vlogs.' },
        { status: 403 }
      );
    }

    await cloudinary.uploader.destroy(vlog.cloudinaryPublicId, {
      resource_type: 'video',
    });

    await Vlog.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Vlog deleted successfully',
    });

  } catch (error) {
    console.error('DELETE /api/vlogs/:id error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete vlog' },
      { status: 500 }
    );
  }
}
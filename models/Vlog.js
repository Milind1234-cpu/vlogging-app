import mongoose, { Schema } from 'mongoose';

const VlogSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    videoUrl: {
      type: String,
      required: [true, 'Video URL is required'], // Cloudinary video URL
    },
    thumbnailUrl: {
      type: String,
      required: [true, 'Thumbnail is required'], // Cloudinary image URL
    },
    // We need this to delete the video from Cloudinary when vlog is deleted
    // Without it, deleted vlogs leave orphaned files in your Cloudinary account
    cloudinaryPublicId: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags) => tags.length <= 10,
        message: 'Maximum 10 tags allowed',
      },
    },
    category: {
      type: String,
      // Only these values are accepted — anything else throws a validation error
      enum: ['travel', 'tech', 'lifestyle', 'food', 'music', 'sports', 'education', 'other'],
      default: 'other',
    },
    // Reference to the User who created this vlog
    // ObjectId is MongoDB's unique ID type — this links the two collections
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',          // tells Mongoose which model to use when we call .populate('creator')
      required: true,
    },
    // Array of User IDs who liked this vlog
    // Storing IDs (not just a count) lets us check: "did THIS user like it?"
    // without a separate likes collection
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Separate count field — so feed queries don't need to measure array length
    // Always keep this in sync with likes.length when toggling likes
    likeCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    // Video duration in seconds — extracted from Cloudinary upload response
    // Used to show "8:07" badge on vlog cards
    duration: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// --- Indexes ---
// These tell MongoDB to build lookup structures for fast queries
// Without indexes, every query scans every document (slow at scale)

VlogSchema.index({ creator: 1 });          // fast: "get all vlogs by this user"
VlogSchema.index({ tags: 1 });             // fast: "get all vlogs with this tag"
VlogSchema.index({ createdAt: -1 });       // fast: newest-first feed (-1 = descending)
VlogSchema.index({ viewCount: -1 });       // fast: most-viewed feed
VlogSchema.index({                         // enables full-text search across these fields
  title: 'text',
  description: 'text',
  tags: 'text',
});

// Prevent model recompilation on Next.js hot reload
const Vlog = mongoose.models.Vlog || mongoose.model('Vlog', VlogSchema);

export default Vlog;
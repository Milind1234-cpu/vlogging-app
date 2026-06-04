import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Define the shape of a User document in MongoDB
const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,           // removes accidental leading/trailing spaces
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,         // MongoDB creates a unique index on this field
      lowercase: true,      // always store as lowercase so "Test@gmail.com" and "test@gmail.com" are the same
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      // We NEVER store plain text — this will always be a bcrypt hash
    },
    avatar: {
      type: String,
      default: null,        // Cloudinary URL, null until user uploads one
    },
    bio: {
      type: String,
      maxlength: [200, 'Bio cannot exceed 200 characters'],
      default: '',
    },
    // Denormalized stats — we store these here so the profile page
    // doesn't need to COUNT across thousands of vlogs on every load
    totalViews: {
      type: Number,
      default: 0,
    },
    totalLikes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt fields
  }
);

// Mongoose middleware — runs BEFORE saving a user document
// This is where we hash the password
UserSchema.pre('save', async function (next) {
  // Only hash if password was actually changed
  // (prevents re-hashing an already hashed password on profile updates)
  if (!this.isModified('password')) return next();

  // bcrypt saltRounds: 12 means 2^12 = 4096 hashing iterations
  // Higher = more secure but slower. 12 is the industry standard balance.
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method — call this to check a login attempt
// Usage: const isValid = await user.comparePassword('enteredPassword')
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Prevent model recompilation error in Next.js hot reload
// Next.js re-imports modules on every change — without this check,
// it would try to redefine the model and throw an error
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
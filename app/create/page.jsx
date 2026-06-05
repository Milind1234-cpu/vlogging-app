'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import useUpload from '@/hooks/useUpload';

const CATEGORIES = ['travel', 'tech', 'lifestyle', 'food', 'music', 'sports', 'education', 'other'];

export default function CreatePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { uploadFile, uploading, progress, error: uploadError } = useUpload();

  const videoInputRef = useRef(null);
  const thumbInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    status: 'published',
  });

  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState('');
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [uploadedThumb, setUploadedThumb] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle video file selection
  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file');
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      setError('Video must be under 500MB');
      return;
    }
    setVideoFile(file);
    setError('');
  };

  // Handle thumbnail file selection
  const handleThumbSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }
    setThumbFile(file);
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setThumbPreview(e.target.result);
    reader.readAsDataURL(file);
    setError('');
  };

  // Add a tag when user presses Enter or comma
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !tags.includes(tag) && tags.length < 10) {
        setTags([...tags, tag]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!videoFile && !uploadedVideo) {
      setError('Please select a video to upload');
      return;
    }
    if (!thumbFile && !uploadedThumb) {
      setError('Please select a thumbnail image');
      return;
    }

    setSubmitting(true);

    try {
      let videoData = uploadedVideo;
      let thumbData = uploadedThumb;

      // Step 1 — Upload video to Cloudinary if not already uploaded
      if (videoFile && !uploadedVideo) {
        videoData = await uploadFile(videoFile, 'video');
        setUploadedVideo(videoData);
      }

      // Step 2 — Upload thumbnail to Cloudinary
      if (thumbFile && !uploadedThumb) {
        thumbData = await uploadFile(thumbFile, 'image');
        setUploadedThumb(thumbData);
      }

      // Step 3 — Save vlog to MongoDB via our API
      const res = await fetch('/api/vlogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          videoUrl: videoData.url,
          thumbnailUrl: thumbData.url,
          cloudinaryPublicId: videoData.publicId,
          tags,
          category: formData.category,
          duration: videoData.duration,
          status: formData.status,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error);
        setSubmitting(false);
        return;
      }

      // Success — go to the new vlog's page
      router.push(`/vlog/${data.data.vlog._id}`);

    } catch (err) {
      setError('Upload failed. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Create a Vlog</h1>

      {/* Error */}
      {(error || uploadError) && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
          {error || uploadError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Video Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Video <span className="text-red-400">*</span>
          </label>
          <div
            onClick={() => videoInputRef.current?.click()}
            className="border-2 border-dashed border-gray-700 hover:border-blue-500 rounded-xl p-8 text-center cursor-pointer transition-colors"
          >
            {videoFile ? (
              <div>
                <p className="text-green-400 font-medium">✓ {videoFile.name}</p>
                <p className="text-gray-400 text-sm mt-1">
                  {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-4xl mb-2">🎬</p>
                <p className="text-gray-300 font-medium">Click to select video</p>
                <p className="text-gray-500 text-sm mt-1">MP4, MOV, AVI — Max 500MB</p>
              </div>
            )}
          </div>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoSelect}
            className="hidden"
          />

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="mt-3">
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Thumbnail Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Thumbnail <span className="text-red-400">*</span>
          </label>
          <div
            onClick={() => thumbInputRef.current?.click()}
            className="border-2 border-dashed border-gray-700 hover:border-blue-500 rounded-xl overflow-hidden cursor-pointer transition-colors"
          >
            {thumbPreview ? (
              <img
                src={thumbPreview}
                alt="Thumbnail preview"
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="p-8 text-center">
                <p className="text-4xl mb-2">🖼️</p>
                <p className="text-gray-300 font-medium">Click to select thumbnail</p>
                <p className="text-gray-500 text-sm mt-1">JPG, PNG, WebP</p>
              </div>
            )}
          </div>
          <input
            ref={thumbInputRef}
            type="file"
            accept="image/*"
            onChange={handleThumbSelect}
            className="hidden"
          />
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Give your vlog a title..."
            maxLength={100}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
          <p className="text-gray-500 text-xs mt-1 text-right">{formData.title.length}/100</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Tell viewers about your vlog..."
            maxLength={2000}
            rows={4}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="capitalize">
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tags (max 10) — press Enter to add
          </label>
          <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 flex flex-wrap gap-2 min-h-[48px]">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-blue-600/20 text-blue-400 border border-blue-600/30 text-xs px-2 py-1 rounded-full flex items-center gap-1"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-white"
                >
                  ✕
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder={tags.length < 10 ? 'Add a tag...' : 'Max tags reached'}
              disabled={tags.length >= 10}
              className="bg-transparent text-white text-sm outline-none flex-1 min-w-[100px]"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Visibility
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="published"
                checked={formData.status === 'published'}
                onChange={handleChange}
                className="accent-blue-600"
              />
              <span className="text-gray-300 text-sm">Publish now</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="draft"
                checked={formData.status === 'draft'}
                onChange={handleChange}
                className="accent-blue-600"
              />
              <span className="text-gray-300 text-sm">Save as draft</span>
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || uploading}
            className="flex-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white py-3 px-8 rounded-lg text-sm font-medium transition-colors"
          >
            {uploading
              ? `Uploading ${progress}%...`
              : submitting
              ? 'Publishing...'
              : formData.status === 'draft'
              ? 'Save Draft'
              : 'Publish Vlog'}
          </button>
        </div>

      </form>
    </div>
  );
}
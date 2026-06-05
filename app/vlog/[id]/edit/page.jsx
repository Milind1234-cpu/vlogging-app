'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import useUpload from '@/hooks/useUpload';

const CATEGORIES = ['travel', 'tech', 'lifestyle', 'food', 'music', 'sports', 'education', 'other'];

export default function EditPage() {
  const router = useRouter();
  const { id } = useParams();
  const { data: session } = useSession();
  const { uploadFile, uploading, progress } = useUpload();

  const thumbInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    status: 'published',
  });

  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch existing vlog data to pre-populate form
  useEffect(() => {
    const fetchVlog = async () => {
      try {
        const res = await fetch(`/api/vlogs/${id}`);
        const data = await res.json();

        if (!data.success) {
          setError('Vlog not found');
          return;
        }

        const vlog = data.data.vlog;

        // Check ownership
        if (session && vlog.creator._id.toString() !== session.user.id) {
          router.push('/');
          return;
        }

        // Pre-populate form with existing values
        setFormData({
          title: vlog.title,
          description: vlog.description || '',
          category: vlog.category,
          status: vlog.status,
        });
        setTags(vlog.tags || []);
        setThumbPreview(vlog.thumbnailUrl);

      } catch (err) {
        setError('Failed to load vlog');
      } finally {
        setLoading(false);
      }
    };

    if (id && session !== undefined) {
      fetchVlog();
    }
  }, [id, session]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleThumbSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setThumbPreview(e.target.result);
    reader.readAsDataURL(file);
  };

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

    setSubmitting(true);

    try {
      let thumbnailUrl = thumbPreview;

      // Upload new thumbnail if selected
      if (thumbFile) {
        const thumbData = await uploadFile(thumbFile, 'image');
        thumbnailUrl = thumbData.url;
      }

      const res = await fetch(`/api/vlogs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          thumbnailUrl,
          tags,
          category: formData.category,
          status: formData.status,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error);
        setSubmitting(false);
        return;
      }

      // Go back to vlog detail page
      router.push(`/vlog/${id}`);

    } catch (err) {
      setError('Failed to update vlog. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-1/3 mb-6" />
        <div className="h-48 bg-gray-800 rounded-xl mb-4" />
        <div className="h-12 bg-gray-800 rounded mb-4" />
        <div className="h-32 bg-gray-800 rounded" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Edit Vlog</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Thumbnail */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Thumbnail
          </label>
          <div
            onClick={() => thumbInputRef.current?.click()}
            className="border-2 border-dashed border-gray-700 hover:border-blue-500 rounded-xl overflow-hidden cursor-pointer transition-colors"
          >
            {thumbPreview ? (
              <div className="relative">
                <img
                  src={thumbPreview}
                  alt="Thumbnail"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm font-medium">Click to change</p>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-300">Click to select thumbnail</p>
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
          {uploading && (
            <div className="mt-2">
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
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
            maxLength={100}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
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
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tags — press Enter to add
          </label>
          <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 flex flex-wrap gap-2 min-h-[48px]">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-blue-600/20 text-blue-400 border border-blue-600/30 text-xs px-2 py-1 rounded-full flex items-center gap-1"
              >
                #{tag}
                <button type="button" onClick={() => removeTag(tag)} className="hover:text-white">✕</button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Add a tag..."
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
              <span className="text-gray-300 text-sm">Published</span>
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
              <span className="text-gray-300 text-sm">Draft</span>
            </label>
          </div>
        </div>

        {/* Buttons */}
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
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white py-3 rounded-lg text-sm font-medium transition-colors"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </form>
    </div>
  );
}
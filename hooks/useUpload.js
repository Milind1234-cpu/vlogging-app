    import { useState } from 'react';

export default function useUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const uploadFile = async (file, resourceType = 'video') => {
    setUploading(true);
    setProgress(0);
    setError('');

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      // FormData is how browsers send files to servers
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('resource_type', resourceType);

      // We use XMLHttpRequest instead of fetch here
      // because fetch doesn't support upload progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // This event fires repeatedly during upload
        // giving us the bytes uploaded vs total bytes
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setProgress(percent);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            setUploading(false);
            setProgress(100);
            // Return the data we need to save in MongoDB
            resolve({
              url: response.secure_url,
              publicId: response.public_id,
              duration: Math.round(response.duration || 0),
            });
          } else {
            reject(new Error('Upload failed'));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        // Upload directly to Cloudinary
        xhr.open(
          'POST',
          `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`
        );
        xhr.send(formData);
      });

    } catch (err) {
      setError(err.message);
      setUploading(false);
      throw err;
    }
  };

  return { uploadFile, uploading, progress, error };
}
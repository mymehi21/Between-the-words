import { useState, useEffect } from 'react';
import { Trash2, Download, Image as ImageIcon } from 'lucide-react';
import { supabase, ImageRecord } from '../../lib/supabase';
import { ImageUpload } from '../ImageUpload';

interface ImageGalleryProps {
  language: string;
}

export function ImageGallery({ language }: ImageGalleryProps) {
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  const handleDelete = async (id: string, storagePath: string) => {
    if (!confirm('Delete this image?')) return;

    try {
      const { error: storageError } = await supabase.storage
        .from('images')
        .remove([storagePath]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('images')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      await loadImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error deleting image');
    }
  };

  const filteredImages = filter === 'all'
    ? images
    : images.filter(img => img.category === filter);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {language === 'ar' ? 'معرض الصور' : 'Image Gallery'}
        </h2>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Upload New Image</h3>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Categories</option>
              <option value="book_cover">Book Covers</option>
              <option value="author_photo">Author Photos</option>
              <option value="blog_image">Blog Images</option>
              <option value="about_section">About Section</option>
              <option value="event">Event Images</option>
              <option value="other">Other</option>
            </select>
          </div>
          <ImageUpload
            category={filter === 'all' ? 'other' : filter}
            onUploadComplete={loadImages}
          />
        </div>

        <div className="mb-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all' ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              All ({images.length})
            </button>
            <button
              onClick={() => setFilter('book_cover')}
              className={`px-4 py-2 rounded-lg transition-colors ${filter === 'book_cover' ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Book Covers ({images.filter(i => i.category === 'book_cover').length})
            </button>
            <button
              onClick={() => setFilter('author_photo')}
              className={`px-4 py-2 rounded-lg transition-colors ${filter === 'author_photo' ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Author Photos ({images.filter(i => i.category === 'author_photo').length})
            </button>
            <button
              onClick={() => setFilter('blog_image')}
              className={`px-4 py-2 rounded-lg transition-colors ${filter === 'blog_image' ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Blog Images ({images.filter(i => i.category === 'blog_image').length})
            </button>
            <button
              onClick={() => setFilter('other')}
              className={`px-4 py-2 rounded-lg transition-colors ${filter === 'other' ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Other ({images.filter(i => i.category === 'other').length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((image) => (
            <div key={image.id} className="relative group border border-gray-200 rounded-lg overflow-hidden">
              <img
                src={image.public_url}
                alt={image.filename}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <a
                  href={image.public_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                  title="View full size"
                >
                  <ImageIcon className="w-5 h-5 text-gray-700" />
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(image.public_url);
                    alert('URL copied to clipboard!');
                  }}
                  className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                  title="Copy URL"
                >
                  <Download className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={() => handleDelete(image.id, image.storage_path)}
                  className="p-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="p-2 bg-white">
                <p className="text-xs text-gray-600 truncate" title={image.filename}>
                  {image.filename}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(image.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
          {filteredImages.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-12">
              {language === 'ar' ? 'لا توجد صور' : 'No images yet'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

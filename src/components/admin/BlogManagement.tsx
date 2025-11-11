import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { supabase, BlogPost } from '../../lib/supabase';
import { ImageUpload } from '../ImageUpload';

interface BlogManagementProps {
  language: string;
}

export function BlogManagement({ language }: BlogManagementProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading blog posts:', error);
    }
  };

  const handleSave = async () => {
    if (!editingPost) return;

    try {
      const slug = editingPost.slug || editingPost.title_en?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '';

      const postData = {
        ...editingPost,
        slug,
        updated_at: new Date().toISOString()
      };

      if (editingPost.id) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingPost.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([postData]);

        if (error) throw error;
      }

      await loadPosts();
      setEditingPost(null);
      setIsAdding(false);
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Error saving post');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this blog post?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting post');
    }
  };

  const handlePublish = async (id: string, published: boolean) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({
          published,
          published_at: published ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;
      await loadPosts();
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Error updating post');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {language === 'ar' ? 'إدارة المدونة' : 'Blog Management'}
          </h2>
          <button
            onClick={() => {
              setIsAdding(true);
              setEditingPost({
                title_en: '',
                title_ar: '',
                excerpt_en: '',
                excerpt_ar: '',
                content_en: '',
                content_ar: '',
                category: 'updates',
                published: false
              });
            }}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {language === 'ar' ? 'إضافة مقال' : 'Add Post'}
          </button>
        </div>

        {(editingPost || isAdding) && (
          <div className="mb-8 p-6 border-2 border-amber-500 rounded-lg bg-amber-50">
            <h3 className="text-xl font-semibold mb-4">
              {editingPost?.id ? 'Edit Post' : 'New Post'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title (English)</label>
                <input
                  type="text"
                  value={editingPost?.title_en || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, title_en: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title (Arabic)</label>
                <input
                  type="text"
                  value={editingPost?.title_ar || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, title_ar: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Excerpt (English)</label>
                <textarea
                  value={editingPost?.excerpt_en || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, excerpt_en: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Excerpt (Arabic)</label>
                <textarea
                  value={editingPost?.excerpt_ar || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, excerpt_ar: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Content (English)</label>
                <textarea
                  value={editingPost?.content_en || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, content_en: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  rows={8}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Content (Arabic)</label>
                <textarea
                  value={editingPost?.content_ar || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, content_ar: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  rows={8}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={editingPost?.category || 'updates'}
                  onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="writing_tips">Writing Tips</option>
                  <option value="behind_scenes">Behind the Scenes</option>
                  <option value="updates">Book Updates</option>
                  <option value="personal">Personal Thoughts</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Featured Image</label>
                <ImageUpload
                  category="blog_image"
                  onUploadComplete={(url) => setEditingPost({ ...editingPost, featured_image: url })}
                />
                {editingPost?.featured_image && (
                  <img src={editingPost.featured_image} alt="Featured" className="mt-2 max-h-32 rounded" />
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingPost(null);
                    setIsAdding(false);
                  }}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{post.title_en}</h3>
                  <p className="text-sm text-gray-600 mt-1">{post.excerpt_en}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded ${post.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                    <span>{post.category}</span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handlePublish(post.id, !post.published)}
                    className={`px-3 py-1 rounded-lg transition-colors ${post.published ? 'bg-gray-200 hover:bg-gray-300' : 'bg-green-100 hover:bg-green-200'}`}
                  >
                    {post.published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => setEditingPost(post)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              {language === 'ar' ? 'لا توجد مقالات بعد' : 'No blog posts yet'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { supabase, SiteContent } from '../../lib/supabase';

interface ContentManagementProps {
  language: string;
}

export function ContentManagement({ language }: ContentManagementProps) {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('*');

      if (error) throw error;

      const contentMap: Record<string, string> = {};
      data?.forEach((item: SiteContent) => {
        contentMap[item.key] = item.value;
      });
      setContent(contentMap);
    } catch (error) {
      console.error('Error loading content:', error);
    }
  };

  const handleSave = async (key: string, value: string) => {
    setLoading(true);
    setSaveMessage('');
    try {
      const { error } = await supabase
        .from('site_content')
        .upsert({ key, value }, { onConflict: 'key' });

      if (error) throw error;

      setContent({ ...content, [key]: value });
      setSaveMessage('Saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving content:', error);
      setSaveMessage('Error saving');
    } finally {
      setLoading(false);
    }
  };

  const ContentField = ({ label, contentKey }: { label: string; contentKey: string }) => {
    const [localValue, setLocalValue] = useState(content[contentKey] || '');

    useEffect(() => {
      setLocalValue(content[contentKey] || '');
    }, [content, contentKey]);

    return (
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
        <div className="flex gap-2">
          <textarea
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            rows={3}
          />
          <button
            onClick={() => handleSave(contentKey, localValue)}
            disabled={loading}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {language === 'ar' ? 'إدارة المحتوى' : 'Content Management'}
        </h2>

        {saveMessage && (
          <div className={`mb-4 p-4 rounded-lg ${saveMessage.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {saveMessage}
          </div>
        )}

        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Hero Section</h3>
            <ContentField label="Hero Title (English)" contentKey="hero_title_en" />
            <ContentField label="Hero Title (Arabic)" contentKey="hero_title_ar" />
            <ContentField label="Hero Subtitle (English)" contentKey="hero_subtitle_en" />
            <ContentField label="Hero Subtitle (Arabic)" contentKey="hero_subtitle_ar" />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">About Section</h3>
            <ContentField label="Author Bio (English)" contentKey="about_bio_en" />
            <ContentField label="Author Bio (Arabic)" contentKey="about_bio_ar" />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Design Settings</h3>
            <ContentField label="Primary Color (Hex)" contentKey="theme_primary_color" />
            <ContentField label="Accent Color (Hex)" contentKey="theme_accent_color" />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Social Links</h3>
            <ContentField label="Facebook URL" contentKey="social_facebook" />
            <ContentField label="Twitter URL" contentKey="social_twitter" />
            <ContentField label="Instagram URL" contentKey="social_instagram" />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">SEO Settings</h3>
            <ContentField label="Site Title" contentKey="seo_title" />
            <ContentField label="Site Description" contentKey="seo_description" />
          </div>
        </div>
      </div>
    </div>
  );
}

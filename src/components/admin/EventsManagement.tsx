import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Calendar } from 'lucide-react';
import { supabase, Event } from '../../lib/supabase';
import { ImageUpload } from '../ImageUpload';

interface EventsManagementProps {
  language: string;
}

export function EventsManagement({ language }: EventsManagementProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [editingEvent, setEditingEvent] = useState<Partial<Event> | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const handleSave = async () => {
    if (!editingEvent) return;

    try {
      const eventData = {
        ...editingEvent,
        updated_at: new Date().toISOString()
      };

      if (editingEvent.id) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('events')
          .insert([eventData]);

        if (error) throw error;
      }

      await loadEvents();
      setEditingEvent(null);
      setIsAdding(false);
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {language === 'ar' ? 'إدارة الأحداث' : 'Events Management'}
          </h2>
          <button
            onClick={() => {
              setIsAdding(true);
              setEditingEvent({
                title_en: '',
                title_ar: '',
                description_en: '',
                description_ar: '',
                event_date: new Date().toISOString(),
                location_en: '',
                location_ar: '',
                event_type: 'other'
              });
            }}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {language === 'ar' ? 'إضافة حدث' : 'Add Event'}
          </button>
        </div>

        {(editingEvent || isAdding) && (
          <div className="mb-8 p-6 border-2 border-amber-500 rounded-lg bg-amber-50">
            <h3 className="text-xl font-semibold mb-4">
              {editingEvent?.id ? 'Edit Event' : 'New Event'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title (English)</label>
                <input
                  type="text"
                  value={editingEvent?.title_en || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title_en: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title (Arabic)</label>
                <input
                  type="text"
                  value={editingEvent?.title_ar || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title_ar: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description (English)</label>
                <textarea
                  value={editingEvent?.description_en || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description_en: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  rows={3}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Arabic)</label>
                <textarea
                  value={editingEvent?.description_ar || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description_ar: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Event Date</label>
                <input
                  type="datetime-local"
                  value={editingEvent?.event_date ? new Date(editingEvent.event_date).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, event_date: new Date(e.target.value).toISOString() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Event Type</label>
                <select
                  value={editingEvent?.event_type || 'other'}
                  onChange={(e) => setEditingEvent({ ...editingEvent, event_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="book_signing">Book Signing</option>
                  <option value="reading">Reading</option>
                  <option value="interview">Interview</option>
                  <option value="online">Online Event</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location (English)</label>
                <input
                  type="text"
                  value={editingEvent?.location_en || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, location_en: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location (Arabic)</label>
                <input
                  type="text"
                  value={editingEvent?.location_ar || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, location_ar: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">RSVP Link</label>
                <input
                  type="url"
                  value={editingEvent?.rsvp_link || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, rsvp_link: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="https://"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Event Image</label>
                <ImageUpload
                  category="event"
                  onUploadComplete={(url) => setEditingEvent({ ...editingEvent, image_url: url })}
                />
                {editingEvent?.image_url && (
                  <img src={editingEvent.image_url} alt="Event" className="mt-2 max-h-32 rounded" />
                )}
              </div>
              <div className="col-span-2 flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingEvent(null);
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
          {events.map((event) => (
            <div key={event.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{event.title_en}</h3>
                  <p className="text-sm text-gray-600 mt-1">{event.description_en}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(event.event_date).toLocaleString()}</span>
                    <span>{event.location_en}</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">{event.event_type}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => setEditingEvent(event)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              {language === 'ar' ? 'لا توجد أحداث بعد' : 'No events yet'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

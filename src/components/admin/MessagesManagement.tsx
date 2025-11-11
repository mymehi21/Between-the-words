import { useState, useEffect } from 'react';
import { Mail, Trash2, Printer, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function MessagesManagement() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      loadMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const markAsUnread = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: false })
        .eq('id', id);

      if (error) throw error;
      loadMessages();
    } catch (error) {
      console.error('Error marking message as unread:', error);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      setSelectedMessage(null);
      loadMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const printMessage = (message: ContactMessage) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Contact Message</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            .info { margin: 10px 0; }
            .message { margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h1>Contact Message</h1>
          <div class="info"><strong>From:</strong> ${message.name}</div>
          <div class="info"><strong>Email:</strong> ${message.email}</div>
          <div class="info"><strong>Date:</strong> ${new Date(message.created_at).toLocaleString()}</div>
          <div class="message">
            <strong>Message:</strong><br/>
            ${message.message}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const unreadCount = messages.filter(m => !m.is_read).length;

  if (loading) {
    return <div className="text-center py-8">Loading messages...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Mail className="w-6 h-6 text-amber-600" />
          <h2 className="text-2xl font-bold text-gray-900">Contact Messages</h2>
          {unreadCount > 0 && (
            <span className="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No messages yet
        </div>
      ) : (
        <div className="grid gap-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`border rounded-lg p-4 transition-all cursor-pointer hover:shadow-md ${
                message.is_read
                  ? 'bg-white border-gray-200'
                  : 'bg-amber-50 border-amber-300'
              } ${selectedMessage?.id === message.id ? 'ring-2 ring-amber-500' : ''}`}
              onClick={() => {
                setSelectedMessage(message);
                if (!message.is_read) {
                  markAsRead(message.id);
                }
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{message.name}</h3>
                    {!message.is_read && (
                      <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-semibold rounded">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{message.email}</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{message.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(message.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      message.is_read ? markAsUnread(message.id) : markAsRead(message.id);
                    }}
                    className="p-2 text-gray-600 hover:text-amber-600 transition-colors"
                    title={message.is_read ? 'Mark as unread' : 'Mark as read'}
                  >
                    {message.is_read ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      printMessage(message);
                    }}
                    className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                    title="Print message"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMessage(message.id);
                    }}
                    className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                    title="Delete message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {selectedMessage?.id === message.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Full Message:</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

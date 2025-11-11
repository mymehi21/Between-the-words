import { useState, useEffect } from 'react';
import { RotateCcw, Trash2, Package, BookOpen, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DeletedItem {
  id: string;
  type: 'book' | 'review' | 'order';
  title: string;
  deletedAt: string;
  deletedBy: string;
  data: any;
}

interface RecentlyDeletedProps {
  language: string;
}

export function RecentlyDeleted({ language }: RecentlyDeletedProps) {
  const [deletedItems, setDeletedItems] = useState<DeletedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadDeletedItems();
  }, []);

  const loadDeletedItems = async () => {
    setLoading(true);
    try {
      const items: DeletedItem[] = [];

      const { data: books } = await supabase
        .from('books')
        .select('*')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (books) {
        items.push(...books.map(book => ({
          id: book.id,
          type: 'book' as const,
          title: book.title,
          deletedAt: book.deleted_at,
          deletedBy: book.deleted_by,
          data: book
        })));
      }

      const { data: reviews } = await supabase
        .from('reviews')
        .select('*')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (reviews) {
        items.push(...reviews.map(review => ({
          id: review.id,
          type: 'review' as const,
          title: review.reviewer_name,
          deletedAt: review.deleted_at,
          deletedBy: review.deleted_by,
          data: review
        })));
      }

      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (orders) {
        items.push(...orders.map(order => ({
          id: order.id,
          type: 'order' as const,
          title: `${order.customer_name} - ${order.customer_email}`,
          deletedAt: order.deleted_at,
          deletedBy: order.deleted_by,
          data: order
        })));
      }

      items.sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
      setDeletedItems(items);
    } catch (error) {
      console.error('Error loading deleted items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (item: DeletedItem) => {
    setProcessing(item.id);
    try {
      const table = item.type === 'book' ? 'books' : item.type === 'review' ? 'reviews' : 'orders';

      const { error } = await supabase
        .from(table)
        .update({ deleted_at: null, deleted_by: null })
        .eq('id', item.id);

      if (error) throw error;

      await loadDeletedItems();
    } catch (error) {
      console.error('Error restoring item:', error);
      alert(language === 'ar' ? 'خطأ في استعادة العنصر' : 'Error restoring item');
    } finally {
      setProcessing(null);
    }
  };

  const handlePermanentDelete = async (item: DeletedItem) => {
    const confirmMessage = language === 'ar'
      ? 'هل أنت متأكد من الحذف النهائي؟ لا يمكن التراجع عن هذا الإجراء!'
      : 'Are you sure you want to permanently delete this? This cannot be undone!';

    if (!confirm(confirmMessage)) return;

    setProcessing(item.id);
    try {
      const table = item.type === 'book' ? 'books' : item.type === 'review' ? 'reviews' : 'orders';

      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      await loadDeletedItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert(language === 'ar' ? 'خطأ في حذف العنصر' : 'Error deleting item');
    } finally {
      setProcessing(null);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'book':
        return BookOpen;
      case 'review':
        return Star;
      case 'order':
        return Package;
      default:
        return Trash2;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'book':
        return language === 'ar' ? 'كتاب' : 'Book';
      case 'review':
        return language === 'ar' ? 'مراجعة' : 'Review';
      case 'order':
        return language === 'ar' ? 'طلب' : 'Order';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">
          {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
        </div>
      </div>
    );
  }

  if (deletedItems.length === 0) {
    return (
      <div className="text-center py-12">
        <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">
          {language === 'ar' ? 'لا توجد عناصر محذوفة' : 'No deleted items'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {language === 'ar' ? 'المحذوفات الأخيرة' : 'Recently Deleted'}
        </h2>
        <p className="text-sm text-gray-500">
          {deletedItems.length} {language === 'ar' ? 'عنصر' : 'items'}
        </p>
      </div>

      <div className="grid gap-4">
        {deletedItems.map((item) => {
          const Icon = getIcon(item.type);
          return (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                        {getTypeLabel(item.type)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 truncate">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {language === 'ar' ? 'تم الحذف في' : 'Deleted on'}{' '}
                      {new Date(item.deletedAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRestore(item)}
                    disabled={processing === item.id}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {language === 'ar' ? 'استعادة' : 'Restore'}
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(item)}
                    disabled={processing === item.id}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    {language === 'ar' ? 'حذف نهائي' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

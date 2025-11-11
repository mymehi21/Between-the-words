import { useState, useEffect } from 'react';
import { LogOut, BookOpen, ShoppingBag, Plus, Edit2, Trash2, Save, X, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Book, Order, ApprovedEmail } from '../lib/supabase';

export function AdminDashboard() {
  const { language, t } = useLanguage();
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'books' | 'orders' | 'admins'>('books');
  const [books, setBooks] = useState<Book[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [approvedEmails, setApprovedEmails] = useState<ApprovedEmail[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [editingBook, setEditingBook] = useState<Partial<Book> | null>(null);
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBooks();
    loadOrders();
    loadApprovedEmails();
  }, []);

  const loadBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error('Error loading books:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const handleSaveBook = async () => {
    if (!editingBook) return;
    setLoading(true);

    try {
      if (editingBook.id) {
        const { error } = await supabase
          .from('books')
          .update(editingBook)
          .eq('id', editingBook.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('books')
          .insert([editingBook]);

        if (error) throw error;
      }

      await loadBooks();
      setEditingBook(null);
      setIsAddingBook(false);
    } catch (error) {
      console.error('Error saving book:', error);
      alert('Error saving book');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Error deleting book');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
      await loadOrders();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const loadApprovedEmails = async () => {
    try {
      const { data, error } = await supabase
        .from('approved_emails')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApprovedEmails(data || []);
    } catch (error) {
      console.error('Error loading approved emails:', error);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail || !newAdminEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('approved_emails')
        .insert([{
          email: newAdminEmail,
          is_active: true
        }]);

      if (error) {
        if (error.code === '23505') {
          alert('This email is already approved');
        } else {
          throw error;
        }
      } else {
        setNewAdminEmail('');
        await loadApprovedEmails();
        alert('Email approved! User can now create their account at /admin');
      }
    } catch (error) {
      console.error('Error approving email:', error);
      alert('Error approving email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (id: string, email: string) => {
    if (!confirm(`Remove admin access for ${email}?`)) return;

    try {
      const { error } = await supabase
        .from('approved_emails')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadApprovedEmails();
    } catch (error) {
      console.error('Error removing admin:', error);
      alert('Error removing admin');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-amber-700 to-orange-600 px-6 py-4 flex items-center justify-between">
            <h1 className={`text-2xl font-bold text-white ${language === 'ar' ? 'font-arabic' : ''}`}>
              {t('admin.dashboard')}
            </h1>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {t('admin.signout')}
            </button>
          </div>

          <div className="border-b border-gray-200">
            <div className="flex gap-4 px-6">
              <button
                onClick={() => setActiveTab('books')}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 font-semibold transition-colors ${
                  activeTab === 'books'
                    ? 'border-amber-700 text-amber-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                {t('admin.books')}
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 font-semibold transition-colors ${
                  activeTab === 'orders'
                    ? 'border-amber-700 text-amber-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                {t('admin.orders')}
              </button>
              <button
                onClick={() => setActiveTab('admins')}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 font-semibold transition-colors ${
                  activeTab === 'admins'
                    ? 'border-amber-700 text-amber-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Users className="w-5 h-5" />
                {t('admin.admins')}
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'books' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">{t('admin.books')}</h2>
                  <button
                    onClick={() => {
                      setIsAddingBook(true);
                      setEditingBook({
                        title_en: '',
                        title_ar: '',
                        description_en: '',
                        description_ar: '',
                        author_en: '',
                        author_ar: '',
                        cover_image_url: '',
                        pdf_price: 0,
                        physical_price: 0,
                        pdf_url: '',
                        isbn: '',
                        pages: 0,
                        is_available: true,
                        featured: false,
                      });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('admin.addBook')}
                  </button>
                </div>

                {(editingBook && isAddingBook) || (editingBook && !isAddingBook) ? (
                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">
                      {isAddingBook ? t('admin.addBook') : t('admin.editBook')}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('admin.titleEn')}
                        </label>
                        <input
                          type="text"
                          value={editingBook.title_en || ''}
                          onChange={(e) => setEditingBook({ ...editingBook, title_en: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('admin.titleAr')}
                        </label>
                        <input
                          type="text"
                          value={editingBook.title_ar || ''}
                          onChange={(e) => setEditingBook({ ...editingBook, title_ar: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('admin.authorEn')}
                        </label>
                        <input
                          type="text"
                          value={editingBook.author_en || ''}
                          onChange={(e) => setEditingBook({ ...editingBook, author_en: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('admin.authorAr')}
                        </label>
                        <input
                          type="text"
                          value={editingBook.author_ar || ''}
                          onChange={(e) => setEditingBook({ ...editingBook, author_ar: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('admin.descEn')}
                        </label>
                        <textarea
                          rows={3}
                          value={editingBook.description_en || ''}
                          onChange={(e) => setEditingBook({ ...editingBook, description_en: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('admin.descAr')}
                        </label>
                        <textarea
                          rows={3}
                          value={editingBook.description_ar || ''}
                          onChange={(e) => setEditingBook({ ...editingBook, description_ar: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('admin.coverUrl')}
                        </label>
                        <input
                          type="url"
                          value={editingBook.cover_image_url || ''}
                          onChange={(e) => setEditingBook({ ...editingBook, cover_image_url: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('admin.pdfUrl')}
                        </label>
                        <input
                          type="url"
                          value={editingBook.pdf_url || ''}
                          onChange={(e) => setEditingBook({ ...editingBook, pdf_url: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('admin.pdfPrice')}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={editingBook.pdf_price || 0}
                          onChange={(e) => setEditingBook({ ...editingBook, pdf_price: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('admin.physicalPrice')}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={editingBook.physical_price || 0}
                          onChange={(e) => setEditingBook({ ...editingBook, physical_price: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('admin.isbn')}
                        </label>
                        <input
                          type="text"
                          value={editingBook.isbn || ''}
                          onChange={(e) => setEditingBook({ ...editingBook, isbn: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('admin.pages')}
                        </label>
                        <input
                          type="number"
                          value={editingBook.pages || 0}
                          onChange={(e) => setEditingBook({ ...editingBook, pages: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editingBook.is_available || false}
                            onChange={(e) => setEditingBook({ ...editingBook, is_available: e.target.checked })}
                            className="w-4 h-4 text-amber-700"
                          />
                          <span className="text-sm font-medium text-gray-700">{t('admin.available')}</span>
                        </label>
                      </div>
                      <div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editingBook.featured || false}
                            onChange={(e) => setEditingBook({ ...editingBook, featured: e.target.checked })}
                            className="w-4 h-4 text-amber-700"
                          />
                          <span className="text-sm font-medium text-gray-700">{t('admin.featured')}</span>
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleSaveBook}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        {t('admin.save')}
                      </button>
                      <button
                        onClick={() => {
                          setEditingBook(null);
                          setIsAddingBook(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        {t('admin.cancel')}
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className="space-y-4">
                  {books.map((book) => (
                    <div key={book.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {language === 'ar' ? book.title_ar : book.title_en}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {language === 'ar' ? book.author_ar : book.author_en}
                        </p>
                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                          <span>PDF: ${book.pdf_price}</span>
                          <span>Physical: ${book.physical_price}</span>
                          <span className={book.is_available ? 'text-green-600' : 'text-red-600'}>
                            {book.is_available ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingBook(book);
                            setIsAddingBook(false);
                          }}
                          className="p-2 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('admin.orders')}</h2>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">Order #{order.order_number}</p>
                          <p className="text-sm text-gray-600">{order.customer_name}</p>
                          <p className="text-sm text-gray-600">{order.customer_email}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-amber-700">${order.amount}</p>
                          <p className="text-sm text-gray-600 capitalize">{order.order_type}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                          <option value="shipped">Shipped</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <span className="text-xs text-gray-500 self-center">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'admins' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('admin.admins')}</h2>

                <div className="bg-amber-50 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.addAdmin')}</h3>
                  <div className="flex gap-3">
                    <input
                      type="email"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder={t('admin.adminEmail')}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleAddAdmin}
                      disabled={loading}
                      className="px-6 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    {language === 'ar'
                      ? 'بعد الموافقة، يمكن للمستخدم إنشاء حساب بهذا البريد الإلكتروني على /admin'
                      : 'Once approved, the user can create an account with this email at /admin'}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.approvedAdmins')}</h3>
                  <div className="space-y-3">
                    {approvedEmails.map((email) => (
                      <div key={email.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{email.email}</p>
                          <p className="text-sm text-gray-500">
                            {language === 'ar' ? 'تمت الموافقة في' : 'Approved on'}: {new Date(email.approved_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveAdmin(email.id, email.email)}
                          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          {t('admin.removeAdmin')}
                        </button>
                      </div>
                    ))}
                    {approvedEmails.length === 0 && (
                      <p className="text-center text-gray-500 py-8">
                        {language === 'ar' ? 'لا يوجد بريد إلكتروني معتمد' : 'No approved emails yet'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

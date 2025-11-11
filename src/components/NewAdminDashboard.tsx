import { useState, useEffect } from 'react';
import { LogOut, Package, BookOpen, Star, Shield, Trash2, Mail } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { NewOrdersManagement } from './admin/NewOrdersManagement';
import { NewBooksManagement } from './admin/NewBooksManagement';
import { NewReviewsManagement } from './admin/NewReviewsManagement';
import { BossAdminManagement } from './admin/BossAdminManagement';
import { RecentlyDeleted } from './admin/RecentlyDeleted';
import { MessagesManagement } from './admin/MessagesManagement';
import { supabase } from '../lib/supabase';

type TabType = 'orders' | 'books' | 'reviews' | 'messages' | 'admins' | 'deleted';

export function NewAdminDashboard() {
  const { language } = useLanguage();
  const { signOut, isBossAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const { count, error } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
        .is('deleted_at', null);

      if (error) throw error;
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const tabs = [
    { id: 'orders' as TabType, icon: Package, label: language === 'ar' ? 'الطلبات' : 'Orders' },
    { id: 'books' as TabType, icon: BookOpen, label: language === 'ar' ? 'الكتب' : 'Books' },
    { id: 'reviews' as TabType, icon: Star, label: language === 'ar' ? 'المراجعات' : 'Reviews' },
    { id: 'messages' as TabType, icon: Mail, label: language === 'ar' ? 'الرسائل' : 'Messages', count: unreadCount },
    { id: 'deleted' as TabType, icon: Trash2, label: language === 'ar' ? 'المحذوفات' : 'Deleted' },
    ...(isBossAdmin ? [{ id: 'admins' as TabType, icon: Shield, label: language === 'ar' ? 'المسؤولون' : 'Admins' }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-amber-700 to-orange-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-white" />
              <h1 className="text-2xl font-bold text-white">
                {language === 'ar' ? 'لوحة التحكم' : 'Admin Dashboard'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2 backdrop-blur-sm"
              >
                <BookOpen className="w-4 h-4" />
                {language === 'ar' ? 'الموقع' : 'Website'}
              </a>
              <button
                onClick={signOut}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-2 backdrop-blur-sm"
              >
                <LogOut className="w-4 h-4" />
                {language === 'ar' ? 'تسجيل خروج' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (tab.id === 'messages') {
                        setTimeout(loadUnreadCount, 500);
                      }
                    }}
                    className={`relative flex items-center gap-2 px-6 py-4 font-semibold transition-all whitespace-nowrap border-b-2 ${
                      activeTab === tab.id
                        ? 'text-amber-700 border-amber-700 bg-amber-50'
                        : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                    {tab.count && tab.count > 0 && (
                      <span className="absolute -top-1 -right-1 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] text-center">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'orders' && <NewOrdersManagement language={language} />}
            {activeTab === 'books' && <NewBooksManagement language={language} />}
            {activeTab === 'reviews' && <NewReviewsManagement language={language} />}
            {activeTab === 'messages' && <MessagesManagement />}
            {activeTab === 'deleted' && <RecentlyDeleted language={language} />}
            {activeTab === 'admins' && isBossAdmin && <BossAdminManagement language={language} />}
          </div>
        </div>
      </div>
    </div>
  );
}

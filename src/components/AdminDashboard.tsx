import { useState, useEffect } from 'react';
import { LogOut, BookOpen, ShoppingBag, Users, Image, FileText, Calendar, Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Book, Order, ApprovedEmail } from '../lib/supabase';
import { BlogManagement } from './admin/BlogManagement';
import { EventsManagement } from './admin/EventsManagement';
import { ReviewsManagement } from './admin/ReviewsManagement';
import { ImageGallery } from './admin/ImageGallery';
import { BooksManagement } from './admin/BooksManagement';
import { OrdersManagement } from './admin/OrdersManagement';
import { AdminsManagement } from './admin/AdminsManagement';

type TabType = 'books' | 'orders' | 'images' | 'blog' | 'events' | 'reviews' | 'admins';

export function AdminDashboard() {
  const { language, t } = useLanguage();
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('admins');

  const tabs = [
    { id: 'admins' as TabType, icon: Users, label: language === 'ar' ? 'المسؤولون' : 'Admins' },
    { id: 'books' as TabType, icon: BookOpen, label: language === 'ar' ? 'الكتب' : 'Books' },
    { id: 'orders' as TabType, icon: ShoppingBag, label: language === 'ar' ? 'الطلبات' : 'Orders' },
    { id: 'images' as TabType, icon: Image, label: language === 'ar' ? 'الصور' : 'Images' },
    { id: 'blog' as TabType, icon: FileText, label: language === 'ar' ? 'المدونة' : 'Blog' },
    { id: 'events' as TabType, icon: Calendar, label: language === 'ar' ? 'الأحداث' : 'Events' },
    { id: 'reviews' as TabType, icon: Star, label: language === 'ar' ? 'المراجعات' : 'Reviews' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#14202C] to-[#1a2f42] px-6 py-4 flex items-center justify-between">
            <h1 className={`text-2xl font-bold text-white ${language === 'ar' ? 'font-arabic' : ''}`}>
              {t('admin.dashboard')}
            </h1>
            <button
              onClick={signOut}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              {t('admin.signOut')}
            </button>
          </div>

          <div className="flex border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-[#D9A441] border-b-2 border-[#D9A441]'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {activeTab === 'admins' && <AdminsManagement language={language} />}
            {activeTab === 'books' && <BooksManagement language={language} />}
            {activeTab === 'orders' && <OrdersManagement language={language} />}
            {activeTab === 'images' && <ImageGallery language={language} />}
            {activeTab === 'blog' && <BlogManagement language={language} />}
            {activeTab === 'events' && <EventsManagement language={language} />}
            {activeTab === 'reviews' && <ReviewsManagement language={language} />}
          </div>
        </div>
      </div>
    </div>
  );
}

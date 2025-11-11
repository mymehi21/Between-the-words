import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.books': 'Books',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.admin': 'Admin',
    'hero.title': 'Between The Words',
    'hero.subtitle': 'Stories that touch the soul and transcend boundaries',
    'hero.cta': 'Explore Books',
    'hero.author': 'Fatme Mroue',
    'books.title': 'Published Works',
    'books.viewDetails': 'View Details',
    'books.buyPdf': 'Buy PDF',
    'books.buyPhysical': 'Buy Physical Book',
    'books.pages': 'pages',
    'about.title': 'About the Author',
    'about.author': 'Fatme Mroue',
    'about.bio': 'Fatme Mroue is a passionate writer who explores emotions and reflections through her words. Her writing serves as a mirror to a soul that contemplates life and its details with honesty and warmth. Through an emotional language, she expresses the heartfelt thoughts about love, memories, humanity, and relationships.',
    'contact.title': 'Get in Touch',
    'contact.name': 'Your Name',
    'contact.email': 'Your Email',
    'contact.message': 'Your Message',
    'contact.send': 'Send Message',
    'newsletter.title': 'Stay Updated',
    'newsletter.subtitle': 'Subscribe to receive news about new releases and exclusive content',
    'newsletter.email': 'Enter your email',
    'newsletter.subscribe': 'Subscribe',
    'newsletter.success': 'Successfully subscribed!',
    'footer.rights': 'All rights reserved',
    'admin.login': 'Admin Login',
    'admin.email': 'Email',
    'admin.password': 'Password',
    'admin.signin': 'Sign In',
    'admin.signout': 'Sign Out',
    'admin.dashboard': 'Admin Dashboard',
    'admin.books': 'Manage Books',
    'admin.orders': 'Manage Orders',
    'admin.addBook': 'Add New Book',
    'admin.editBook': 'Edit Book',
    'admin.titleEn': 'Title (English)',
    'admin.titleAr': 'Title (Arabic)',
    'admin.descEn': 'Description (English)',
    'admin.descAr': 'Description (Arabic)',
    'admin.authorEn': 'Author Name (English)',
    'admin.authorAr': 'Author Name (Arabic)',
    'admin.coverUrl': 'Cover Image URL',
    'admin.pdfPrice': 'PDF Price',
    'admin.physicalPrice': 'Physical Book Price',
    'admin.pdfUrl': 'PDF File URL',
    'admin.isbn': 'ISBN',
    'admin.pages': 'Number of Pages',
    'admin.publishDate': 'Publication Date',
    'admin.available': 'Available for Purchase',
    'admin.featured': 'Featured Book',
    'admin.save': 'Save',
    'admin.cancel': 'Cancel',
    'admin.delete': 'Delete',
    'admin.admins': 'Manage Admins',
    'admin.addAdmin': 'Add Admin Email',
    'admin.adminEmail': 'Admin Email',
    'admin.approvedAdmins': 'Approved Administrators',
    'admin.removeAdmin': 'Remove',
    'checkout.title': 'Checkout',
    'checkout.bookDetails': 'Book Details',
    'checkout.customerInfo': 'Customer Information',
    'checkout.name': 'Full Name',
    'checkout.email': 'Email Address',
    'checkout.phone': 'Phone Number',
    'checkout.address': 'Shipping Address',
    'checkout.total': 'Total',
    'checkout.pay': 'Proceed to Payment',
    'order.success': 'Order Successful!',
    'order.number': 'Order Number',
    'order.download': 'Download PDF',
    'order.email': 'A confirmation has been sent to your email',
  },
  ar: {
    'nav.home': 'الرئيسية',
    'nav.books': 'الكتب',
    'nav.about': 'عن الكاتبة',
    'nav.contact': 'اتصل بنا',
    'nav.admin': 'لوحة التحكم',
    'hero.title': 'بين الكلمات',
    'hero.subtitle': 'خواطر وشاعر تُعانق القارئ بلغة وجدانية',
    'hero.cta': 'استكشف الكتب',
    'hero.author': 'فاطمة مروة',
    'books.title': 'الأعمال المنشورة',
    'books.viewDetails': 'عرض التفاصيل',
    'books.buyPdf': 'شراء النسخة الإلكترونية',
    'books.buyPhysical': 'شراء النسخة الورقية',
    'books.pages': 'صفحة',
    'about.title': 'عن الكاتبة',
    'about.author': 'فاطمة مروة',
    'about.bio': 'فاطمة مروة كاتبة شغوفة تبحر في عوالم المشاعر والتأملات، حيث تنسج كلماتها لتكون مرآةً لروحٍ تتأمل الحياة وتفاصيلها بصدق ودفء. تُعانق القارئ بلغة وجدانية، تعبر عن خلجات القلب وأفكارٍ عميقة حول الحبّ، والذكريات، والإنسان، وعلاقته بخالقه وبمن حوله.',
    'contact.title': 'تواصل معنا',
    'contact.name': 'الاسم',
    'contact.email': 'البريد الإلكتروني',
    'contact.message': 'رسالتك',
    'contact.send': 'إرسال',
    'newsletter.title': 'ابق على اطلاع',
    'newsletter.subtitle': 'اشترك لتلقي أخبار الإصدارات الجديدة والمحتوى الحصري',
    'newsletter.email': 'أدخل بريدك الإلكتروني',
    'newsletter.subscribe': 'اشتراك',
    'newsletter.success': 'تم الاشتراك بنجاح!',
    'footer.rights': 'جميع الحقوق محفوظة',
    'admin.login': 'تسجيل دخول المسؤول',
    'admin.email': 'البريد الإلكتروني',
    'admin.password': 'كلمة المرور',
    'admin.signin': 'تسجيل الدخول',
    'admin.signout': 'تسجيل الخروج',
    'admin.dashboard': 'لوحة التحكم',
    'admin.books': 'إدارة الكتب',
    'admin.orders': 'إدارة الطلبات',
    'admin.addBook': 'إضافة كتاب جديد',
    'admin.editBook': 'تعديل الكتاب',
    'admin.titleEn': 'العنوان (إنجليزي)',
    'admin.titleAr': 'العنوان (عربي)',
    'admin.descEn': 'الوصف (إنجليزي)',
    'admin.descAr': 'الوصف (عربي)',
    'admin.authorEn': 'اسم المؤلف (إنجليزي)',
    'admin.authorAr': 'اسم المؤلف (عربي)',
    'admin.coverUrl': 'رابط صورة الغلاف',
    'admin.pdfPrice': 'سعر النسخة الإلكترونية',
    'admin.physicalPrice': 'سعر النسخة الورقية',
    'admin.pdfUrl': 'رابط ملف PDF',
    'admin.isbn': 'الرقم الدولي',
    'admin.pages': 'عدد الصفحات',
    'admin.publishDate': 'تاريخ النشر',
    'admin.available': 'متاح للشراء',
    'admin.featured': 'كتاب مميز',
    'admin.save': 'حفظ',
    'admin.cancel': 'إلغاء',
    'admin.delete': 'حذف',
    'admin.admins': 'إدارة المسؤولين',
    'admin.addAdmin': 'إضافة بريد مسؤول',
    'admin.adminEmail': 'البريد الإلكتروني للمسؤول',
    'admin.approvedAdmins': 'المسؤولون المعتمدون',
    'admin.removeAdmin': 'إزالة',
    'checkout.title': 'إتمام الطلب',
    'checkout.bookDetails': 'تفاصيل الكتاب',
    'checkout.customerInfo': 'معلومات العميل',
    'checkout.name': 'الاسم الكامل',
    'checkout.email': 'البريد الإلكتروني',
    'checkout.phone': 'رقم الهاتف',
    'checkout.address': 'عنوان الشحن',
    'checkout.total': 'المجموع',
    'checkout.pay': 'المتابعة للدفع',
    'order.success': 'تم الطلب بنجاح!',
    'order.number': 'رقم الطلب',
    'order.download': 'تحميل PDF',
    'order.email': 'تم إرسال تأكيد إلى بريدك الإلكتروني',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

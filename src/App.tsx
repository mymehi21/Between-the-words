import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CheckoutModal, CustomerInfo } from './components/CheckoutModal';
import { OrderSuccess } from './components/OrderSuccess';
import { AdminLogin } from './components/AdminLogin';
import { NewAdminDashboard } from './components/NewAdminDashboard';
import { PasswordChangeModal } from './components/PasswordChangeModal';
import { HomePage } from './pages/HomePage';
import { BooksPage } from './pages/BooksPage';
import { AboutPage } from './pages/AboutPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { ContactPage } from './pages/ContactPage';
import { Book, supabase } from './lib/supabase';

function ProtectedAdminRoute() {
  const { user, loading, isApprovedAdmin, needsPasswordChange, checkPasswordChangeStatus } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin />;
  }

  if (!isApprovedAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-6 text-6xl">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Pending</h2>
          <p className="text-gray-700 mb-6">
            Your admin access is pending approval. Please contact the site administrator.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <NewAdminDashboard />
      {needsPasswordChange && (
        <PasswordChangeModal onPasswordChanged={checkPasswordChangeStatus} />
      )}
    </>
  );
}

function PublicLayout() {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [orderType, setOrderType] = useState<'pdf' | 'physical' | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');

  const handleBookSelect = (book: Book, type: 'pdf' | 'physical') => {
    setSelectedBook(book);
    setOrderType(type);
    setShowCheckout(true);
  };

  const handleCheckout = async (customerInfo: CustomerInfo) => {
    if (!selectedBook || !orderType) return;

    const generatedOrderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const amount = orderType === 'pdf' ? selectedBook.pdf_price : selectedBook.physical_price;

    try {
      const { error } = await supabase.from('orders').insert([
        {
          order_number: generatedOrderNumber,
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          customer_phone: customerInfo.phone,
          customer_address: orderType === 'physical' ? customerInfo.address : '',
          book_id: selectedBook.id,
          order_type: orderType,
          amount: amount,
          status: 'pending',
        },
      ]);

      if (error) throw error;

      setOrderNumber(generatedOrderNumber);
      if (orderType === 'pdf' && selectedBook.pdf_url) {
        setPdfUrl(selectedBook.pdf_url);
      }
      setShowCheckout(false);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error processing order. Please try again.');
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    setSelectedBook(null);
    setOrderType(null);
    setOrderNumber('');
    setPdfUrl('');
  };

  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/books" element={<BooksPage onBookSelect={handleBookSelect} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />

      {showCheckout && (
        <CheckoutModal
          book={selectedBook}
          orderType={orderType}
          onClose={() => {
            setShowCheckout(false);
            setSelectedBook(null);
            setOrderType(null);
          }}
          onCheckout={handleCheckout}
        />
      )}

      {showSuccess && (
        <OrderSuccess
          orderNumber={orderNumber}
          pdfUrl={pdfUrl}
          onClose={handleCloseSuccess}
        />
      )}
    </>
  );
}

function MainContent() {
  return (
    <Routes>
      <Route path="/admin" element={<ProtectedAdminRoute />} />
      <Route path="/*" element={<PublicLayout />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <MainContent />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

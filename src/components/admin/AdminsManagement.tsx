import { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase, ApprovedEmail } from '../../lib/supabase';

interface AdminsManagementProps {
  language: string;
}

interface SignupRequest {
  id: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
}

export function AdminsManagement({ language }: AdminsManagementProps) {
  const [approvedEmails, setApprovedEmails] = useState<ApprovedEmail[]>([]);
  const [signupRequests, setSignupRequests] = useState<SignupRequest[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadApprovedEmails(), loadSignupRequests()]);
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

  const loadSignupRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('signup_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (error) throw error;
      setSignupRequests(data || []);
    } catch (error) {
      console.error('Error loading signup requests:', error);
    }
  };

  const handlePreApprove = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('approved_emails')
        .insert([{
          email: newEmail,
          is_active: true
        }]);

      if (error) {
        if (error.code === '23505') {
          alert('This email is already pre-approved');
        } else {
          throw error;
        }
      } else {
        setNewEmail('');
        await loadApprovedEmails();
        alert('Email pre-approved! User can now create their account and it will be auto-approved.');
      }
    } catch (error) {
      console.error('Error pre-approving email:', error);
      alert('Error pre-approving email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (request: SignupRequest) => {
    if (!confirm(`Approve signup request for ${request.email}?\n\nThey will be notified to create their account at /admin with their chosen password.`)) {
      return;
    }

    setProcessing(request.id);
    try {
      const { error: approvedEmailError } = await supabase
        .from('approved_emails')
        .insert([{
          email: request.email,
          approved_by: (await supabase.auth.getUser()).data.user?.id || 'admin',
          is_active: true
        }]);

      if (approvedEmailError && approvedEmailError.code !== '23505') {
        throw approvedEmailError;
      }

      const { error: updateError } = await supabase
        .from('signup_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', request.id);

      if (updateError) throw updateError;

      await loadData();
      alert(`Request approved!\n\nEmail: ${request.email}\n\nThe user can now go to /admin and create their account with this email. Their account will be automatically approved.`);
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Error approving request. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectRequest = async (request: SignupRequest) => {
    if (!confirm(`Reject signup request for ${request.email}?`)) {
      return;
    }

    setProcessing(request.id);
    try {
      const { error } = await supabase
        .from('signup_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          rejection_reason: null
        })
        .eq('id', request.id);

      if (error) throw error;
      await loadSignupRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Error rejecting request. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this request?')) return;

    try {
      const { error } = await supabase
        .from('signup_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadSignupRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
      alert('Error deleting request.');
    }
  };

  const handleRemovePreApproval = async (id: string, email: string) => {
    if (!confirm(`Remove pre-approval for ${email}?`)) return;

    try {
      const { error } = await supabase
        .from('approved_emails')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadApprovedEmails();
    } catch (error) {
      console.error('Error removing pre-approval:', error);
      alert('Error removing pre-approval');
    }
  };

  const pendingRequests = signupRequests.filter(r => r.status === 'pending');
  const reviewedRequests = signupRequests.filter(r => r.status !== 'pending');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {language === 'ar' ? 'إدارة المسؤولين' : 'Admins Management'}
        </h2>

        <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
          <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            {language === 'ar' ? 'الموافقة المسبقة على البريد الإلكتروني' : 'Pre-Approve Email'}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {language === 'ar'
              ? 'أضف بريدًا إلكترونيًا هنا قبل أن يقوم المستخدم بإنشاء حساب. سيتم الموافقة على حسابه تلقائيًا.'
              : 'Add an email here BEFORE the user creates an account. Their account will be auto-approved when they sign up.'}
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="email@example.com"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              onClick={handlePreApprove}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2 font-semibold"
            >
              <Plus className="w-5 h-5" />
              {language === 'ar' ? 'موافقة مسبقة' : 'Pre-Approve'}
            </button>
          </div>
        </div>

        {pendingRequests.length > 0 && (
          <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              {language === 'ar' ? 'طلبات الانضمام المعلقة' : 'Pending Signup Requests'} ({pendingRequests.length})
            </h3>
            <div className="space-y-3">
              {pendingRequests.map(request => (
                <div key={request.id} className="bg-white rounded-lg p-4 flex items-center justify-between shadow-sm">
                  <div>
                    <div className="font-semibold text-gray-900">{request.email}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Requested: {new Date(request.requested_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveRequest(request)}
                      disabled={processing === request.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2 font-semibold"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request)}
                      disabled={processing === request.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2 font-semibold"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {language === 'ar' ? 'البريد الإلكتروني المعتمد مسبقًا' : 'Pre-Approved Emails'}
          </h3>
          <div className="space-y-3">
            {approvedEmails.map((email) => (
              <div key={email.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{email.email}</p>
                  <p className="text-sm text-gray-500">
                    {language === 'ar' ? 'تمت الموافقة في' : 'Pre-approved on'}: {new Date(email.approved_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleRemovePreApproval(email.id, email.email)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove pre-approval"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            {approvedEmails.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                {language === 'ar' ? 'لا يوجد بريد إلكتروني معتمد مسبقًا' : 'No pre-approved emails yet'}
              </p>
            )}
          </div>
        </div>

        {reviewedRequests.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {language === 'ar' ? 'الطلبات التي تمت مراجعتها' : 'Reviewed Requests'} ({reviewedRequests.length})
            </h3>
            <div className="space-y-3">
              {reviewedRequests.map(request => (
                <div key={request.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {request.status === 'approved' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="font-medium text-gray-700">{request.email}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        request.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Reviewed: {request.reviewed_at ? new Date(request.reviewed_at).toLocaleString() : 'N/A'}
                    </div>
                    {request.rejection_reason && (
                      <div className="text-sm text-gray-600 mt-1">
                        Reason: {request.rejection_reason}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteRequest(request.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

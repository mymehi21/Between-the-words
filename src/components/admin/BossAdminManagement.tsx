import { useState, useEffect } from 'react';
import { UserPlus, Shield, Trash2, RefreshCw, Mail, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Admin {
  id: string;
  user_id: string;
  email: string;
  is_active: boolean;
  is_boss: boolean;
  needs_password_change: boolean;
  created_at: string;
}

interface BossAdminManagementProps {
  language: string;
}

const DEFAULT_PASSWORD = 'Books123';

export function BossAdminManagement({ language }: BossAdminManagementProps) {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdmins(data || []);
    } catch (error) {
      console.error('Error loading admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      const { data: existingApproved } = await supabase
        .from('approved_emails')
        .select('*')
        .eq('email', newAdminEmail)
        .maybeSingle();

      if (existingApproved) {
        setError(language === 'ar' ? 'هذا البريد الإلكتروني موجود بالفعل' : 'This email already exists');
        setProcessing(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-admins?action=create`;
      console.log('Calling edge function:', apiUrl);
      console.log('Email:', newAdminEmail);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newAdminEmail,
          password: DEFAULT_PASSWORD
        })
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response body:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add admin');
      }

      setSuccess(language === 'ar'
        ? `تمت إضافة المسؤول! كلمة المرور الافتراضية: ${DEFAULT_PASSWORD}`
        : `Admin added! Default password: ${DEFAULT_PASSWORD}`);
      setNewAdminEmail('');
      await loadAdmins();
    } catch (err: any) {
      setError(err.message || (language === 'ar' ? 'خطأ في إضافة المسؤول' : 'Error adding admin'));
    } finally {
      setProcessing(false);
    }
  };

  const handleResetPassword = async (adminId: string, email: string) => {
    if (!confirm(`Reset password for ${email} to default password "${DEFAULT_PASSWORD}"?`)) return;

    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-admins?action=reset-password`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: adminId,
          password: DEFAULT_PASSWORD
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reset password');
      }

      setSuccess(`Password reset for ${email}. New password: ${DEFAULT_PASSWORD}`);
      await loadAdmins();
    } catch (err: any) {
      setError(err.message || 'Error resetting password');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string, email: string) => {
    if (!confirm(`Delete admin ${email}? This action cannot be undone.`)) return;

    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-admins?action=delete`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: adminId,
          email: email
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete admin');
      }

      setSuccess(`Admin ${email} deleted successfully`);
      await loadAdmins();
    } catch (err: any) {
      setError(err.message || 'Error deleting admin');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Shield className="w-7 h-7 text-amber-700" />
          {language === 'ar' ? 'إدارة المسؤولين' : 'Admin Management'}
        </h2>

        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            {language === 'ar' ? 'إضافة مسؤول جديد' : 'Add New Admin'}
          </h3>

          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>{language === 'ar' ? 'كلمة المرور الافتراضية:' : 'Default Password:'}</strong> {DEFAULT_PASSWORD}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {language === 'ar'
                  ? 'سيُطلب من المسؤول الجديد تغيير كلمة المرور عند تسجيل الدخول الأول'
                  : 'The new admin will be required to change this password upon first login'}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={processing}
              className="w-full px-6 py-3 bg-gradient-to-r from-amber-700 to-orange-600 text-white rounded-lg font-semibold hover:from-amber-800 hover:to-orange-700 transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              {processing ? (language === 'ar' ? 'جاري الإضافة...' : 'Adding...') : (language === 'ar' ? 'إضافة مسؤول' : 'Add Admin')}
            </button>
          </form>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          {language === 'ar' ? 'المسؤولون الحاليون' : 'Current Admins'}
        </h3>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{admin.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {admin.is_boss ? (
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        BOSS
                      </span>
                    ) : (
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        ADMIN
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {admin.needs_password_change ? (
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Needs Password Change
                      </span>
                    ) : (
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {!admin.is_boss && (
                      <>
                        <button
                          onClick={() => handleResetPassword(admin.user_id, admin.email)}
                          disabled={processing}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50 inline-flex items-center gap-1"
                          title="Reset Password"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Reset
                        </button>
                        <button
                          onClick={() => handleDeleteAdmin(admin.user_id, admin.email)}
                          disabled={processing}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 inline-flex items-center gap-1"
                          title="Delete Admin"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

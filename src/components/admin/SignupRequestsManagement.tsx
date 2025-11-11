import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SignupRequest {
  id: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
}

export function SignupRequestsManagement() {
  const [requests, setRequests] = useState<SignupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('signup_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error loading signup requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: SignupRequest) => {
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

      const tempPassword = Math.random().toString(36).slice(-12) + 'Aa1!';

      const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
        email: request.email,
        password: tempPassword,
        email_confirm: true
      });

      if (signUpError) throw signUpError;

      if (signUpData.user) {
        const { error: adminUserError } = await supabase
          .from('admin_users')
          .insert([{
            user_id: signUpData.user.id,
            email: request.email,
            is_active: true,
            approved_by: (await supabase.auth.getUser()).data.user?.id || 'admin'
          }]);

        if (adminUserError && adminUserError.code !== '23505') {
          console.error('Error adding to admin_users:', adminUserError);
        }
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

      await loadRequests();
      alert(`Account approved! Temporary password: ${tempPassword}\nPlease share this with the user securely.`);
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Error approving request. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (request: SignupRequest) => {
    const reason = prompt('Reason for rejection (optional):');

    setProcessing(request.id);
    try {
      const { error } = await supabase
        .from('signup_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          rejection_reason: reason || null
        })
        .eq('id', request.id);

      if (error) throw error;
      await loadRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Error rejecting request. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this request?')) return;

    try {
      const { error } = await supabase
        .from('signup_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
      alert('Error deleting request.');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const reviewedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Pending Signup Requests ({pendingRequests.length})
        </h3>

        {pendingRequests.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
            No pending requests
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map(request => (
              <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="font-medium text-gray-900">{request.email}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Requested: {new Date(request.requested_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(request)}
                    disabled={processing === request.id}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(request)}
                    disabled={processing === request.id}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {reviewedRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Reviewed Requests ({reviewedRequests.length})
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
                  onClick={() => handleDelete(request.id)}
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
  );
}

import { useState, useEffect } from 'react';
import { UserPlus, Check, X, Mail, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SignupRequest {
  id: string;
  email: string;
  full_name: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface NewSignupRequestsManagementProps {
  language: string;
}

export function NewSignupRequestsManagement({ language }: NewSignupRequestsManagementProps) {
  const [requests, setRequests] = useState<SignupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('signup_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error loading signup requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (requestId: string, email: string, fullName: string) => {
    if (!confirm(`Approve signup request for ${fullName} (${email})?`)) return;

    setProcessingId(requestId);
    try {
      const { error: updateError } = await supabase
        .from('signup_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      const { error: insertError } = await supabase
        .from('approved_emails')
        .insert([{ email, full_name: fullName }]);

      if (insertError && insertError.code !== '23505') throw insertError;

      alert(`Signup request approved! ${fullName} can now create an account.`);
      await loadRequests();
    } catch (error: any) {
      console.error('Error approving request:', error);
      alert(`Error approving request: ${error.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const rejectRequest = async (requestId: string, fullName: string) => {
    if (!confirm(`Reject signup request for ${fullName}?`)) return;

    setProcessingId(requestId);
    try {
      const { error } = await supabase
        .from('signup_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      alert('Signup request rejected');
      await loadRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Error rejecting request');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  if (loading) {
    return <div className="text-center py-12">Loading signup requests...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Signup Requests</h2>
        <div className="flex gap-2">
          <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-semibold">
            Pending: {pendingRequests.length}
          </span>
          <span className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg font-semibold">
            Total: {requests.length}
          </span>
        </div>
      </div>

      {pendingRequests.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            Pending Requests
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl shadow-sm border-2 border-yellow-200 p-6 space-y-4">
                <div>
                  <h4 className="font-bold text-xl text-gray-900 mb-2">{request.full_name || 'No Name Provided'}</h4>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-4 h-4 text-amber-600" />
                    <span className="text-sm">{request.email}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Requested: {new Date(request.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => approveRequest(request.id, request.email, request.full_name)}
                    disabled={processingId === request.id}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
                  >
                    <Check className="w-5 h-5" />
                    {processingId === request.id ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => rejectRequest(request.id, request.full_name)}
                    disabled={processingId === request.id}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                    {processingId === request.id ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {processedRequests.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Processed Requests</h3>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {processedRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{request.full_name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{request.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(request.status)}`}>
                        {request.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {requests.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <UserPlus className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">No signup requests yet</p>
        </div>
      )}

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <Mail className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">How it works:</h3>
            <div className="mt-2 text-sm text-blue-700 space-y-1">
              <p>1. Users submit signup requests with their email and name</p>
              <p>2. You approve or reject the request here</p>
              <p>3. Approved users can sign up at /admin using their approved email</p>
              <p>4. They'll set their password during signup and can login immediately</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

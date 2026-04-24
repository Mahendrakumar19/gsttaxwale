'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

interface RedemptionRequest {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    points_wallet: number;
  };
  points_requested: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

export default function AdminRedemptionsPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [requests, setRequests] = useState<RedemptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
          router.push('/auth/login');
          return;
        }

        const user = JSON.parse(userData);
        if (user.role !== 'admin') {
          router.push('/');
          return;
        }

        setAdminUser(user);
        fetchRedemptionRequests(token);
      } catch (err) {
        console.error('Auth check failed:', err);
      }
    };

    checkAdmin();
  }, [router]);

  const fetchRedemptionRequests = async (token: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/admin/redeem-requests`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const response = await res.json();
        const requestsList = response.data?.requests || response.requests || [];
        setRequests(requestsList);
        console.log('Redemption requests fetched:', requestsList.length);
      } else {
        console.error('Failed to fetch requests, status:', res.status);
        setRequests([]);
      }
    } catch (err) {
      console.error('Failed to fetch redemption requests:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    if (!window.confirm('Approve this redemption request?')) return;

    try {
      setProcessingId(requestId);
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const res = await fetch(`${baseUrl}/api/admin/redeem-requests/${requestId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          approved: true,
          reason: 'Approved by admin',
        }),
      });

      if (res.ok) {
        alert('Redemption request approved successfully');
        fetchRedemptionRequests(token!);
      } else {
        const error = await res.json();
        alert(`Failed to approve: ${error.message}`);
      }
    } catch (err) {
      console.error('Approval error:', err);
      alert('An error occurred during approval');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!window.confirm('Reject this redemption request?')) return;

    try {
      setProcessingId(requestId);
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const res = await fetch(`${baseUrl}/api/admin/redeem-requests/${requestId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          approved: false,
          reason: 'Rejected by admin',
        }),
      });

      if (res.ok) {
        alert('Redemption request rejected successfully');
        fetchRedemptionRequests(token!);
      } else {
        const error = await res.json();
        alert(`Failed to reject: ${error.message}`);
      }
    } catch (err) {
      console.error('Rejection error:', err);
      alert('An error occurred during rejection');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
            <Clock size={14} />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <CheckCircle size={14} />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            <XCircle size={14} />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (filterStatus === 'all') return true;
    return req.status === filterStatus;
  });

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!adminUser) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/admin" className="text-xl font-bold text-blue-600 hover:text-blue-700">
            ← Admin Dashboard
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <AlertCircle size={32} className="text-blue-600" />
            Redemption Requests
          </h1>
          <p className="text-gray-600">Manage user point redemption requests</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-4">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-3 font-medium border-b-2 transition ${
                  filterStatus === status
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status === 'all' && ` (${requests.length})`}
                {status === 'pending' && ` (${requests.filter((r) => r.status === 'pending').length})`}
                {status === 'approved' && ` (${requests.filter((r) => r.status === 'approved').length})`}
                {status === 'rejected' && ` (${requests.filter((r) => r.status === 'rejected').length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Requests Table */}
        {filteredRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Points</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Reason</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Requested</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{request.user.name}</p>
                        <p className="text-sm text-gray-600">{request.user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-semibold text-gray-900">{request.points_requested}</p>
                        <p className="text-gray-600">Balance: {request.user.points_wallet}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{request.reason}</td>
                    <td className="px-6 py-4">{getStatusBadge(request.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveRequest(request.id)}
                            disabled={processingId === request.id}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded text-sm font-medium transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            disabled={processingId === request.id}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded text-sm font-medium transition"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {request.status !== 'pending' && (
                        <span className="text-gray-500 text-sm">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No redemption requests found</p>
          </div>
        )}
      </div>
    </div>
  );
}

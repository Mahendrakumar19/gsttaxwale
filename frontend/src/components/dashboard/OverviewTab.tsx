'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, FileText, CheckCircle, AlertCircle, Clock, ShieldCheck, Download, ExternalLink } from 'lucide-react';
import api from '@/lib/api';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  pan: string;
  filingStatus: string;
  gstin?: string;
}

export default function OverviewTab() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // First try session storage
      const storedUser = sessionStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser({
          name: parsed.name || 'N/A',
          email: parsed.email || 'N/A',
          phone: parsed.phone || 'N/A',
          pan: parsed.pan || 'N/A',
          filingStatus: parsed.filingStatus || 'Under Review',
          gstin: parsed.gstin || 'Pending',
        });
      }

      // Then refresh from API
      const response = await api.get('/api/auth/profile');
      if (response.data?.data) {
        const updatedUser = response.data.data;
        setUser({
          name: updatedUser.name || 'N/A',
          email: updatedUser.email || 'N/A',
          phone: updatedUser.phone || 'N/A',
          pan: updatedUser.pan || 'N/A',
          filingStatus: updatedUser.filingStatus || 'Under Review',
          gstin: updatedUser.gstin || 'Pending',
        });
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <div className="w-12 h-12 bg-blue-100 rounded-full mb-4"></div>
        <div className="h-4 w-32 bg-gray-100 rounded"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Compliance Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4">
           <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${
             user.filingStatus === 'Filed' ? 'bg-green-100 text-green-700' : 
             user.filingStatus === 'Rejected' ? 'bg-red-100 text-red-700' :
             user.filingStatus === 'Docs Required' ? 'bg-orange-100 text-orange-700' :
             'bg-blue-100 text-blue-700'
           }`}>
             <ShieldCheck size={14} />
             {user.filingStatus}
           </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center text-white text-4xl font-bold shadow-xl shrink-0">
            {user.name[0].toUpperCase()}
          </div>
          
          <div className="flex-1 space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">{user.name}</h2>
              <p className="text-gray-500 font-medium">Compliance Dashboard • Read-Only View</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <InfoItem icon={Mail} label="Email Address" value={user.email} />
              <InfoItem icon={Phone} label="Mobile Number" value={user.phone} />
              <InfoItem icon={FileText} label="PAN Number" value={user.pan} />
              <InfoItem icon={ShieldCheck} label="GSTIN Status" value={user.gstin || 'N/A'} />
            </div>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatusCard 
          title="Filing Status" 
          status={user.filingStatus} 
          description="Managed by Admin"
          icon={<Clock className="text-blue-600" />}
        />
        <StatusCard 
          title="Documents" 
          status="Available" 
          description="View & Download Only"
          icon={<Download className="text-green-600" />}
        />
        <StatusCard 
          title="Support" 
          status="Active" 
          description="10 AM - 6 PM"
          icon={<CheckCircle className="text-indigo-600" />}
        />
      </div>

      {/* Notice/Alert Section */}
      {user.filingStatus === 'Docs Required' && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex gap-4 items-start">
          <AlertCircle className="text-orange-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-orange-900 text-sm">Action Required: Documents Missing</h4>
            <p className="text-orange-700 text-xs mt-1">Our admin team has requested additional documents to proceed with your filing. Please check the Documents tab or contact support.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function StatusCard({ title, status, description, icon }: { title: string, status: string, description: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition group">
      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
        {icon}
      </div>
      <h4 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</h4>
      <p className="text-lg font-bold text-gray-900 mb-1">{status}</p>
      <p className="text-xs text-gray-400">{description}</p>
    </div>
  );
}

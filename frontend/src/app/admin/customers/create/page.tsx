'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Save, Plus, Trash2, User, Home, 
  CreditCard, Phone, Mail, Calendar, MapPin, 
  Info, Check, Copy, Building2, Landmark
} from 'lucide-react';
import axios from 'axios';
import { adminAuth } from '@/lib/adminAuth';

interface BankDetail {
  accountNo: string;
  ifsc: string;
  bankName: string;
  accountType: string;
}

export default function CreateCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdUser, setCreatedUser] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    pan: '',
    aadhaar: '',
    dateOfBirth: '',
    gender: 'M',
    fatherName: '',
    doorNo: '',
    buildingName: '',
    street: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    referral_code: '',
  });

  const [bankDetails, setBankDetails] = useState<BankDetail[]>([
    { accountNo: '', ifsc: '', bankName: '', accountType: 'Saving' }
  ]);

  const [previewCode, setPreviewCode] = useState('');

  // Auto-generate name and referral code preview
  useEffect(() => {
    const fullName = `${formData.firstName} ${formData.middleName} ${formData.lastName}`.replace(/\s+/g, ' ').trim();
    if (fullName && formData.phone) {
      const namePrefix = formData.firstName.substring(0, 3).toUpperCase();
      const phonePrefix = formData.phone.slice(-3);
      setPreviewCode(`GTW${namePrefix}${phonePrefix}`);
    }
  }, [formData.firstName, formData.phone]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBankChange = (index: number, field: keyof BankDetail, value: string) => {
    const updated = [...bankDetails];
    updated[index] = { ...updated[index], [field]: value };
    setBankDetails(updated);
  };

  const addBank = () => {
    setBankDetails([...bankDetails, { accountNo: '', ifsc: '', bankName: '', accountType: 'Saving' }]);
  };

  const removeBank = (index: number) => {
    if (bankDetails.length > 1) {
      setBankDetails(bankDetails.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const fullName = `${formData.firstName} ${formData.middleName} ${formData.lastName}`.replace(/\s+/g, ' ').trim();
      const token = adminAuth.getAdminToken();
      
      const payload = {
        ...formData,
        name: fullName,
        bankDetails: bankDetails.filter(b => b.accountNo), // Only send non-empty bank details
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://gsttaxwale.com'}/api/admin/users`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCreatedUser(response.data.data);
      setSuccess(true);
      window.scrollTo(0, 0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (success && createdUser) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check size={40} className="text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Customer Created!</h1>
              <p className="text-gray-600 mt-2">Account credentials have been sent to {createdUser.user.email}</p>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Login Credentials</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">Email Address</p>
                      <p className="font-mono font-medium">{createdUser.user.email}</p>
                    </div>
                    <button onClick={() => copyToClipboard(createdUser.user.email, 'email')} className="text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition">
                      {copiedField === 'email' ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">Temporary Password</p>
                      <p className="font-mono font-bold text-lg text-blue-600">{createdUser.credentials.tempPassword}</p>
                    </div>
                    <button onClick={() => copyToClipboard(createdUser.credentials.tempPassword, 'pass')} className="text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition">
                      {copiedField === 'pass' ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => router.push('/admin/customers')}
                  className="flex-1 py-3 px-6 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition shadow-lg"
                >
                  Go to Customers
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="flex-1 py-3 px-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg"
                >
                  Create Another
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top Navigation */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 md:px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Add New Customer</h1>
          </div>
          <button 
            form="customer-form"
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 disabled:opacity-50 transition shadow-lg shadow-blue-200"
          >
            {loading ? 'Processing...' : (
              <>
                <Save size={18} />
                <span>Save Customer</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 mt-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-3">
            <Info size={20} />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <form id="customer-form" onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Basic Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-3">
              <User size={20} className="text-blue-600" />
              <h2 className="font-bold text-gray-900">Basic Information</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">First Name *</label>
                <input 
                  type="text" name="firstName" value={formData.firstName} onChange={handleChange} required
                  placeholder="e.g. Ram"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Middle Name</label>
                <input 
                  type="text" name="middleName" value={formData.middleName} onChange={handleChange}
                  placeholder="e.g. Kumar"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                <input 
                  type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                  placeholder="e.g. Sharma"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Father's Name</label>
                <input 
                  type="text" name="fatherName" value={formData.fatherName} onChange={handleChange}
                  placeholder="Full father's name"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Date of Birth</label>
                <input 
                  type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Gender</label>
                <select 
                  name="gender" value={formData.gender} onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Identifiers */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-3">
              <CreditCard size={20} className="text-blue-600" />
              <h2 className="font-bold text-gray-900">Contact & Identifiers</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input 
                    type="email" name="email" value={formData.email} onChange={handleChange} required
                    placeholder="example@gmail.com"
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input 
                    type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                    placeholder="10-digit mobile number"
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">PAN Number *</label>
                <input 
                  type="text" name="pan" value={formData.pan} onChange={(e) => setFormData({...formData, pan: e.target.value.toUpperCase()})} required
                  placeholder="ABCDE1234F" maxLength={10}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition font-mono uppercase"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Aadhaar Number</label>
                <input 
                  type="text" name="aadhaar" value={formData.aadhaar} onChange={handleChange}
                  placeholder="12-digit Aadhaar number" maxLength={12}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Full Address Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-3">
              <MapPin size={20} className="text-blue-600" />
              <h2 className="font-bold text-gray-900">Full Address</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Door / Flat No</label>
                <input 
                  type="text" name="doorNo" value={formData.doorNo} onChange={handleChange}
                  placeholder="e.g. 101"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Building / Society</label>
                <input 
                  type="text" name="buildingName" value={formData.buildingName} onChange={handleChange}
                  placeholder="e.g. Krishna Tower"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Street / Lane</label>
                <input 
                  type="text" name="street" value={formData.street} onChange={handleChange}
                  placeholder="e.g. MG Road"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Area / Locality</label>
                <input 
                  type="text" name="area" value={formData.area} onChange={handleChange}
                  placeholder="e.g. Andheri East"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                <input 
                  type="text" name="city" value={formData.city} onChange={handleChange}
                  placeholder="City"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">State</label>
                <input 
                  type="text" name="state" value={formData.state} onChange={handleChange}
                  placeholder="State"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">PIN Code</label>
                <input 
                  type="text" name="pincode" value={formData.pincode} onChange={handleChange}
                  placeholder="6-digit PIN" maxLength={6}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Country</label>
                <input 
                  type="text" name="country" value={formData.country} onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Bank Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Landmark size={20} className="text-blue-600" />
                <h2 className="font-bold text-gray-900">Bank Details</h2>
              </div>
              <button 
                type="button" onClick={addBank}
                className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                <Plus size={16} />
                <span>Add Bank</span>
              </button>
            </div>
            <div className="p-6 space-y-6">
              {bankDetails.map((bank, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Account Number</label>
                      <input 
                        type="text" value={bank.accountNo} onChange={(e) => handleBankChange(idx, 'accountNo', e.target.value)}
                        placeholder="Acc No"
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">IFSC Code</label>
                      <input 
                        type="text" value={bank.ifsc} onChange={(e) => handleBankChange(idx, 'ifsc', e.target.value.toUpperCase())}
                        placeholder="IFSC"
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm uppercase font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Bank Name</label>
                      <input 
                        type="text" value={bank.bankName} onChange={(e) => handleBankChange(idx, 'bankName', e.target.value)}
                        placeholder="e.g. SBI"
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Account Type</label>
                      <select 
                        value={bank.accountType} onChange={(e) => handleBankChange(idx, 'accountType', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                      >
                        <option value="Saving">Saving</option>
                        <option value="Current">Current</option>
                        <option value="Salary">Salary</option>
                      </select>
                    </div>
                  </div>
                  {bankDetails.length > 1 && (
                    <button 
                      type="button" onClick={() => removeBank(idx)}
                      className="absolute -right-2 -top-2 bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200 transition shadow-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Referral Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-3">
              <Check size={20} className="text-blue-600" />
              <h2 className="font-bold text-gray-900">Referral Information</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1 w-full">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Referrer Code (Optional)</label>
                  <input 
                    type="text" name="referral_code" value={formData.referral_code} onChange={handleChange}
                    placeholder="If referred by another user"
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition font-mono"
                  />
                  <p className="mt-2 text-xs text-gray-500 italic">User will be linked to referrer if code is valid</p>
                </div>
                <div className="flex-1 w-full p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">This User's New Code</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-blue-900 font-mono">{previewCode || 'GTW...'}</span>
                  </div>
                  <p className="text-[10px] text-blue-500 mt-1">Generated based on name and phone</p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <button 
              type="button" onClick={() => router.back()}
              className="px-8 py-3 text-sm font-bold text-gray-600 hover:text-gray-900 transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-12 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition shadow-xl shadow-blue-200 text-lg"
            >
              {loading ? 'Creating Customer...' : 'Create Customer Account'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

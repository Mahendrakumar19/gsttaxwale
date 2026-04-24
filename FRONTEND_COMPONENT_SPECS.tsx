// ════════════════════════════════════════════════════════════════════════════
// FRONTEND COMPONENTS - GST Dashboard Upgrade
// Location: d:\tax\frontend\src\components\
//
// This file provides component structure, props interfaces, and implementation
// guidelines for the GST Dashboard upgrade.
// ════════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════════
// FILE STRUCTURE TO CREATE
// ════════════════════════════════════════════════════════════════════════════

/*
NEW COMPONENT FILES TO CREATE:

d:\tax\frontend\src\components\
├── Dashboard/
│   ├── DashboardTabs.tsx (NEW - Tab controller)
│   ├── OverviewTab.tsx (Refactored from DashboardBody)
│   ├── FilingsTab.tsx (NEW)
│   ├── DocumentsTab.tsx (NEW)
│   ├── WalletTab.tsx (NEW)
│   └── OrdersTab.tsx (Existing)
│
├── Cards/
│   ├── PlanOverviewCard.tsx (NEW)
│   ├── FilingStatusCard.tsx (NEW)
│   ├── DeadlinesCard.tsx (NEW)
│   ├── DocumentCard.tsx (NEW)
│   ├── WalletCard.tsx (NEW)
│   └── StatCard.tsx (Existing - reuse)
│
├── Tables/
│   ├── FilingsTable.tsx (NEW)
│   ├── DocumentsTable.tsx (NEW)
│   └── OrdersTable.tsx (Existing - move if needed)
│
└── Modals/
    ├── DocumentModal.tsx (NEW - View/Download)
    ├── UpgradePlanModal.tsx (NEW - Plan upgrade)
    └── ...existing modals
*/

// ════════════════════════════════════════════════════════════════════════════
// 1. DashboardTabs.tsx - Main Tab Controller
// ════════════════════════════════════════════════════════════════════════════

/*
'use client';

import React, { useState } from 'react';
import OverviewTab from './OverviewTab';
import FilingsTab from './FilingsTab';
import DocumentsTab from './DocumentsTab';
import WalletTab from './WalletTab';
import OrdersTab from './OrdersTab';

export default function DashboardTabs() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'filings', label: 'Filings', icon: '📋', badge: 'NEW' },
    { id: 'documents', label: 'Documents', icon: '📂', badge: 'NEW' },
    { id: 'wallet', label: 'Wallet', icon: '💰', badge: 'NEW' },
    { id: 'orders', label: 'Orders', icon: '📦' }
  ];

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-gray-300">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium transition ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
            {tab.badge && (
              <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'filings' && <FilingsTab />}
        {activeTab === 'documents' && <DocumentsTab />}
        {activeTab === 'wallet' && <WalletTab />}
        {activeTab === 'orders' && <OrdersTab />}
      </div>
    </div>
  );
}
*/

// ════════════════════════════════════════════════════════════════════════════
// 2. PlanOverviewCard.tsx - GST Plan Display
// ════════════════════════════════════════════════════════════════════════════

/*
'use client';

import React from 'react';

interface Plan {
  id: string;
  planName: string;
  planType: 'gst' | 'itr' | 'combined';
  validity: Date;
  status: 'active' | 'expired' | 'expiring-soon';
  monthlyCost: number;
  features: {
    autoReminders: boolean;
    caAccess: boolean;
    prioritySupport: boolean;
    gstFilingLimit: number;
    itrFilingLimit: number;
    documentLimit: number;
  };
  renewalDate?: Date;
}

interface Props {
  plan: Plan | null;
  onUpgradeClick: () => void;
}

export default function PlanOverviewCard({ plan, onUpgradeClick }: Props) {
  if (!plan) {
    return (
      <div className="bg-white rounded-lg border border-gray-300 p-6">
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No active plan</p>
          <button
            onClick={onUpgradeClick}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  const daysUntilExpiry = Math.ceil(
    (new Date(plan.validity).getTime() - Date.now()) / (1000 * 24 * 60 * 60)
  );

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-300 p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{plan.planName}</h3>
          <p className="text-gray-600">Plan Type: {plan.planType.toUpperCase()}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          plan.status === 'active' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {plan.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded p-4">
          <p className="text-gray-600 text-sm">Monthly Cost</p>
          <p className="text-2xl font-bold text-blue-600">₹{plan.monthlyCost}</p>
        </div>
        <div className="bg-white rounded p-4">
          <p className="text-gray-600 text-sm">Valid Until</p>
          <p className="text-lg font-bold text-gray-900">
            {new Date(plan.validity).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-500">{daysUntilExpiry} days left</p>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-gray-900 font-semibold mb-3">Features</p>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-gray-700">
            <span className="text-green-500">✓</span>
            GST Filings: {plan.features.gstFilingLimit}/month
          </li>
          <li className="flex items-center gap-2 text-gray-700">
            <span className="text-green-500">✓</span>
            Documents: Up to {plan.features.documentLimit}
          </li>
          {plan.features.autoReminders && (
            <li className="flex items-center gap-2 text-gray-700">
              <span className="text-green-500">✓</span>
              Auto Reminders
            </li>
          )}
          {plan.features.caAccess && (
            <li className="flex items-center gap-2 text-gray-700">
              <span className="text-green-500">✓</span>
              CA Access
            </li>
          )}
          {plan.features.prioritySupport && (
            <li className="flex items-center gap-2 text-gray-700">
              <span className="text-green-500">✓</span>
              Priority Support
            </li>
          )}
        </ul>
      </div>

      <button
        onClick={onUpgradeClick}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
      >
        Upgrade Plan
      </button>
    </div>
  );
}
*/

// ════════════════════════════════════════════════════════════════════════════
// 3. FilingStatusCard.tsx - Display Filing Status
// ════════════════════════════════════════════════════════════════════════════

/*
'use client';

import React from 'react';

interface Filing {
  id: string;
  filingType: string;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'filed' | 'rejected';
  daysRemaining: number;
  lastUpdated: Date;
}

interface Props {
  filing: Filing;
}

export default function FilingStatusCard({ filing }: Props) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    in_progress: 'bg-blue-100 text-blue-700',
    filed: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700'
  };

  const getUrgency = (daysRemaining: number) => {
    if (daysRemaining <= 3) return 'high';
    if (daysRemaining <= 7) return 'medium';
    return 'low';
  };

  const urgency = getUrgency(filing.daysRemaining);

  return (
    <div className={`rounded-lg p-4 border ${
      urgency === 'high'
        ? 'border-red-300 bg-red-50'
        : urgency === 'medium'
        ? 'border-yellow-300 bg-yellow-50'
        : 'border-gray-300 bg-white'
    }`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium text-gray-900">{filing.filingType}</p>
          <p className="text-sm text-gray-600">
            Due: {new Date(filing.dueDate).toLocaleDateString()}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          statusColors[filing.status] || statusColors.pending
        }`}>
          {filing.status.replace('_', ' ')}
        </span>
      </div>
      <p className="text-sm text-gray-700 mt-2">
        {filing.daysRemaining > 0
          ? `${filing.daysRemaining} days left`
          : 'Overdue'}
      </p>
    </div>
  );
}
*/

// ════════════════════════════════════════════════════════════════════════════
// 4. DocumentsTable.tsx - List Documents
// ════════════════════════════════════════════════════════════════════════════

/*
'use client';

import React, { useState } from 'react';
import DocumentModal from '../Modals/DocumentModal';

interface Document {
  id: string;
  fileName: string;
  documentType: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: Date;
  status: 'verified' | 'pending' | 'rejected';
  expiryDate?: Date;
}

interface Props {
  documents: Document[];
  isLoading?: boolean;
}

export default function DocumentsTable({ documents, isLoading }: Props) {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  if (isLoading) {
    return <div className="text-center py-6">Loading documents...</div>;
  }

  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-300 p-8 text-center">
        <p className="text-gray-600 mb-4">No documents uploaded yet</p>
        <p className="text-sm text-gray-500">
          Contact your account manager to upload documents
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left px-4 py-3 font-semibold text-gray-900">
                File Name
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">
                Type
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">
                Status
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">
                Expires
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900">{doc.fileName}</td>
                <td className="px-4 py-3 text-gray-600">{doc.documentType}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded ${
                    doc.status === 'verified'
                      ? 'bg-green-100 text-green-700'
                      : doc.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {doc.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {doc.expiryDate
                    ? new Date(doc.expiryDate).toLocaleDateString()
                    : 'N/A'}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setSelectedDoc(doc)}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedDoc && (
        <DocumentModal
          document={selectedDoc}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </>
  );
}
*/

// ════════════════════════════════════════════════════════════════════════════
// 5. WalletCard.tsx - Referral Wallet Display
// ════════════════════════════════════════════════════════════════════════════

/*
'use client';

import React from 'react';

interface Earning {
  date: Date;
  amount: number;
  type: string;
  description: string;
}

interface Wallet {
  balance: number;
  totalEarned: number;
  lastEarnedAt?: Date;
  availableBalance: number;
  recentEarnings: Earning[];
}

interface Props {
  wallet: Wallet | null;
  isLoading?: boolean;
}

export default function WalletCard({ wallet, isLoading }: Props) {
  if (isLoading) {
    return <div className="text-center py-6">Loading wallet...</div>;
  }

  if (!wallet) {
    return <div className="text-center py-6">Wallet not available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <p className="text-sm opacity-90">Available Balance</p>
          <p className="text-3xl font-bold">₹{wallet.availableBalance}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <p className="text-sm opacity-90">Total Earned</p>
          <p className="text-3xl font-bold">₹{wallet.totalEarned}</p>
        </div>
      </div>

      {/* Earnings History */}
      <div className="bg-white rounded-lg border border-gray-300 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Earnings</h3>
        {wallet.recentEarnings.length > 0 ? (
          <div className="space-y-3">
            {wallet.recentEarnings.map((earning, idx) => (
              <div key={idx} className="flex justify-between items-center pb-3 border-b border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">{earning.description}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(earning.date).toLocaleDateString()}
                  </p>
                </div>
                <p className="font-bold text-green-600">+₹{earning.amount}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-4">No earnings yet</p>
        )}
      </div>

      {/* Call to Action */}
      <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
        Refer a Friend & Earn ₹200
      </button>
    </div>
  );
}
*/

// ════════════════════════════════════════════════════════════════════════════
// IMPLEMENTATION GUIDELINES
// ════════════════════════════════════════════════════════════════════════════

/*
1. Create Components in Order:
   Step 1: Create DashboardTabs.tsx (main controller)
   Step 2: Create Card components (self-contained)
   Step 3: Create Table components
   Step 4: Create Modal components
   Step 5: Create Tab components that use above

2. API Integration:
   - Each tab/card should call relevant API endpoint
   - Use useEffect for data fetching
   - Handle loading and error states
   - Add caching to avoid redundant calls

3. Styling:
   - Use Tailwind CSS (existing utility classes)
   - Follow existing color scheme (blue/green/gray)
   - Maintain responsive design
   - Mobile-first approach

4. Performance:
   - Lazy load tab content as needed
   - Memoize components where necessary
   - Optimize API calls
   - Handle edge cases (empty states, errors)

5. Testing:
   - Test each component in isolation
   - Test API integration
   - Test error states
   - Test loading states
   - Test responsive behavior

6. Backwards Compatibility:
   - Keep existing OverviewTab intact
   - Don't modify DashboardBody.tsx directly
   - Import DashboardTabs in dashboard/page.tsx
   - Ensure existing features still work
*/

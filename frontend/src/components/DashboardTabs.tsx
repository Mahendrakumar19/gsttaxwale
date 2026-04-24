'use client';

import { useState } from 'react';
import {
  BarChart3,
  FolderOpen,
  Wallet,
  User,
} from 'lucide-react';
import OverviewTab from './dashboard/OverviewTab';
import DocumentsTab from './dashboard/DocumentsTab';
import WalletTab from './dashboard/WalletTab';
import ProfileTab from './dashboard/ProfileTab';
import ReturnSummary from './ReturnSummary';

type TabType = 'dashboard' | 'returns' | 'documents' | 'wallet' | 'profile';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  component: React.ComponentType<any>;
}

const TABS: Tab[] = [
  {
    id: 'dashboard',
    label: 'Overview',
    icon: <BarChart3 className="w-4 h-4" />,
    component: OverviewTab,
  },
  {
    id: 'returns',
    label: 'Returns',
    icon: <BarChart3 className="w-4 h-4" />,
    component: ReturnSummary,
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: <FolderOpen className="w-4 h-4" />,
    component: DocumentsTab,
  },
  {
    id: 'wallet',
    label: 'Points',
    icon: <Wallet className="w-4 h-4" />,
    component: WalletTab,
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: <User className="w-4 h-4" />,
    component: ProfileTab,
  },
];

export default function DashboardTabs() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const activeTabConfig = TABS.find((tab) => tab.id === activeTab);
  const ActiveComponent = activeTabConfig?.component;

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-white">
        <div className="flex gap-1 px-8 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-5 py-3 font-medium text-sm
                border-b-2 transition-all duration-200 whitespace-nowrap
                ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-8 pb-8">
        {ActiveComponent ? <ActiveComponent /> : null}
      </div>
    </div>
  );
}

'use client';

import { X, Download, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnType: string;
  month: string;
}

export default function DownloadModal({ isOpen, onClose, returnType, month }: DownloadModalProps) {
  const [gstFinancialYear, setGstFinancialYear] = useState('2025-26');
  const [gstPeriod, setGstPeriod] = useState('Apr 25');
  const [incomeFinancialYear, setIncomeFinancialYear] = useState('2025-26');
  const [incomePeriod, setIncomePeriod] = useState('Apr 25');
  const [selectedOthers, setSelectedOthers] = useState<string[]>([]);
  const [downloading, setDownloading] = useState(false);

  const financialYears = ['2024-25', '2025-26', '2026-27'];
  const periods = ['Apr 25', 'May 25', 'Jun 25', 'Jul 25', 'Aug 25', 'Sep 25', 'Oct 25', 'Nov 25', 'Dec 25', 'Jan 26', 'Feb 26', 'Mar 26'];
  
  const othersOptions = [
    { id: 'networth', label: 'Networth Certificate' },
    { id: 'certificateto', label: 'To Certificate' },
    { id: 'gstreg', label: 'GST Reg.' },
    { id: 'fassai', label: 'FASSAI' },
    { id: 'iso', label: 'ISO Certificate' },
    { id: 'license', label: 'Business License' },
  ];

  const toggleOther = (id: string) => {
    setSelectedOthers(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Simulate download
      const documents = [];
      
      if (gstFinancialYear && gstPeriod) {
        documents.push(`GSTR Report - FY ${gstFinancialYear}, Period ${gstPeriod}`);
      }
      
      if (incomeFinancialYear && incomePeriod) {
        documents.push(`Income Tax Report - FY ${incomeFinancialYear}, Period ${incomePeriod}`);
      }
      
      selectedOthers.forEach(id => {
        const doc = othersOptions.find(o => o.id === id);
        if (doc) documents.push(doc.label);
      });

      // Create downloadable content
      const content = `Download Report - ${new Date().toLocaleDateString()}\n\n${documents.join('\n')}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${new Date().getTime()}.txt`;
      link.click();
      window.URL.revokeObjectURL(url);

      onClose();
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download documents');
    } finally {
      setDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Download Documents</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* GST Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">GST</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Financial Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Financial Year</label>
                <div className="relative">
                  <select
                    value={gstFinancialYear}
                    onChange={(e) => setGstFinancialYear(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {financialYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <ChevronDown size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 pointer-events-none" />
                </div>
              </div>

              {/* Period */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
                <div className="relative">
                  <select
                    value={gstPeriod}
                    onChange={(e) => setGstPeriod(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {periods.map(period => (
                      <option key={period} value={period}>{period}</option>
                    ))}
                  </select>
                  <ChevronDown size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Income Tax Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Income Tax</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Financial Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Financial Year</label>
                <div className="relative">
                  <select
                    value={incomeFinancialYear}
                    onChange={(e) => setIncomeFinancialYear(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {financialYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <ChevronDown size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 pointer-events-none" />
                </div>
              </div>

              {/* Period */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
                <div className="relative">
                  <select
                    value={incomePeriod}
                    onChange={(e) => setIncomePeriod(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {periods.map(period => (
                      <option key={period} value={period}>{period}</option>
                    ))}
                  </select>
                  <ChevronDown size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Others Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Others</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {othersOptions.map(option => (
                <label key={option.id} className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type="checkbox"
                    checked={selectedOthers.includes(option.id)}
                    onChange={() => toggleOther(option.id)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
          >
            <Download size={18} />
            {downloading ? 'Downloading...' : 'Download'}
          </button>
        </div>
      </div>
    </div>
  );
}

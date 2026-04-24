'use client';

import { useState } from 'react';
import { Download, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface ReturnData {
  type: string;
  months: {
    [key: string]: { status: 'filed' | 'overdue' | 'due' | 'prepare' | '-'; dueDate?: string };
  };
}

export default function ReturnSummary() {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  // Focus on the most recent 6 months to keep it concise
  const months = ['Oct 25', 'Nov 25', 'Dec 25', 'Jan 26', 'Feb 26', 'Mar 26'];

  const returns: ReturnData[] = [
    {
      type: 'GSTR-1',
      months: {
        'Oct 25': { status: 'filed' },
        'Nov 25': { status: 'filed' },
        'Dec 25': { status: 'filed' },
        'Jan 26': { status: 'filed' },
        'Feb 26': { status: 'filed' },
        'Mar 26': { status: 'overdue', dueDate: 'Apr 11' },
      }
    },
    {
      type: 'GSTR-3B',
      months: {
        'Oct 25': { status: 'filed' },
        'Nov 25': { status: 'filed' },
        'Dec 25': { status: 'filed' },
        'Jan 26': { status: 'filed' },
        'Feb 26': { status: 'filed' },
        'Mar 26': { status: 'due', dueDate: 'Apr 20' },
      }
    },
    {
      type: 'GSTR-9',
      months: {
        'Oct 25': { status: '-' },
        'Nov 25': { status: '-' },
        'Dec 25': { status: '-' },
        'Jan 26': { status: '-' },
        'Feb 26': { status: '-' },
        'Mar 26': { status: 'prepare' },
      }
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'filed': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'overdue': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'due': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'prepare': return <div className="w-3 h-3 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />;
      default: return <span className="text-gray-300">-</span>;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'filed': return 'Filed';
      case 'overdue': return 'Overdue';
      case 'due': return 'Due Soon';
      case 'prepare': return 'Preparing';
      default: return '-';
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Return Status</h2>
          <p className="text-sm text-gray-500">Real-time status of your GST return filings</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-bold shadow-sm">
          <Download size={16} />
          Download Summary
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Return Type</th>
              {months.map(m => (
                <th key={m} className="px-4 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">{m}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {returns.map(ret => (
              <tr key={ret.type} className="hover:bg-gray-50/50 transition">
                <td className="px-6 py-5">
                  <span className="font-bold text-gray-900">{ret.type}</span>
                </td>
                {months.map(m => {
                  const data = ret.months[m];
                  const isHovered = hoveredCell === `${ret.type}-${m}`;
                  return (
                    <td 
                      key={m} 
                      className="px-4 py-5 text-center relative"
                      onMouseEnter={() => setHoveredCell(`${ret.type}-${m}`)}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      <div className="flex flex-col items-center gap-1">
                        {getStatusIcon(data.status)}
                        <span className={`text-[10px] font-bold ${
                          data.status === 'filed' ? 'text-green-600' :
                          data.status === 'overdue' ? 'text-red-600' :
                          data.status === 'due' ? 'text-amber-600' :
                          'text-gray-400'
                        }`}>
                          {getStatusLabel(data.status)}
                        </span>
                      </div>
                      
                      {isHovered && data.dueDate && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 shadow-xl">
                          Due Date: {data.dueDate}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white shadow-sm">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-700">18</p>
            <p className="text-xs text-green-600 font-medium">Filed On-Time</p>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white shadow-sm">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-700">1</p>
            <p className="text-xs text-red-600 font-medium">Overdue Returns</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-sm">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-700">2</p>
            <p className="text-xs text-blue-600 font-medium">Due Next Week</p>
          </div>
        </div>
      </div>
    </div>
  );
}

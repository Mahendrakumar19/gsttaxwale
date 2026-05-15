'use client';

import { useState } from 'react';
import { Download, FileText, ChevronRight, Mail, AlertCircle } from 'lucide-react';

interface ReturnData {
  type: string;
  icon?: 'mail' | 'alert' | null;
  months: {
    [key: string]: { status: 'filed' | 'due' | '-' };
  };
}

export default function ReturnSummary() {
  const [activeView, setActiveView] = useState('new');

  const months = [
    'Apr 25', 'May 25', 'Jun 25', 'Jul 25', 'Aug 25', 'Sep 25', 
    'Oct 25', 'Nov 25', 'Dec 25', 'Jan 26', 'Feb 26', 'Mar 26'
  ];

  const returns: ReturnData[] = [
    {
      type: 'GSTR 1',
      icon: 'mail',
      months: {
        'Apr 25': { status: 'filed' }, 'May 25': { status: 'filed' }, 'Jun 25': { status: 'filed' },
        'Jul 25': { status: 'filed' }, 'Aug 25': { status: 'filed' }, 'Sep 25': { status: 'filed' },
        'Oct 25': { status: 'filed' }, 'Nov 25': { status: 'filed' }, 'Dec 25': { status: 'filed' },
        'Jan 26': { status: 'filed' }, 'Feb 26': { status: 'filed' }, 'Mar 26': { status: 'filed' },
      }
    },
    {
      type: 'GSTR1A',
      months: {
        'Apr 25': { status: '-' }, 'May 25': { status: '-' }, 'Jun 25': { status: '-' },
        'Jul 25': { status: '-' }, 'Aug 25': { status: '-' }, 'Sep 25': { status: '-' },
        'Oct 25': { status: '-' }, 'Nov 25': { status: '-' }, 'Dec 25': { status: '-' },
        'Jan 26': { status: '-' }, 'Feb 26': { status: '-' }, 'Mar 26': { status: '-' },
      }
    },
    {
      type: 'GSTR 3B',
      months: {
        'Apr 25': { status: 'filed' }, 'May 25': { status: 'filed' }, 'Jun 25': { status: 'filed' },
        'Jul 25': { status: 'filed' }, 'Aug 25': { status: 'filed' }, 'Sep 25': { status: 'filed' },
        'Oct 25': { status: 'filed' }, 'Nov 25': { status: 'filed' }, 'Dec 25': { status: 'filed' },
        'Jan 26': { status: 'filed' }, 'Feb 26': { status: 'filed' }, 'Mar 26': { status: 'filed' },
      }
    },
    {
      type: 'GSTR 9',
      icon: 'alert',
      months: {
        'Apr 25': { status: '-' }, 'May 25': { status: '-' }, 'Jun 25': { status: '-' },
        'Jul 25': { status: '-' }, 'Aug 25': { status: '-' }, 'Sep 25': { status: '-' },
        'Oct 25': { status: '-' }, 'Nov 25': { status: '-' }, 'Dec 25': { status: '-' },
        'Jan 26': { status: '-' }, 'Feb 26': { status: '-' }, 'Mar 26': { status: 'due' },
      }
    },
    {
      type: 'GSTR 9C',
      icon: 'alert',
      months: {
        'Apr 25': { status: '-' }, 'May 25': { status: '-' }, 'Jun 25': { status: '-' },
        'Jul 25': { status: '-' }, 'Aug 25': { status: '-' }, 'Sep 25': { status: '-' },
        'Oct 25': { status: '-' }, 'Nov 25': { status: '-' }, 'Dec 25': { status: '-' },
        'Jan 26': { status: '-' }, 'Feb 26': { status: '-' }, 'Mar 26': { status: 'due' },
      }
    }
  ];

  return (
    <div className="w-full bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
      {/* Custom Header with line */}
      <div className="relative px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 z-10 bg-white pr-4">
          <h2 className="text-xl font-bold text-slate-800">Return Summary</h2>
        </div>
        <div className="absolute left-6 right-6 top-1/2 border-t border-slate-200 z-0"></div>
        <button 
          onClick={() => setActiveView(activeView === 'new' ? 'old' : 'new')}
          className="z-10 bg-slate-800 hover:bg-slate-700 text-white px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-2 shadow-lg"
        >
          Switch to {activeView === 'new' ? 'Old' : 'New'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr>
              <th className="px-4 py-4 text-left font-medium text-slate-500 bg-white sticky left-0 z-20 w-32 border-b border-gray-100"></th>
              {months.map(m => (
                <th key={m} className="px-2 py-4 text-center font-semibold text-slate-500 bg-white border-b border-gray-100 min-w-[70px]">
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {returns.map((ret, idx) => (
              <tr key={ret.type} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                <td className="px-4 py-3 font-bold text-slate-600 bg-inherit sticky left-0 z-10 border-b border-gray-100">
                  <div className="flex items-center gap-1">
                    {ret.type}
                    {ret.icon === 'mail' && <Mail size={12} className="text-orange-500" />}
                    {ret.icon === 'alert' && <AlertCircle size={12} className="text-orange-500" />}
                  </div>
                </td>
                {months.map(m => {
                  const data = ret.months[m];
                  return (
                    <td key={m} className="px-1 py-3 text-center border-b border-gray-100">
                      {data.status === 'filed' && (
                        <div className="flex items-center justify-center gap-1 group cursor-pointer">
                          <span className="text-green-600 font-bold">Filed</span>
                          <div className="relative flex items-center">
                            {/* PDF Styled Icon */}
                            <div className="bg-red-500 text-white p-0.5 rounded-[1px] flex items-center justify-center transform group-hover:scale-110 transition shadow-sm">
                              <FileText size={10} />
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5 shadow-sm hidden group-hover:block">
                              <Download size={8} className="text-blue-600" />
                            </div>
                          </div>
                        </div>
                      )}
                      {data.status === 'due' && (
                        <span className="text-orange-500 font-bold">Due</span>
                      )}
                      {data.status === '-' && (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer info */}
      <div className="p-4 bg-slate-50 border-t border-gray-100 flex items-center justify-between text-[10px] text-slate-500">
        <div className="flex gap-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Filed On Time</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <span>Upcoming / Due</span>
          </div>
        </div>
        <div className="flex items-center gap-1 italic">
          <AlertCircle size={12} className="text-slate-400" />
          <span>Data updated as of today. View detailed report for historical data.</span>
        </div>
      </div>
    </div>
  );
}

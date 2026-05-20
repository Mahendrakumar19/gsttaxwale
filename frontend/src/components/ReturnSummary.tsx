'use client';

import { useState, useMemo } from 'react';
import { Download, FileText, FileSpreadsheet, ImageIcon, FileCode, File, AlertCircle, ChevronDown, CheckCircle2 } from 'lucide-react';

interface Document {
  id: string | number;
  title: string;
  fileName?: string;
  category?: string;
  fiscalYear?: string;
  createdAt: string;
  downloadUrl: string;
  fileSize?: number;
}

interface ReturnSummaryProps {
  documents: Document[];
  onDownload: (downloadUrl: string, fileName: string) => void;
}

export default function ReturnSummary({ documents = [], onDownload }: ReturnSummaryProps) {
  const [selectedFY, setSelectedFY] = useState('2025-26');
  const [activeCategory, setActiveCategory] = useState<'GST' | 'ITR' | 'OTHERS'>('GST');
  const [layoutMode, setLayoutMode] = useState<'matrix' | 'cards' | 'monthly-grid'>('matrix');
  const [downloading, setDownloading] = useState<{ [key: string]: boolean }>({});

  const financialYears = ['2021-22', '2022-23', '2023-24', '2024-25', '2025-26', '2026-27'];

  // Categories row names definition
  const rowNames = {
    GST: ['GSTR 1', 'GSTR 1A', 'GSTR 3B', 'GSTR 9', 'GSTR 9C'],
    ITR: ['ITR-1', 'ITR-2', 'ITR-3', 'ITR-4', 'Computation'],
    OTHERS: ['Challan', 'Receipt', 'Audit Report', 'Other Document']
  };

  // Generate the columns dynamically based on the selected financial year (Apr to Mar)
  const months = useMemo(() => {
    const [startYearStr] = selectedFY.split('-');
    const startYear = parseInt(startYearStr);
    const endYear = startYear + 1;
    const shortStart = startYearStr.substring(2);
    const shortEnd = endYear.toString().substring(2);

    return [
      { label: `Apr ${shortStart}`, monthIndex: 3, year: startYear },
      { label: `May ${shortStart}`, monthIndex: 4, year: startYear },
      { label: `Jun ${shortStart}`, monthIndex: 5, year: startYear },
      { label: `Jul ${shortStart}`, monthIndex: 6, year: startYear },
      { label: `Aug ${shortStart}`, monthIndex: 7, year: startYear },
      { label: `Sep ${shortStart}`, monthIndex: 8, year: startYear },
      { label: `Oct ${shortStart}`, monthIndex: 9, year: startYear },
      { label: `Nov ${shortStart}`, monthIndex: 10, year: startYear },
      { label: `Dec ${shortStart}`, monthIndex: 11, year: startYear },
      { label: `Jan ${shortEnd}`, monthIndex: 0, year: endYear },
      { label: `Feb ${shortEnd}`, monthIndex: 1, year: endYear },
      { label: `Mar ${shortEnd}`, monthIndex: 2, year: endYear }
    ];
  }, [selectedFY]);

  // Helper to extract the file extension and format name
  const getDownloadFileName = (doc: Document) => {
    if (!doc.fileName) return doc.title || 'document.pdf';
    const ext = doc.fileName.includes('.') 
      ? doc.fileName.substring(doc.fileName.lastIndexOf('.')) 
      : '.pdf';
    
    if (doc.title && doc.title.toLowerCase().endsWith(ext.toLowerCase())) {
      return doc.title;
    }
    if (doc.title) {
      return `${doc.title}${ext}`;
    }
    return doc.fileName;
  };

  // Helper to get the correct icon for file extension
  const getFileIcon = (fileName?: string) => {
    if (!fileName) return <FileText size={15} className="text-red-500" />;
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') {
      return <FileText size={15} className="text-red-500" />;
    } else if (['xlsx', 'xls', 'csv'].includes(ext || '')) {
      return <FileSpreadsheet size={15} className="text-emerald-600" />;
    } else if (['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(ext || '')) {
      return <ImageIcon size={15} className="text-blue-500" />;
    } else if (['zip', 'rar', '7z'].includes(ext || '')) {
      return <FileCode size={15} className="text-purple-500" />;
    } else {
      return <File size={15} className="text-gray-500" />;
    }
  };

  // Find document corresponding to a row and month
  const findDocForCell = (rowName: string, month: { monthIndex: number; year: number }) => {
    return documents.find((doc) => {
      // 1. Check normalized Category Match
      const docCat = doc.category?.toUpperCase() || 'OTHERS';
      let isCatMatch = false;
      if (activeCategory === 'GST') {
        isCatMatch = docCat === 'GST';
      } else if (activeCategory === 'ITR') {
        isCatMatch = docCat === 'ITR';
      } else {
        isCatMatch = docCat !== 'GST' && docCat !== 'ITR';
      }
      if (!isCatMatch) return false;

      // 2. Check normalized FY Match
      const docFY = doc.fiscalYear?.replace(/\s/g, '').replace('FY', '') || '';
      const selectedFYNorm = selectedFY.replace(/\s/g, '').replace('FY', '') || '';
      if (docFY !== selectedFYNorm && doc.fiscalYear !== selectedFY) return false;

      // 3. Row type match (e.g. check if doc title contains row name like "GSTR 1")
      const titleNorm = (doc.title || doc.fileName || '').toLowerCase();
      const rowNorm = rowName.toLowerCase().replace(/\s/g, '');
      const hasRowName = titleNorm.replace(/\s/g, '').includes(rowNorm);
      if (!hasRowName) return false;

      // 4. Month match (check if createdAt month and year match OR name matches month)
      const docDate = new Date(doc.createdAt);
      const docMonth = docDate.getMonth();
      const docYear = docDate.getFullYear();
      
      const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
      const monthShorts = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const hasMonthInTitle = titleNorm.includes(monthNames[month.monthIndex]) || titleNorm.includes(monthShorts[month.monthIndex]);

      return (docMonth === month.monthIndex && docYear === month.year) || hasMonthInTitle;
    });
  };

  // Calculate status for empty cells
  const getCellStatus = (rowName: string, month: { monthIndex: number; year: number }) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    const colValue = month.year * 12 + month.monthIndex;
    const curValue = currentYear * 12 + currentMonth;

    if (colValue < curValue) {
      if (['GSTR 1', 'GSTR 3B', 'ITR-1', 'Computation'].includes(rowName)) {
        return { text: 'Overdue', color: 'text-red-500 font-semibold' };
      }
      return { text: '-', color: 'text-gray-300' };
    } else if (colValue === curValue) {
      if (rowName === 'GSTR 1A') {
        return { text: 'Prepare', color: 'text-blue-500 font-semibold cursor-pointer hover:underline' };
      }
      if (['GSTR 1', 'GSTR 3B', 'ITR-1', 'Computation'].includes(rowName)) {
        return { text: 'Due', color: 'text-amber-500 font-semibold' };
      }
      return { text: 'Due', color: 'text-amber-500 font-semibold' };
    } else {
      if (['GSTR 9', 'GSTR 9C'].includes(rowName) && month.monthIndex === 2) {
        return { text: 'Due', color: 'text-amber-500 font-semibold' };
      }
      return { text: '-', color: 'text-gray-300' };
    }
  };

  const handleDownloadClick = async (doc: Document) => {
    const fileKey = `${doc.id}`;
    setDownloading((prev) => ({ ...prev, [fileKey]: true }));
    try {
      const fileName = getDownloadFileName(doc);
      await onDownload(doc.downloadUrl, fileName);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading((prev) => ({ ...prev, [fileKey]: false }));
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-blue-100 shadow-sm p-4 sm:p-6">
      {/* Top Filter and Actions Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        {/* Dropdowns */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category:</span>
            <div className="relative">
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value as any)}
                className="appearance-none pl-4 pr-10 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors"
              >
                <option value="GST">GST Returns</option>
                <option value="ITR">Income Tax Returns (ITR)</option>
                <option value="OTHERS">Other compliance files</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Financial Year:</span>
            <div className="relative">
              <select
                value={selectedFY}
                onChange={(e) => setSelectedFY(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors"
              >
                {financialYears.map((fy) => (
                  <option key={fy} value={fy}>
                    FY {fy}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Switch View Trigger */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
          <span className="text-xs font-bold text-gray-400">Layout:</span>
          <div className="bg-gray-100 p-0.5 rounded-lg flex">
            <button
              onClick={() => setLayoutMode('matrix')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                layoutMode === 'matrix' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Filing Matrix
            </button>
            <button
              onClick={() => setLayoutMode('monthly-grid')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                layoutMode === 'monthly-grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Monthly Grid
            </button>
            <button
              onClick={() => setLayoutMode('cards')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                layoutMode === 'cards' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Cards Grid
            </button>
          </div>
        </div>
      </div>

      {/* MATRIX TABLE LAYOUT MATCHING SCREENSHOT */}
      {layoutMode === 'matrix' && (
        <fieldset className="border border-blue-200/80 rounded-2xl p-4 sm:p-6 bg-white relative">
          <legend className="px-3 font-bold text-blue-900 text-lg ml-4">
            Return Summary
          </legend>
          
          

          <div className="overflow-x-auto w-full mt-2 scrollbar-thin">
            <table className="w-full min-w-[1000px] border-collapse text-left">
              <thead>
                <tr className="border-b border-blue-100 bg-blue-50/30">
                  <th className="py-3 px-4 text-xs font-bold text-gray-900 border-r border-blue-100/50 w-[120px]">
                    Form Type
                  </th>
                  {months.map((month) => (
                    <th key={month.label} className="py-3 px-2 text-center text-xs font-bold text-gray-600">
                      {month.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rowNames[activeCategory].map((rowName) => (
                  <tr key={rowName} className="border-b border-gray-100 hover:bg-gray-50/40 transition">
                    <td className="py-3.5 px-4 text-xs font-bold text-gray-800 border-r border-blue-100/50 bg-gray-50/20">
                      {rowName}
                    </td>
                    {months.map((month) => {
                      const cellDoc = findDocForCell(rowName, month);
                      const isDownloading = cellDoc ? !!downloading[`${cellDoc.id}`] : false;

                      return (
                        <td key={month.label} className="py-3.5 px-2 text-center text-xs border-r border-gray-100/50 last:border-r-0">
                          {cellDoc ? (
                            <div className="flex flex-col items-center justify-center gap-1 group">
                              <span className="text-emerald-600 font-bold flex items-center justify-center gap-1 text-[11px]">
                                Filed
                              </span>
                              <button
                                onClick={() => handleDownloadClick(cellDoc)}
                                disabled={isDownloading}
                                className="p-1 hover:bg-blue-50 border border-blue-100/50 rounded text-blue-600 transition flex items-center justify-center shadow-sm bg-white"
                                title={`Download: ${getDownloadFileName(cellDoc)}`}
                              >
                                {isDownloading ? (
                                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <>
                                    {getFileIcon(cellDoc.fileName)}
                                    <Download size={11} className="ml-1 text-gray-500 group-hover:text-blue-600" />
                                  </>
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className={getCellStatus(rowName, month).color}>
                              {getCellStatus(rowName, month).text}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </fieldset>
      )}

      {/* MONTH-WISE COMPLIANCE GRID VIEW */}
      {layoutMode === 'monthly-grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4 animate-in fade-in duration-200">
          {months.map((m) => {
            const monthDocs = documents.filter((doc) => {
              // 1. Check Category Match
              const docCat = doc.category?.toUpperCase() || 'OTHERS';
              let isCatMatch = false;
              if (activeCategory === 'GST') {
                isCatMatch = docCat === 'GST';
              } else if (activeCategory === 'ITR') {
                isCatMatch = docCat === 'ITR';
              } else {
                isCatMatch = docCat !== 'GST' && docCat !== 'ITR';
              }
              if (!isCatMatch) return false;

              // 2. Check FY Match
              const docFY = doc.fiscalYear?.replace(/\s/g, '').replace('FY', '') || '';
              const selectedFYNorm = selectedFY.replace(/\s/g, '').replace('FY', '') || '';
              if (docFY !== selectedFYNorm && doc.fiscalYear !== selectedFY) return false;

              // 3. Month Match (priority to document.month, fallback to createdAt date month)
              const docMonth = doc.month ? doc.month.trim().toLowerCase() : '';
              const targetMonthName = m.label.split(' ')[0].toLowerCase(); // e.g. "apr"
              
              if (docMonth) {
                return docMonth.startsWith(targetMonthName);
              } else {
                const docDate = new Date(doc.createdAt);
                return docDate.getMonth() === m.monthIndex && docDate.getFullYear() === m.year;
              }
            });

            return (
              <div key={m.label} className="bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all duration-300 rounded-[2rem] p-5 flex flex-col justify-between min-h-[220px]">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <span className="font-extrabold text-sm text-slate-800">{m.label.split(' ')[0]} {m.year}</span>
                    <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                      {monthDocs.length} File(s)
                    </span>
                  </div>
                  
                  <div className="space-y-2.5 max-h-[140px] overflow-y-auto pr-1">
                    {monthDocs.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic py-4 text-center">No uploads for this month</p>
                    ) : (
                      monthDocs.map((doc) => {
                        const isDownloading = !!downloading[`${doc.id}`];
                        return (
                          <div key={doc.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-blue-50/50 transition">
                            <div className="flex items-center gap-2 overflow-hidden flex-1 mr-2">
                              <div className="shrink-0">
                                {getFileIcon(doc.fileName)}
                              </div>
                              <span className="text-[11px] font-bold text-slate-700 truncate" title={doc.title || doc.fileName}>
                                {doc.title || doc.fileName}
                              </span>
                            </div>
                            
                            <button
                              onClick={() => handleDownloadClick(doc)}
                              disabled={isDownloading}
                              className="p-1.5 bg-white border border-slate-200 hover:border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition shrink-0 shadow-sm"
                              title="Download file"
                            >
                              {isDownloading ? (
                                <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Download size={12} className="text-slate-500 hover:text-blue-600" />
                              )}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
                
                <div className="pt-2 text-[9px] text-slate-400 font-bold text-right uppercase tracking-wider">
                  {activeCategory} Compliance
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODERN CARDS LAYOUT */}
      {layoutMode === 'cards' && (
        <div className="mt-4">
          {documents.filter(doc => {
            const docCat = doc.category?.toUpperCase() || 'OTHERS';
            if (activeCategory === 'GST') return docCat === 'GST';
            if (activeCategory === 'ITR') return docCat === 'ITR';
            return docCat !== 'GST' && docCat !== 'ITR';
          }).filter(doc => {
            const docFY = doc.fiscalYear?.replace(/\s/g, '').replace('FY', '') || '';
            const selectedFYNorm = selectedFY.replace(/\s/g, '').replace('FY', '') || '';
            return docFY === selectedFYNorm || doc.fiscalYear === selectedFY;
          }).length === 0 ? (
            <div className="text-center py-12 bg-gray-50 border border-blue-50/50 rounded-2xl">
              <AlertCircle className="mx-auto mb-3 text-gray-400 animate-pulse" size={36} />
              <h3 className="text-sm font-bold text-gray-700">No Documents Found</h3>
              <p className="text-gray-500 text-xs mt-1 max-w-md mx-auto">
                No files shared for {activeCategory} under FY {selectedFY}.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-200">
              {documents
                .filter(doc => {
                  const docCat = doc.category?.toUpperCase() || 'OTHERS';
                  if (activeCategory === 'GST') return docCat === 'GST';
                  if (activeCategory === 'ITR') return docCat === 'ITR';
                  return docCat !== 'GST' && docCat !== 'ITR';
                })
                .filter(doc => {
                  const docFY = doc.fiscalYear?.replace(/\s/g, '').replace('FY', '') || '';
                  const selectedFYNorm = selectedFY.replace(/\s/g, '').replace('FY', '') || '';
                  return docFY === selectedFYNorm || doc.fiscalYear === selectedFY;
                })
                .map((doc) => {
                  const fileKey = `${doc.id}`;
                  const isDownloading = !!downloading[fileKey];
                  const docTitle = doc.title || doc.fileName || 'Untitled Document';
                  
                  return (
                    <div
                      key={doc.id}
                      className="bg-white border border-blue-50 hover:border-blue-300 hover:shadow-md transition-all duration-300 rounded-2xl p-4 flex flex-col justify-between group shadow-sm"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                          {getFileIcon(doc.fileName)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-gray-900 leading-snug truncate" title={docTitle}>
                            {docTitle}
                          </h4>
                          <p className="text-[10px] text-gray-500 truncate mt-0.5" title={doc.fileName}>
                            {doc.fileName}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-3 mt-3">
                        <div className="flex items-center justify-between text-[10px] text-gray-400 mb-3">
                          <span>Size: {formatFileSize(doc.fileSize)}</span>
                          <span>
                            {new Date(doc.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>

                        <button
                          onClick={() => handleDownloadClick(doc)}
                          disabled={isDownloading}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          {isDownloading ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download size={13} />
                              Download File
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Info Footnote */}
      <div className="mt-4 flex items-center gap-1.5 text-[10px] text-gray-400 italic">
        <CheckCircle2 size={12} className="text-emerald-500" />
        <span>Filing updates dynamically sync in real-time as documents are shared. Original format is preserved on download.</span>
      </div>
    </div>
  );
}

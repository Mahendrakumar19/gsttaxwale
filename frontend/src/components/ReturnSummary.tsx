'use client';

import { useState, useMemo } from 'react';
import { Download, FileText, FileSpreadsheet, ImageIcon, FileCode, File, AlertCircle, ChevronDown, CheckCircle2 } from 'lucide-react';

interface Document {
  id: string | number;
  title: string;
  fileName?: string;
  category?: string;
  fiscalYear?: string;
  month?: string | null;
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
  const [layoutMode, setLayoutMode] = useState<'matrix' | 'cards' | 'monthly-grid'>('monthly-grid');
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
    <div className="w-full p-4 bg-white border border-blue-100 shadow-sm rounded-3xl sm:p-6">
      {/* Top Filter and Actions Row */}
      <div className="flex flex-col justify-between gap-4 mb-6 lg:flex-row lg:items-center">
        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">Category:</span>
            <div className="relative">
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value as any)}
                className="py-2 pl-4 pr-10 text-xs font-bold text-gray-800 transition-colors border border-gray-200 appearance-none cursor-pointer bg-gray-50 hover:bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="GST">GST Returns</option>
                <option value="ITR">Income Tax Returns (ITR)</option>
                <option value="OTHERS">Other compliance files</option>
              </select>
              <ChevronDown size={14} className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">Financial Year:</span>
            <div className="relative">
              <select
                value={selectedFY}
                onChange={(e) => setSelectedFY(e.target.value)}
                className="py-2 pl-4 pr-10 text-xs font-bold text-gray-800 transition-colors border border-gray-200 appearance-none cursor-pointer bg-gray-50 hover:bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {financialYears.map((fy) => (
                  <option key={fy} value={fy}>
                    FY {fy}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2" />
            </div>
          </div>
        </div>
      </div>

      {/* MATRIX TABLE LAYOUT MATCHING SCREENSHOT */}
      {layoutMode === 'matrix' && (
        <fieldset className="relative p-4 bg-white border border-blue-200/80 rounded-2xl sm:p-6">
          <legend className="px-3 ml-4 text-lg font-bold text-blue-900">
            Return Summary
          </legend>
          
          

          <div className="w-full mt-2 overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[1000px] border-collapse text-left">
              <thead>
                <tr className="border-b border-blue-100 bg-blue-50/30">
                  <th className="py-3 px-4 text-xs font-bold text-gray-900 border-r border-blue-100/50 w-[120px]">
                    Form Type
                  </th>
                  {months.map((month) => (
                    <th key={month.label} className="px-2 py-3 text-xs font-bold text-center text-gray-600">
                      {month.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rowNames[activeCategory].map((rowName) => (
                  <tr key={rowName} className="transition border-b border-gray-100 hover:bg-gray-50/40">
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
                                className="flex items-center justify-center p-1 text-blue-600 transition bg-white border rounded shadow-sm hover:bg-blue-50 border-blue-100/50"
                                title={`Download: ${getDownloadFileName(cellDoc)}`}
                              >
                                {isDownloading ? (
                                  <div className="w-4 h-4 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
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
        <div className="grid grid-cols-1 gap-6 mt-4 duration-200 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in">
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
              <div
                key={m.label}
                className="flex flex-col justify-between p-2 overflow-hidden transition-all duration-300 bg-white border rounded-lg border-slate-200 hover:border-blue-400 hover:shadow-md"
                style={{ width: '2in', height: '1in' }}
              >
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                    <span className="text-sm font-extrabold text-slate-800">{m.label.split(' ')[0]} {m.year}</span>
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
                          <div key={doc.id} className="flex items-center justify-between p-2 transition rounded-xl bg-slate-50 hover:bg-blue-50/50">
                            <div className="flex items-center flex-1 gap-2 mr-2 overflow-hidden">
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
            <div className="py-12 text-center border bg-gray-50 border-blue-50/50 rounded-2xl">
              <AlertCircle className="mx-auto mb-3 text-gray-400 animate-pulse" size={36} />
              <h3 className="text-sm font-bold text-gray-700">No Documents Found</h3>
              <p className="max-w-md mx-auto mt-1 text-xs text-gray-500">
                No files shared for {activeCategory} under FY {selectedFY}.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 duration-200 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in">
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
                      className="flex flex-col justify-between p-4 transition-all duration-300 bg-white border shadow-sm border-blue-50 hover:border-blue-300 hover:shadow-md rounded-2xl group"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 text-blue-600 transition-colors bg-blue-50 rounded-xl group-hover:bg-blue-100">
                          {getFileIcon(doc.fileName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold leading-snug text-gray-900 truncate" title={docTitle}>
                            {docTitle}
                          </h4>
                          <p className="text-[10px] text-gray-500 truncate mt-0.5" title={doc.fileName}>
                            {doc.fileName}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-gray-100">
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
    
    </div>
  );
}

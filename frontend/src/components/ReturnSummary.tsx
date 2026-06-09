'use client';

import { useState, useMemo } from 'react';
import { Download, FileText, FileSpreadsheet, ImageIcon, FileCode, File, AlertCircle, ChevronDown, Folder, FolderOpen, Layers } from 'lucide-react';

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
  description?: string | null;
  uploadMetadata?: string | null;
}

interface ReturnSummaryProps {
  documents: Document[];
  onDownload: (downloadUrl: string, fileName: string) => void;
}

export default function ReturnSummary({ documents = [], onDownload }: ReturnSummaryProps) {
  const [selectedFY, setSelectedFY] = useState('2025-26');
  const [downloading, setDownloading] = useState<{ [key: string]: boolean }>({});

  interface GroupedBatch {
    batchId: string;
    batchName: string;
    createdAt: string;
    files: Document[];
  }

  const groupedByCategories = useMemo(() => {
    const getGroupedForCategory = (categoryKey: 'GST' | 'ITR' | 'OTHERS') => {
      const filtered = documents.filter((doc) => {
        // 1. Check Category Match
        const docCat = doc.category?.toUpperCase() || 'OTHERS';
        let isCatMatch = false;
        if (categoryKey === 'GST') {
          isCatMatch = docCat === 'GST';
        } else if (categoryKey === 'ITR') {
          isCatMatch = docCat === 'ITR';
        } else {
          isCatMatch = docCat !== 'GST' && docCat !== 'ITR';
        }
        if (!isCatMatch) return false;

        // 2. Check FY Match
        const docFY = doc.fiscalYear?.replace(/\s/g, '').replace('FY', '') || '';
        const selectedFYNorm = selectedFY.replace(/\s/g, '').replace('FY', '') || '';
        return docFY === selectedFYNorm || doc.fiscalYear === selectedFY;
      });

      const groups: { [key: string]: GroupedBatch } = {};
      let ungroupedCounter = 0;

      filtered.forEach((doc) => {
        let batchId = '';
        let batchName = '';

        if (doc.uploadMetadata) {
          try {
            const parsed = JSON.parse(doc.uploadMetadata);
            batchId = parsed.batchId || '';
            batchName = parsed.batchName || '';
          } catch {}
        }

        if (!batchId) {
          if (doc.description) {
            batchId = `desc-${doc.description}-${doc.createdAt.substring(0, 16)}`;
            batchName = doc.description;
          } else {
            batchId = `single-${doc.id || ungroupedCounter++}`;
            batchName = doc.title || doc.fileName || 'Document';
          }
        }

        if (!groups[batchId]) {
          groups[batchId] = {
            batchId,
            batchName: batchName || doc.description || doc.title || 'Grouped Documents',
            createdAt: doc.createdAt,
            files: []
          };
        }
        groups[batchId].files.push(doc);
      });

      return Object.values(groups).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    };

    return {
      GST: getGroupedForCategory('GST'),
      ITR: getGroupedForCategory('ITR'),
      OTHERS: getGroupedForCategory('OTHERS')
    };
  }, [documents, selectedFY]);

  const getMonthBatchesForCategory = (categoryKey: 'GST' | 'ITR' | 'OTHERS', m: { monthIndex: number; year: number; label: string }) => {
    return groupedByCategories[categoryKey].filter((batch) => {
      const firstDoc = batch.files[0];
      if (!firstDoc) return false;
      
      const docMonth = firstDoc.month ? firstDoc.month.trim().toLowerCase() : '';
      const targetMonthName = m.label.split(' ')[0].toLowerCase();
      
      if (docMonth) {
        return docMonth.startsWith(targetMonthName);
      } else {
        const docDate = new Date(firstDoc.createdAt);
        return docDate.getMonth() === m.monthIndex && docDate.getFullYear() === m.year;
      }
    });
  };

  const financialYears = ['2021-22', '2022-23', '2023-24', '2024-25', '2025-26', '2026-27'];

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

      {/* Modern Grouped Folders/Cards View */}
      <fieldset className="relative p-4 bg-white border border-blue-200/80 rounded-3xl sm:p-6">
        <legend className="px-3 ml-4 text-lg font-bold text-blue-900">
          Documents
        </legend>

        {/* GST Compliance Section */}
        <div className="mb-12 mt-6">
          <h3 className="text-sm font-extrabold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2 uppercase tracking-wider">
            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
            GST Compliance (Month-Wise)
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 duration-200 animate-in fade-in">
            {months.map((m) => {
              const monthBatches = getMonthBatchesForCategory('GST', m);

              return (
                <div
                  key={m.label}
                  className="flex flex-col justify-between p-3.5 sm:p-4 transition-all duration-300 bg-white border rounded-2xl border-slate-200 hover:border-blue-400 hover:shadow-md min-h-[175px]"
                >
                  <div>
                    <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
                      <span className="text-sm font-extrabold text-slate-800">{m.label.split(' ')[0]} {m.year}</span>
                      <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                        {monthBatches.length} Item(s)
                      </span>
                    </div>
                    
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {monthBatches.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic py-6 text-center">No uploads for this month</p>
                      ) : (
                        monthBatches.map((batch) => {
                          const isSingle = batch.files.length === 1;
                          if (isSingle) {
                            const doc = batch.files[0];
                            const isDownloading = !!downloading[`${doc.id}`];
                            return (
                              <div key={doc.id} className="flex items-center justify-between p-1.5 sm:p-2 transition rounded-xl bg-slate-50 hover:bg-blue-50/50">
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
                          }

                          // Grouped batch display
                          return (
                            <div key={batch.batchId} className="p-1.5 border border-slate-200/60 rounded-xl bg-slate-50/60 space-y-1">
                              <div className="flex items-center gap-1.5 px-1 py-0.5">
                                <Folder size={13} className="text-blue-500 shrink-0" />
                                <span className="text-[10px] font-black text-slate-700 truncate" title={batch.batchName}>
                                  {batch.batchName}
                                </span>
                              </div>
                              <div className="space-y-1 pl-2 border-l border-slate-200">
                                {batch.files.map((doc) => {
                                  const isDownloading = !!downloading[`${doc.id}`];
                                  return (
                                    <div key={doc.id} className="flex items-center justify-between p-0.5 sm:p-1 hover:bg-blue-50/40 rounded transition">
                                      <div className="flex items-center flex-1 gap-1.5 overflow-hidden">
                                        {getFileIcon(doc.fileName)}
                                        <span className="text-[10px] text-slate-600 truncate font-semibold" title={doc.title || doc.fileName}>
                                          {doc.title || doc.fileName}
                                        </span>
                                      </div>
                                      <button
                                        onClick={() => handleDownloadClick(doc)}
                                        disabled={isDownloading}
                                        className="p-1 hover:text-blue-600 transition"
                                        title="Download file"
                                      >
                                        {isDownloading ? (
                                          <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                          <Download size={10} className="text-slate-400 hover:text-blue-600" />
                                        )}
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-slate-50 text-[9px] text-slate-400 font-bold text-right uppercase tracking-wider">
                    GST Compliance
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ITR Compliance Section */}
        <div className="mb-12">
          <h3 className="text-sm font-extrabold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2 uppercase tracking-wider">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
            Income Tax Returns (ITR)
          </h3>
          {groupedByCategories.ITR.length === 0 ? (
            <div className="py-16 text-center border border-slate-200 bg-slate-50/50 rounded-2xl duration-200 animate-in fade-in">
              <AlertCircle className="mx-auto mb-3 text-slate-400 animate-pulse" size={36} />
              <h3 className="text-sm font-bold text-slate-700">No Documents Found</h3>
              <p className="max-w-md mx-auto mt-1 text-xs text-gray-500">
                No files shared for ITR under FY {selectedFY}.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 duration-200 animate-in fade-in">
              {groupedByCategories.ITR.map((batch) => (
                <div key={batch.batchId} className="bg-white border border-slate-200/80 hover:border-blue-400 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl p-4 sm:p-5 relative overflow-hidden flex flex-col justify-between group">
                  <div>
                    <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition shrink-0">
                          <FolderOpen size={20} className="sm:w-6 sm:h-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-800 leading-snug">{batch.batchName}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                            Uploaded on {new Date(batch.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full h-fit">
                        {batch.files.length} File(s)
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {batch.files.map((doc) => {
                        const isDownloading = !!downloading[`${doc.id}`];
                        return (
                          <div key={doc.id} className="flex items-center justify-between p-2 sm:p-2.5 transition rounded-xl bg-slate-50/50 hover:bg-blue-50/40 border border-slate-100">
                            <div className="flex items-center flex-1 gap-2.5 mr-2 overflow-hidden">
                              {getFileIcon(doc.fileName)}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-700 truncate" title={doc.title || doc.fileName}>
                                  {doc.title || doc.fileName}
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                                  Size: {formatFileSize(doc.fileSize)}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDownloadClick(doc)}
                              disabled={isDownloading}
                              className="p-2 bg-white border border-slate-200 hover:border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition shrink-0 shadow-sm"
                              title="Download file"
                            >
                              {isDownloading ? (
                                <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Download size={13} className="text-slate-500 hover:text-blue-600" />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="pt-4 text-[9px] text-slate-400 font-bold text-right uppercase tracking-wider">
                    Annual compliance
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Other Compliance Section */}
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2 uppercase tracking-wider">
            <span className="w-2.5 h-2.5 bg-purple-500 rounded-full"></span>
            Other Compliance Files
          </h3>
          {groupedByCategories.OTHERS.length === 0 ? (
            <div className="py-16 text-center border border-slate-200 bg-slate-50/50 rounded-2xl duration-200 animate-in fade-in">
              <AlertCircle className="mx-auto mb-3 text-slate-400 animate-pulse" size={36} />
              <h3 className="text-sm font-bold text-slate-700">No Documents Found</h3>
              <p className="max-w-md mx-auto mt-1 text-xs text-gray-500">
                No files shared for general compliance under FY {selectedFY}.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 duration-200 animate-in fade-in">
              {groupedByCategories.OTHERS.map((batch) => (
                <div key={batch.batchId} className="bg-white border border-slate-200/80 hover:border-emerald-400 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl p-4 sm:p-5 relative overflow-hidden flex flex-col justify-between group">
                  <div>
                    <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition shrink-0">
                          <Layers size={20} className="sm:w-6 sm:h-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-800 leading-snug">{batch.batchName}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                            Uploaded on {new Date(batch.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full h-fit">
                        {batch.files.length} File(s)
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {batch.files.map((doc) => {
                        const isDownloading = !!downloading[`${doc.id}`];
                        return (
                          <div key={doc.id} className="flex items-center justify-between p-2 sm:p-2.5 transition rounded-xl bg-slate-50/50 hover:bg-emerald-50/20 border border-slate-100">
                            <div className="flex items-center flex-1 gap-2.5 mr-2 overflow-hidden">
                              {getFileIcon(doc.fileName)}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-700 truncate" title={doc.title || doc.fileName}>
                                  {doc.title || doc.fileName}
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                                  Size: {formatFileSize(doc.fileSize)}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDownloadClick(doc)}
                              disabled={isDownloading}
                              className="p-2 bg-white border border-emerald-200 hover:border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 transition shrink-0 shadow-sm"
                              title="Download file"
                            >
                              {isDownloading ? (
                                <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Download size={13} className="text-slate-500 hover:text-emerald-600" />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="pt-4 text-[9px] text-slate-400 font-bold text-right uppercase tracking-wider">
                    General documents
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </fieldset>
    </div>
  );
}

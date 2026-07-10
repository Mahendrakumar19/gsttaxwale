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
    if (!fileName) return <FileText size={24} className="text-red-500" />;
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') {
      return <FileText size={24} className="text-red-500" />;
    } else if (['xlsx', 'xls', 'csv'].includes(ext || '')) {
      return <FileSpreadsheet size={24} className="text-emerald-600" />;
    } else if (['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(ext || '')) {
      return <ImageIcon size={24} className="text-blue-500" />;
    } else if (['zip', 'rar', '7z'].includes(ext || '')) {
      return <FileCode size={24} className="text-purple-500" />;
    } else {
      return <File size={24} className="text-gray-500" />;
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

  const renderCategoryList = (categoryKey: 'GST' | 'ITR' | 'OTHERS', label: string, colorClass: string) => {
    const batches = groupedByCategories[categoryKey];
    const allFiles = batches.flatMap((batch) => batch.files);

    return (
      <div className="mb-8">
        <h3 className="text-xs font-black text-slate-800 mb-3 border-b pb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
          <span className={`w-2 h-2 ${colorClass} rounded-full`}></span>
          {label}
        </h3>
        {allFiles.length === 0 ? (
          <div className="py-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/30">
            <p className="text-[10px] text-gray-500 italic">No compliance documents available under FY {selectedFY}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-2">
            {allFiles.map((doc) => {
              const isDownloading = !!downloading[`${doc.id}`];
              return (
                <div 
                  key={doc.id} 
                  className="flex flex-col items-center justify-between p-2 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/20 rounded-lg transition relative group text-center min-w-0"
                >
                  <div className="flex flex-col items-center w-full">
                    <div className="shrink-0 mb-1.5">
                      {getFileIcon(doc.fileName)}
                    </div>
                    <span className="text-[10px] font-medium text-slate-700 truncate w-full px-1" title={doc.title || doc.fileName}>
                      {doc.title || doc.fileName}
                    </span>
                    <span className="text-[8px] text-slate-400 mt-0.5">
                      {formatFileSize(doc.fileSize)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDownloadClick(doc)}
                    disabled={isDownloading}
                    className="mt-2 p-1 bg-slate-50 hover:bg-blue-100 hover:text-blue-600 rounded transition shrink-0"
                    title="Download file"
                  >
                    {isDownloading ? (
                      <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Download size={10} className="text-slate-500" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full p-4 bg-white border border-blue-100 shadow-sm rounded-3xl">
      {/* Top Filter and Actions Row */}
      <div className="flex flex-col justify-between gap-4 mb-4 lg:flex-row lg:items-center">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">Financial Year:</span>
            <div className="relative">
              <select
                value={selectedFY}
                onChange={(e) => setSelectedFY(e.target.value)}
                className="py-1.5 pl-3 pr-8 text-[10px] font-bold text-gray-800 transition-colors border border-gray-200 appearance-none cursor-pointer bg-gray-50 hover:bg-gray-100 rounded-lg focus:outline-none"
              >
                {financialYears.map((fy) => (
                  <option key={fy} value={fy}>
                    FY {fy}
                  </option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-2.5 top-1/2" />
            </div>
          </div>
        </div>
      </div>

      {/* Modern Grouped Folders/Cards View */}
      <fieldset className="relative p-3 bg-white border border-slate-200/80 rounded-2x">
        {/* <legend className="px-2 ml-2 text-sm font-bold text-blue-900">
          Documents
        </legend> */}
        <div className="space-y-6 mt-4"> 
          {renderCategoryList('GST', 'GST Returns', 'bg-blue-600')}
          {renderCategoryList('ITR', 'Income Tax Returns (ITR)', 'bg-emerald-600')}
          {renderCategoryList('OTHERS', 'Other Documents', 'bg-purple-600')}
        </div>
      </fieldset>
    </div>
  );
}

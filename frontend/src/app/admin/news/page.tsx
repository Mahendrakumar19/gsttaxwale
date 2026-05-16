'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Trash2, Edit, X, Layout, Clock, Globe } from 'lucide-react';
import api from '@/lib/api';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: string;
  publishDate: string;
}

export default function AdminNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', category: 'Update' });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await api.get('/api/news');
      setNews(response.data.data?.news || []);
    } catch (err) {
      console.error('Failed to fetch news:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/news', formData);
      setShowModal(false);
      setFormData({ title: '', content: '', category: 'Update' });
      fetchNews();
    } catch (err) {
      alert('Failed to save news');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this news item?')) return;
    try {
      await api.delete(`/api/admin/news/${id}`);
      fetchNews();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synchronizing Press Feed...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Announcements</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Monitoring platform-wide compliance alerts, regulatory notices, and media releases</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-bold text-[10px] uppercase tracking-widest shadow-lg active:scale-95"
        >
          <Plus size={14} />
          Initialize Entry
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {news.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 rounded-3xl p-24 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
               <Layout size={24} className="text-slate-200" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No active communications registered</p>
          </div>
        ) : (
          news.map((item) => (
            <div key={item.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-900 transition-all flex flex-col group shadow-sm hover:shadow-xl">
              <div className="p-8 flex-1">
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-2.5 py-1 bg-slate-900 text-white text-[9px] font-bold rounded-lg uppercase tracking-widest">
                    {item.category}
                  </span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 leading-tight tracking-tight">{item.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-3 mb-8 leading-relaxed font-medium">{item.content}</p>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                     <Clock size={12} />
                     {new Date(item.publishDate || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                   </div>
                   <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Decommission Entry"
                   >
                     <Trash2 size={16} />
                   </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="flex items-center justify-between p-10 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Compose Announcement</h2>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-[0.2em]">Public Relations Protocol</p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-3 text-slate-400 hover:text-slate-900 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-slate-200"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-10 space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Composition Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Primary release identifier..."
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-slate-900 transition-all placeholder:text-slate-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Category Classification</label>
                <div className="relative">
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-slate-900 transition-all cursor-pointer appearance-none"
                  >
                    <option value="Update">Institutional Update</option>
                    <option value="Notice">Regulatory Notice</option>
                    <option value="GST">GST Compliance Node</option>
                    <option value="ITR">Income Asset Release</option>
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                    <Globe size={16} />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Article Content</label>
                <textarea
                  required
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Compose institutional update body..."
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-slate-900 transition-all resize-none placeholder:text-slate-300"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 border border-slate-200 text-slate-400 hover:text-slate-900 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95"
                >
                  Commit & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mt-16 text-center">
        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em]">Media Governance Engine • Protocol v3.0-ACTIVE</p>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Eye, EyeOff, Plus, Loader2, Image as ImageIcon } from 'lucide-react';
import api from '@/lib/api';

interface Slider {
  id: number;
  imageUrl: string;
  isActive: boolean;
  order: number;
  alt: string;
}

export default function SliderManagement() {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/sliders');
      if (response.data.success) {
        setSliders(response.data.data.sliders);
      }
    } catch (error) {
      console.error('Failed to fetch sliders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await api.post('/api/admin/sliders', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        setSelectedFile(null);
        setPreviewUrl(null);
        fetchSliders();
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload slider image');
    } finally {
      setUploading(false);
    }
  };

  const toggleSlider = async (id: number, currentStatus: boolean) => {
    try {
      const response = await api.put(`/api/admin/sliders/${id}/toggle`, { active: !currentStatus });
      if (response.data.success) {
        setSliders(prev => prev.map(s => s.id === id ? { ...s, isActive: !currentStatus } : s));
      }
    } catch (error) {
      console.error('Toggle failed:', error);
    }
  };

  const deleteSlider = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this slider?')) return;

    try {
      const response = await api.delete(`/api/admin/sliders/${id}`);
      if (response.data.success) {
        setSliders(prev => prev.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Banner Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage hero section banners and promotional announcements</p>
        </div>
        <div className="hidden md:block px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            Active Display Status: Nominal
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all group">
        {previewUrl ? (
          <div className="space-y-6">
            <div className="relative w-full max-w-2xl mx-auto h-[200px] rounded-lg overflow-hidden border border-slate-200 shadow-sm">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              <button 
                onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                className="absolute top-3 right-3 bg-red-600 text-white p-1.5 rounded-md hover:bg-red-700 shadow-sm transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button 
                onClick={handleUpload}
                disabled={uploading}
                className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                {uploading ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
                {uploading ? 'Processing...' : 'Upload Banner'}
              </button>
              <button 
                onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <label className="cursor-pointer block">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition duration-300 shadow-sm">
              <Upload size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Upload New Banner</h3>
            <p className="text-slate-400 text-xs mb-6">Preferred resolution: 1400x450px (PNG, JPG)</p>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <div className="inline-block px-5 py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition tracking-wider text-[10px] uppercase shadow-sm">
              Select Image File
            </div>
          </label>
        )}
      </div>

      {/* Slider List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-xl border border-slate-200" />
          ))
        ) : sliders.length > 0 ? (
          sliders.map((slider) => (
            <div key={slider.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
              <div className="relative h-36 bg-slate-100">
                <img 
                  src={`${process.env.NEXT_PUBLIC_API_URL || ''}${slider.imageUrl}`} 
                  alt={slider.alt} 
                  className={`w-full h-full object-cover transition-all duration-500 ${!slider.isActive ? 'grayscale opacity-40' : ''}`}
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <button 
                    onClick={() => toggleSlider(slider.id, slider.isActive)}
                    className={`p-1.5 rounded-md backdrop-blur-md border border-white/20 text-white transition-colors ${slider.isActive ? 'bg-green-600/90 hover:bg-green-700' : 'bg-slate-600/90 hover:bg-slate-700'}`}
                    title={slider.isActive ? 'Set Inactive' : 'Set Active'}
                  >
                    {slider.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button 
                    onClick={() => deleteSlider(slider.id)}
                    className="p-1.5 bg-red-600/90 hover:bg-red-700 backdrop-blur-md border border-white/20 text-white rounded-md transition-colors"
                    title="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between border-t border-slate-50">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${slider.isActive ? 'bg-green-500' : 'bg-slate-300'}`} />
                    <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      {slider.isActive ? 'Display Active' : 'Hidden'}
                    </h4>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority Index: {slider.order}</p>
                </div>
                <div className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-300">
                  <ImageIcon size={16} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
             <div className="text-slate-300 mb-3 flex justify-center"><ImageIcon size={40} /></div>
             <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">No Custom Banners</h3>
             <p className="text-xs text-slate-500">System is using default library assets</p>
          </div>
        )}
      </div>
    </div>
  );
}

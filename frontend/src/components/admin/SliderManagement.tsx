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
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">Homepage Slider</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">Manage banners that appear on the homepage hero section</p>
        </div>
        <div className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl w-full sm:w-auto text-center">
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center justify-center sm:justify-start gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            Recommended: Active Banners (3+)
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-4 sm:p-10 text-center hover:border-blue-400 transition-colors group">
        {previewUrl ? (
          <div className="space-y-6">
            <div className="relative w-full max-w-2xl mx-auto h-[160px] sm:h-[200px] rounded-2xl overflow-hidden border-4 border-white shadow-xl">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              <button 
                onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg transition"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={handleUpload}
                disabled={uploading}
                className="bg-blue-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto"
              >
                {uploading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                {uploading ? 'UPLOADING...' : 'CONFIRM & ADD SLIDER'}
              </button>
            </div>
          </div>
        ) : (
          <label className="cursor-pointer block">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition duration-500">
              <Upload size={28} className="sm:size-32" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">Upload New Banner</h3>
            <p className="text-slate-400 text-xs sm:text-sm mb-6">Recommended size: 1400x450px (PNG or JPG)</p>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <div className="inline-block px-5 py-2.5 sm:px-6 sm:py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-blue-600 transition tracking-wide text-[10px] sm:text-xs uppercase w-full sm:w-auto text-center">
              SELECT IMAGE FILE
            </div>
          </label>
        )}
      </div>

      {/* Slider List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          Array(2).fill(0).map((_, i) => (
            <div key={i} className="h-[250px] bg-slate-100 animate-pulse rounded-3xl" />
          ))
        ) : sliders.length > 0 ? (
          sliders.map((slider) => (
            <div key={slider.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition group">
              <div className="relative h-40 bg-slate-900">
                <img 
                  src={`${process.env.NEXT_PUBLIC_API_URL || ''}${slider.imageUrl}`} 
                  alt={slider.alt} 
                  className={`w-full h-full object-cover transition duration-700 ${!slider.isActive ? 'grayscale opacity-50' : ''}`}
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button 
                    onClick={() => toggleSlider(slider.id, slider.isActive)}
                    className={`p-2 rounded-xl backdrop-blur-md border border-white/20 text-white transition ${slider.isActive ? 'bg-green-500/80 hover:bg-green-600' : 'bg-slate-500/80 hover:bg-slate-600'}`}
                    title={slider.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {slider.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                  <button 
                    onClick={() => deleteSlider(slider.id)}
                    className="p-2 bg-red-500/80 hover:bg-red-600 backdrop-blur-md border border-white/20 text-white rounded-xl transition"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="p-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${slider.isActive ? 'bg-green-500' : 'bg-slate-300'}`} />
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tighter">
                      {slider.isActive ? 'Active Slide' : 'Hidden Slide'}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400">Order: {slider.order}</p>
                </div>
                <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300">
                  <ImageIcon size={20} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
             <div className="text-slate-300 mb-4 flex justify-center"><ImageIcon size={48} /></div>
             <p className="text-slate-400 font-medium">No custom sliders uploaded yet. Default banners are currently active.</p>
          </div>
        )}
      </div>
    </div>
  );
}

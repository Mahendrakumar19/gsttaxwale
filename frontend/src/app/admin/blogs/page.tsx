'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Trash2, Edit, X, Layout, Clock, Eye, Check, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

interface BlogItem {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  image: string;
  readTime: string;
  metaTitle: string;
  metaDescription: string;
  tags: string;
  published: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const defaultFormData = {
    title: '',
    excerpt: '',
    content: '',
    category: 'General',
    author: 'GST Tax Wale Team',
    image: '📝',
    readTime: '5 min read',
    metaTitle: '',
    metaDescription: '',
    tags: '',
    published: 1
  };

  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/blogs');
      setBlogs(response.data.data?.blogs || []);
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (blog: BlogItem) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      excerpt: blog.excerpt || '',
      content: blog.content,
      category: blog.category || 'General',
      author: blog.author || 'GST Tax Wale Team',
      image: blog.image || '📝',
      readTime: blog.readTime || '5 min read',
      metaTitle: blog.metaTitle || '',
      metaDescription: blog.metaDescription || '',
      tags: blog.tags || '',
      published: blog.published
    });
    setShowModal(true);
  };

  const handleCreateNew = () => {
    setEditingBlog(null);
    setFormData(defaultFormData);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBlog) {
        await api.put(`/api/admin/blogs/${editingBlog.id}`, formData);
      } else {
        await api.post('/api/admin/blogs', formData);
      }
      setShowModal(false);
      fetchBlogs();
    } catch (err) {
      alert('Failed to save blog post');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    try {
      await api.delete(`/api/admin/blogs/${id}`);
      fetchBlogs();
    } catch (err) {
      alert('Failed to delete blog post');
    }
  };

  const getCategories = () => {
    const cats = new Set(blogs.map(b => b.category));
    return ['All', ...Array.from(cats)];
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (blog.excerpt && blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = filterCategory === 'All' || blog.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold text-sm">Loading blogs...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            📰 Blog Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">Create, update, and manage SEO-optimized content to boost search visibility.</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-100 hover:shadow-lg hover:shadow-blue-200"
        >
          <Plus size={18} />
          Write Blog Post
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {getCategories().map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                filterCategory === cat 
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Blogs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBlogs.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-150 rounded-2xl p-12 text-center flex flex-col items-center">
            <Layout size={48} className="text-slate-300 mb-4" />
            <p className="text-slate-500 font-bold mb-2">No blog posts found</p>
            <p className="text-slate-400 text-sm max-w-md">Try adjusting your filters or write your first post to get started.</p>
          </div>
        ) : (
          filteredBlogs.map((blog) => (
            <div key={blog.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full group">
              {/* Blog Card Image/Header */}
              <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span className="text-3xl">{blog.image || '📝'}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-black tracking-wide ${
                  blog.published 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : 'bg-amber-50 text-amber-700 border border-amber-100'
                }`}>
                  {blog.published ? 'Published' : 'Draft'}
                </span>
              </div>

              {/* Blog Details */}
              <div className="p-6 flex-1 flex flex-col">
                <span className="text-xs font-black uppercase text-blue-600 tracking-wider mb-2">{blog.category}</span>
                <h3 className="font-extrabold text-slate-800 text-lg group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                  {blog.title}
                </h3>
                <p className="text-slate-500 text-sm line-clamp-3 mb-4 flex-1">
                  {blog.excerpt || 'No description provided.'}
                </p>

                <div className="flex items-center gap-3 text-xs text-slate-400 mt-auto pt-4 border-t border-slate-100">
                  <span className="font-bold text-slate-600">{blog.author}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{blog.readTime}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <a 
                  href={`/blog/${blog.id}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 font-bold transition-colors"
                >
                  <Eye size={14} /> Preview
                </a>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(blog)}
                    className="p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-800 rounded-lg transition"
                    title="Edit Post"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Delete Post"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Editor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
              <div>
                <h2 className="text-xl font-black text-slate-800">
                  {editingBlog ? '✍️ Edit Blog Post' : '📝 Create New Blog Post'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">Fill out the fields below. Don\'t forget the meta fields for SEO optimization.</p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-150 rounded-xl transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Main Content Columns */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1">Post Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                      placeholder="e.g. Income Tax Return Filing Guide FY 2025-26"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1">Excerpt / Brief Summary</label>
                    <textarea
                      rows={2}
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                      placeholder="Write a catchy 2-sentence summary of the post..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1">Post Body Content (Supports Markdown)</label>
                    <textarea
                      required
                      rows={12}
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm leading-relaxed"
                      placeholder="Write your article contents here. You can use markdown headings like ##, bold text, lists, and tables."
                    />
                  </div>
                </div>

                {/* Settings & SEO Panel */}
                <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-150">
                  <h3 className="text-sm font-black text-slate-700 border-b border-slate-200 pb-2 mb-2 flex items-center gap-1.5">
                    ⚙️ Settings & Meta Info
                  </h3>

                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold bg-white"
                    >
                      <option value="GST">GST</option>
                      <option value="Income Tax">Income Tax</option>
                      <option value="TDS">TDS</option>
                      <option value="Business">Business</option>
                      <option value="General">General</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Icon/Emoji</label>
                      <input
                        type="text"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg bg-white"
                        placeholder="📝"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Read Time</label>
                      <input
                        type="text"
                        value={formData.readTime}
                        onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="5 min read"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Author Name</label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-bold"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1 text-blue-600">
                      🔍 SEO Meta Fields
                    </h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Meta Title</label>
                        <input
                          type="text"
                          value={formData.metaTitle}
                          onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white"
                          placeholder="Search engine title..."
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Meta Description</label>
                        <textarea
                          rows={2}
                          value={formData.metaDescription}
                          onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white"
                          placeholder="Search engine description (max 160 chars)..."
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Tags (comma separated)</label>
                        <input
                          type="text"
                          value={formData.tags}
                          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white"
                          placeholder="tax, itr filing, gst"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Publish Post</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.published === 1}
                        onChange={(e) => setFormData({ ...formData, published: e.target.checked ? 1 : 0 })}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-100 hover:shadow-lg text-sm"
                >
                  {editingBlog ? 'Save Changes' : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

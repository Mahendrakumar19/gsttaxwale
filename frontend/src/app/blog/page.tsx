'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, User, ArrowRight, Clock, MessageSquare } from 'lucide-react';
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
  publishedAt: string | null;
}

export default function Blog() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    async function fetchBlogs() {
      try {
        setLoading(true);
        // Calls the public endpoint which only retrieves published blogs
        const response = await api.get('/api/blogs');
        setBlogs(response.data.data?.blogs || []);
      } catch (err) {
        console.error('Error fetching blogs:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  const getCategories = () => {
    const cats = new Set(blogs.map(b => b.category));
    return ['All', ...Array.from(cats)];
  };

  const filteredBlogs = selectedCategory === 'All' 
    ? blogs 
    : blogs.filter(b => b.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-bold">Loading expert tax resources...</p>
      </div>
    );
  }

  // Get the featured post (latest post) and the rest
  const featuredPost = filteredBlogs[0];
  const remainingPosts = filteredBlogs.slice(1);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="bg-white border-b border-slate-100 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-black rounded-full uppercase tracking-wider mb-4 inline-block">
            Knowledge Hub
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-800 mb-4 tracking-tight">
            GST, Income Tax & Corporate Compliance Blog
          </h1>
          <p className="text-lg text-slate-500 max-w-3xl mx-auto font-medium">
            Stay up to date with the latest tax notifications, step-by-step guides, and expert finance tips from GST Tax Wale.
          </p>
        </div>
      </section>

      {/* Category Tabs */}
      {blogs.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="flex gap-2 overflow-x-auto pb-2 justify-start md:justify-center">
            {getCategories().map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-full font-extrabold text-sm whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {filteredBlogs.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-100 rounded-2xl p-8">
            <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">No articles found</h3>
            <p className="text-slate-400">Check back later for fresh updates and compliance insights.</p>
          </div>
        ) : (
          <>
            {/* Featured Post Card */}
            {featuredPost && (
              <Link href={`/blog/${featuredPost.id}`}>
                <div className="bg-white border border-slate-150 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 mb-12 cursor-pointer flex flex-col lg:flex-row group">
                  {/* Left Side: Visual Header */}
                  <div className="lg:w-2/5 bg-gradient-to-br from-blue-50 to-indigo-50/30 flex items-center justify-center p-12 text-7xl select-none min-h-[250px] lg:min-h-full">
                    {featuredPost.image || '📝'}
                  </div>
                  {/* Right Side: Details */}
                  <div className="lg:w-3/5 p-8 sm:p-10 flex flex-col justify-between">
                    <div>
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-black rounded-full uppercase tracking-wider mb-4 inline-block">
                        Featured • {featuredPost.category}
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-4 group-hover:text-blue-600 transition-colors leading-tight">
                        {featuredPost.title}
                      </h2>
                      <p className="text-slate-500 mb-6 font-medium line-clamp-3">
                        {featuredPost.excerpt}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-100 text-slate-500 text-xs sm:text-sm">
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-slate-700">{featuredPost.author}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock size={14} className="text-slate-400" />
                          <span>{featuredPost.readTime}</span>
                        </div>
                      </div>
                      <span className="text-blue-600 font-extrabold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Read Full Article <ArrowRight size={16} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Remaining Posts Grid */}
            {remainingPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {remainingPosts.map((post) => (
                  <Link href={`/blog/${post.id}`} key={post.id}>
                    <div className="bg-white border border-slate-200 hover:shadow-xl rounded-2xl p-6 transition duration-300 cursor-pointer h-full flex flex-col group">
                      <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center text-3xl mb-5 group-hover:scale-105 transition-transform">
                        {post.image || '📝'}
                      </div>

                      <span className="text-xs font-black text-blue-600 mb-2 uppercase tracking-wide">
                        {post.category}
                      </span>

                      <h3 className="text-lg font-extrabold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-slate-500 text-sm mb-6 line-clamp-3 flex-1 font-medium leading-relaxed">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between text-slate-400 text-xs pt-4 border-t border-slate-100 mt-auto">
                        <span className="font-bold text-slate-600">{post.author}</span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {post.readTime}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* Newsletter */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 text-center shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-800 mb-3">Subscribe to Tax Alerts & Updates</h2>
          <p className="text-slate-500 mb-6 font-medium max-w-lg mx-auto">
            Get the latest tax alerts, compliance deadline notifications, and key financial guides directly to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium"
            />
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl transition shadow-md shadow-blue-100 hover:shadow-lg whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Calendar, User, ArrowLeft, Clock, Share2, Facebook, Twitter, Linkedin, AlertCircle } from 'lucide-react';
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
  publishedAt: string | null;
}

export default function BlogPost() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [blog, setBlog] = useState<BlogItem | null>(null);
  const [related, setRelated] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadPost() {
      try {
        setLoading(true);
        setError(false);
        
        // Load target blog
        const response = await api.get(`/api/blogs/${id}`);
        const currentBlog = response.data.data?.blog;
        
        if (currentBlog) {
          setBlog(currentBlog);
          
          // Set page titles and metadata dynamically
          if (typeof document !== 'undefined') {
            document.title = `${currentBlog.metaTitle || currentBlog.title} | GST Tax Wale`;
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
              metaDesc.setAttribute('content', currentBlog.metaDescription || currentBlog.excerpt || '');
            }
          }

          // Fetch other posts to suggest related articles
          const listResponse = await api.get('/api/blogs');
          const allBlogs: BlogItem[] = listResponse.data.data?.blogs || [];
          // Filter out the current one and pick 2 of the same category or default to first 2
          const relatedFiltered = allBlogs
            .filter((b) => b.id !== currentBlog.id)
            .sort((a, b) => (a.category === currentBlog.category ? -1 : 1))
            .slice(0, 2);
          setRelated(relatedFiltered);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to load blog post:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      loadPost();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-bold">Loading article...</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4">
        <div className="bg-white border border-slate-150 p-8 rounded-2xl max-w-md w-full text-center shadow-sm">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">Article Not Found</h3>
          <p className="text-slate-500 text-sm mb-6">
            The blog post you are looking for does not exist, has been removed, or has been returned to draft status.
          </p>
          <button
            onClick={() => router.push('/blog')}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md"
          >
            Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  // Simple Markdown-to-HTML formatter helper for basic formatting
  const formatBodyContent = (text: string) => {
    return text.split('\n\n').map((para, index) => {
      const trimmed = para.trim();
      
      // Headers: ## Header Title
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={index} className="text-2xl font-extrabold text-slate-800 mt-8 mb-4 tracking-tight">
            {trimmed.replace('## ', '')}
          </h2>
        );
      }

      // Headers: ### Header Title
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={index} className="text-xl font-extrabold text-slate-800 mt-6 mb-3 tracking-tight">
            {trimmed.replace('### ', '')}
          </h3>
        );
      }

      // List Items (dash/bullet): - item or * item
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const items = trimmed.split(/\n[\-\*]\s+/);
        return (
          <ul key={index} className="list-disc pl-6 space-y-2 my-4 text-slate-600 font-medium">
            {items.map((item, i) => (
              <li key={i}>{item.replace(/^[\-\*]\s+/, '')}</li>
            ))}
          </ul>
        );
      }

      // Bold syntax conversion **bold** -> <strong>bold</strong>
      if (trimmed.includes('**')) {
        const parts = trimmed.split('**');
        return (
          <p key={index} className="text-slate-600 font-medium leading-relaxed my-4">
            {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-slate-800 font-extrabold">{part}</strong> : part)}
          </p>
        );
      }

      // Default Paragraph
      return (
        <p key={index} className="text-slate-600 font-medium leading-relaxed my-4">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Breadcrumb */}
      <div className="px-4 py-4 bg-white border-b border-slate-150 sticky top-16 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/blog')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-extrabold transition text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blogs
          </button>
          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-black rounded-full uppercase tracking-wider">
            {blog.category}
          </span>
        </div>
      </div>

      {/* Main Post Section */}
      <article className="max-w-4xl mx-auto px-4 py-12 bg-white border border-slate-150 rounded-3xl mt-8 shadow-sm">
        <header className="mb-8">
          <div className="text-7xl mb-6 select-none">{blog.image || '📝'}</div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 mt-4 mb-6 leading-tight tracking-tight">
            {blog.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-slate-400 text-xs sm:text-sm border-y border-slate-100 py-4 mt-6">
            <span className="flex items-center gap-2 font-bold text-slate-600">
              <User size={16} className="text-blue-600" />
              {blog.author}
            </span>
            <span>•</span>
            <span className="flex items-center gap-2">
              <Calendar size={16} className="text-blue-500" />
              {blog.publishedAt 
                ? new Date(blog.publishedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
                : 'Draft'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-2">
              <Clock size={16} className="text-blue-500" />
              {blog.readTime}
            </span>
          </div>
        </header>

        {/* Content body */}
        <div className="prose max-w-none text-slate-600 text-base sm:text-lg leading-relaxed space-y-6 pt-2">
          {formatBodyContent(blog.content)}
        </div>

        {/* Share Section */}
        <footer className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-slate-500 text-sm font-black uppercase tracking-wider">Share:</span>
            <div className="flex gap-2">
              <button 
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                className="p-2.5 rounded-full bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition" 
                title="Share on Facebook"
              >
                <Facebook size={16} />
              </button>
              <button 
                onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(blog.title)}`, '_blank')}
                className="p-2.5 rounded-full bg-slate-50 hover:bg-sky-50 text-slate-500 hover:text-sky-500 transition" 
                title="Share on Twitter"
              >
                <Twitter size={16} />
              </button>
              <button 
                onClick={() => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(blog.title)}`, '_blank')}
                className="p-2.5 rounded-full bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-700 transition" 
                title="Share on LinkedIn"
              >
                <Linkedin size={16} />
              </button>
            </div>
          </div>
          <button
            onClick={() => router.push('/blog')}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl transition text-sm"
          >
            Explore Other Articles
          </button>
        </footer>
      </article>

      {/* Suggested Articles */}
      {related.length > 0 && (
        <section className="bg-slate-100 py-16 px-4 border-t border-slate-200 mt-12">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-2">📚 Related Articles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {related.map((suggested) => (
                <Link href={`/blog/${suggested.id}`} key={suggested.id}>
                  <div className="bg-white border border-slate-200 hover:border-blue-400 hover:shadow-lg rounded-2xl p-6 transition duration-300 cursor-pointer flex flex-col h-full group">
                    <div className="text-4xl mb-4 group-hover:scale-105 transition-transform w-fit">{suggested.image || '📝'}</div>
                    <span className="text-xs font-black text-blue-600 uppercase tracking-wide mb-2">{suggested.category}</span>
                    <h4 className="font-extrabold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors flex-1">{suggested.title}</h4>
                    <p className="text-slate-400 text-xs font-semibold">
                      {suggested.publishedAt 
                        ? new Date(suggested.publishedAt).toLocaleDateString('en-IN') 
                        : 'Draft'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

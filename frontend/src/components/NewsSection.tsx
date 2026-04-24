'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import type { NewsItem } from '@/types/api';

interface NewsProps {
  limit?: number;
  category?: string;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'announcement':
      return <TrendingUp className="w-5 h-5 text-blue-600" />;
    case 'alert':
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    case 'update':
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'news':
      return <Clock className="w-5 h-5 text-orange-600" />;
    default:
      return <TrendingUp className="w-5 h-5 text-gray-600" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'announcement':
      return 'bg-blue-50 border-blue-200';
    case 'alert':
      return 'bg-red-50 border-red-200';
    case 'update':
      return 'bg-green-50 border-green-200';
    case 'news':
      return 'bg-orange-50 border-orange-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

const getCategoryBadgeColor = (category: string) => {
  switch (category) {
    case 'announcement':
      return 'bg-blue-100 text-blue-700';
    case 'alert':
      return 'bg-red-100 text-red-700';
    case 'update':
      return 'bg-green-100 text-green-700';
    case 'news':
      return 'bg-orange-100 text-orange-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export default function NewsSection({ limit = 5, category }: NewsProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const url = new URL('/api/news', window.location.origin);
        url.searchParams.append('limit', limit.toString());
        if (category) url.searchParams.append('category', category);

        const res = await fetch(url.toString());
        const data = await res.json();

        if (data.success) {
          setNews(data.data.news);
        } else {
          setError('Failed to load news');
        }
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Error loading news');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [limit, category]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-20 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600 py-4">{error}</div>;
  }

  return (
    <div className="space-y-3">
      {news.map((item) => (
        <div
          key={item.id}
          className={`border rounded-lg p-4 transition-all hover:shadow-md ${getCategoryColor(item.category)}`}
        >
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-1">
              {getCategoryIcon(item.category)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                  <p className="text-sm text-gray-700 mt-1">{item.description}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getCategoryBadgeColor(item.category)}`}>
                  {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                <span>{new Date(item.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                {item.source && <span>•</span>}
                {item.source && <span className="font-medium">{item.source}</span>}
                {item.url && (
                  <>
                    <span>•</span>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Read More
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {news.length === 0 && (
        <div className="text-center py-6 text-gray-600">
          <p>No news updates available at this time.</p>
        </div>
      )}
    </div>
  );
}

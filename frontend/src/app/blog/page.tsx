import Link from 'next/link';
import { Calendar, User, ArrowRight } from 'lucide-react';

export default function Blog() {
  const posts = [
    {
      id: 1,
      title: '5 Tax Saving Strategies Every Business Should Know',
      excerpt: 'Discover powerful tax-saving techniques that can help your business reduce tax liability legally.',
      category: 'Tax Planning',
      author: 'CA Mahendra Kumar',
      date: '2026-03-28',
      image: '📊',
    },
    {
      id: 2,
      title: 'GST Compliance Checklist for 2026',
      excerpt: 'A comprehensive checklist to ensure your business meets all GST compliance requirements.',
      category: 'GST',
      author: 'Priya Sharma',
      date: '2026-03-25',
      image: '✅',
    },
    {
      id: 3,
      title: 'Understanding Income Tax Slabs and Deductions',
      excerpt: 'Learn about the latest income tax slabs for FY 2025-26 and how to maximize deductions.',
      category: 'Income Tax',
      author: 'CA Mahendra Kumar',
      date: '2026-03-22',
      image: '💰',
    },
    {
      id: 4,
      title: 'How TDS Works: A Complete Guide',
      excerpt: 'Everything you need to know about Tax Deducted at Source (TDS) and its compliance.',
      category: 'TDS',
      author: 'Arjun Patel',
      date: '2026-03-20',
      image: '📑',
    },
    {
      id: 5,
      title: 'Trademark Registration: Why Your Business Needs It',
      excerpt: 'Protect your brand identity with trademark registration. Learn the process and benefits.',
      category: 'IP Rights',
      author: 'Neha Gupta',
      date: '2026-03-18',
      image: '™️',
    },
    {
      id: 6,
      title: 'Common GST Mistakes to Avoid',
      excerpt: 'Avoid costly GST filing mistakes. We highlight the most common errors businesses make.',
      category: 'GST',
      author: 'Vikas Singh',
      date: '2026-03-15',
      image: '⚠️',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Tax & Compliance Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Learn about tax strategies, compliance tips, and business insights from our expert team
          </p>
        </div>

        {/* Featured Post */}
        <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 rounded-lg p-8 mb-12">
          <div className="flex items-start justify-between mb-4">
            <span className="text-3xl">{posts[0].image}</span>
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
              {posts[0].category}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{posts[0].title}</h2>
          <p className="text-gray-700 mb-4">{posts[0].excerpt}</p>
          <div className="flex items-center gap-4 text-gray-600 text-sm">
            <span className="flex items-center gap-1">
              <User size={16} />
              {posts[0].author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={16} />
              {new Date(posts[0].date).toLocaleDateString()}
            </span>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Latest Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.slice(1).map((post) => (
            <Link href={`/blog/${post.id}`} key={post.id}>
              <div className="bg-white border border-gray-200 hover:shadow-lg rounded-lg p-6 transition cursor-pointer h-full flex flex-col">
                <div className="text-4xl mb-4">{post.image}</div>

                <span className="text-xs font-bold text-blue-600 mb-3 uppercase">
                  {post.category}
                </span>

                <h3 className="text-lg font-bold text-gray-900 mb-3 flex-1">{post.title}</h3>

                <p className="text-gray-600 text-sm mb-4 flex-1">{post.excerpt}</p>

                <div className="flex items-center justify-between text-gray-600 text-xs mb-4\">
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                  <span>{post.author}</span>
                </div>

                <div className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold transition">
                  Read More
                  <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="bg-slate-800/50 border border-amber-500/30 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-gray-700 mb-6">Get the latest tax tips, compliance updates, and business insights delivered to your inbox weekly.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

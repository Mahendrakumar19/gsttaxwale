import React from 'react';
import Link from 'next/link';
import ServiceCard from '../components/services/ServiceCard';

export default async function HomePage() {
  // fetch services server-side
  let services = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/services`);
    const json = await res.json();
    services = json.data?.services || [];
  } catch (e) {
    services = [];
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Hero Section - Money Theme */}
      <section className="relative pt-20 pb-32 px-4 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-60 h-60 bg-blue-600/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="text-6xl">💰</div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Financial Peace of Mind with <span className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">Easy Tax Compliance</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              Expert-assisted GST filing, income tax returns, and professional tax consulting. Let our team of certified professionals handle your compliance while you focus on growth.
            </p>
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto mb-10 bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-amber-400">4.9★</div>
                <p className="text-xs md:text-sm text-slate-400 mt-1">Average Rating</p>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-green-400">15,000+</div>
                <p className="text-xs md:text-sm text-slate-400 mt-1">Happy Clients</p>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-blue-400">100%</div>
                <p className="text-xs md:text-sm text-slate-400 mt-1">Compliant</p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/services" className="bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-white px-8 py-3 rounded-lg hover:shadow-lg hover:shadow-amber-600/50 transition font-semibold text-lg">
                Explore All Services
              </Link>
              <Link href="/contact" className="border-2 border-slate-400 hover:border-purple-400 text-slate-300 hover:text-white px-8 py-3 rounded-lg transition font-semibold text-lg backdrop-blur-sm">
                Schedule Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - TaxBuddy Style */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '1', icon: '🔗', title: 'Connect Instantly', desc: 'Get expert support through live chat, email, or schedule a call' },
              { step: '2', icon: '📄', title: 'Share Your Details', desc: 'Upload documents securely - GST certificates, tax proofs, filings' },
              { step: '3', icon: '✓', title: 'Review & Approve', desc: 'Our experts prepare and summarize your filing for approval' },
              { step: '4', icon: '⚡', title: 'File & Complete', desc: 'We file your return and ensure 100% compliance' }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-xl shadow-lg">
                    {item.step}
                  </div>
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400">{item.desc}</p>
                </div>
                {idx !== 3 && (
                  <div className="hidden md:block absolute top-8 -right-6 w-12 h-0.5 bg-gradient-to-r from-purple-500 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="py-16 px-4 bg-slate-800/20 border-y border-slate-700/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-amber-400 mb-2">97.4%</div>
              <p className="text-slate-400 text-sm">First-Time Accuracy</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">24 Hours*</div>
              <p className="text-slate-400 text-sm">Typical Turnaround</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">₹500+Cr</div>
              <p className="text-slate-400 text-sm">Tax Saved For Users</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-400 mb-2">2600+</div>
              <p className="text-slate-400 text-sm">Towns Served</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-950 via-blue-950/50 to-slate-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-4">
              <div className="text-5xl">📊</div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Comprehensive Tax Solutions</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">Everything your business needs for complete tax compliance</p>
          </div>

          {services.length === 0 ? (
            <div className="glassmorphic-dark rounded-xl border border-slate-500/20 p-12 text-center">
              <p className="text-slate-300 mb-4 text-lg">Services are being loaded...</p>
              <p className="text-slate-400 text-sm">Please check back shortly or contact our team</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {services.map((s: any) => (
                <ServiceCard key={s.id} service={s} buyHref={`/checkout?serviceId=${s.id}`} />
              ))}
            </div>
          )}

          <div className="text-center">
            <Link href="/services" className="inline-block bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-white px-8 py-3 rounded-lg hover:shadow-lg hover:shadow-amber-600/50 transition font-semibold text-lg">
              View All Services →
            </Link>
          </div>
        </div>
      </section>

      {/* What's New Section - Upcoming Due Dates */}
      <section className="py-20 px-4 bg-gradient-to-b from-blue-950/50 to-slate-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-5xl mb-4">📅</div>
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-2">What's New - Upcoming Due Dates</h2>
            <p className="text-slate-400">Track important compliance deadlines</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glassmorphic-dark rounded-xl p-6 border border-slate-500/20 hover:border-amber-500/50 transition">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-white mb-2">GST Return Filing</h3>
              <p className="text-slate-400 mb-4">GSTR-1, GSTR-2B, GSTR-3B (Monthly/Quarterly)</p>
              <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-3 text-amber-300 text-sm">
                <strong>Next Due:</strong> 15th of every month
              </div>
            </div>

            <div className="glassmorphic-dark rounded-xl p-6 border border-slate-500/20 hover:border-green-500/50 transition">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-white mb-2">Income Tax Filing</h3>
              <p className="text-slate-400 mb-4">ITR Filing for FY 2025-26</p>
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-green-300 text-sm">
                <strong>Due Date:</strong> 31st July 2026
              </div>
            </div>

            <div className="glassmorphic-dark rounded-xl p-6 border border-slate-500/20 hover:border-blue-500/50 transition">
              <div className="text-4xl mb-4">🍔</div>
              <h3 className="text-xl font-bold text-white mb-2">FSSAI License</h3>
              <p className="text-slate-400 mb-4">Annual Renewal (Food Business)</p>
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 text-blue-300 text-sm">
                <strong>Valid For:</strong> 1 Year from Date of Issue
              </div>
            </div>
          </div>

          <div className="mt-12 text-center p-8 bg-gradient-to-r from-amber-600/20 via-yellow-600/20 to-amber-600/20 border border-amber-500/40 rounded-xl">
            <div className="text-4xl mb-3">⏰</div>
            <p className="text-slate-200 mb-4 text-lg font-medium">Don't miss important deadlines — set reminders now!</p>
            <Link href="/contact" className="inline-block bg-gradient-to-r from-amber-600 to-yellow-500 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-amber-600/50 transition font-semibold">
              Get Due Date Alerts
            </Link>
          </div>
        </div>
      </section>

      {/* Referral Bonus Program */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-y border-emerald-600/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-5xl mb-4">💸</div>
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-2">Referral Bonus Program</h2>
            <p className="text-slate-400">Earn money by referring friends</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glassmorphic-dark rounded-xl p-8 border border-emerald-500/30 hover:border-green-400/50 transition">
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 mb-4">Earn While You Refer</h3>
              <ul className="space-y-4 text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>Refer a friend → Get <strong className="text-green-400">₹500</strong> bonus</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>They sign up → You get <strong className="text-green-400">₹1000</strong> when they file</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>Unlimited referrals = Unlimited earnings</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>Withdraw to bank anytime</span>
                </li>
              </ul>
            </div>

            <div className="glassmorphic-dark rounded-xl p-8 border border-emerald-500/30">
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 mb-4">How to Refer</h3>
              <ol className="space-y-4 text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold text-lg">1.</span>
                  <span>Share your unique referral link with friends</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold text-lg">2.</span>
                  <span>They sign up using your link</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold text-lg">3.</span>
                  <span>Bonus credited to your account instantly</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold text-lg">4.</span>
                  <span>Withdraw anytime (Minimum ₹100)</span>
                </li>
              </ol>
              <Link href="/auth/login" className="inline-block mt-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-green-600/50 transition font-semibold">
                Get Your Referral Link →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Relevant Laws & Acts Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-950 via-amber-950/10 to-slate-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-5xl mb-4">⚖️</div>
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-2">Important Laws & Regulations</h2>
            <p className="text-slate-400">Stay compliant with government requirements</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'GST Act, 2017', icon: '📋', link: 'https://www.gstcouncil.gov.in' },
              { name: 'Income Tax Act, 1961', icon: '💰', link: 'https://www.incometaxindia.gov.in' },
              { name: 'EPF Act, 1952', icon: '👔', link: 'https://www.epfindia.gov.in' },
              { name: 'FSSAI License', icon: '🍔', link: 'https://fssai.gov.in' },
              { name: 'Companies Act, 2013', icon: '🏛️', link: 'https://mca.gov.in' },
              { name: 'Shops Act', icon: '🛍️', link: 'https://www.incometaxindia.gov.in' },
              { name: 'IEC Registration', icon: '📦', link: 'https://saksham.gov.in' },
              { name: 'TDS Guidelines', icon: '📊', link: 'https://www.incometaxindia.gov.in' }
            ].map((law, idx) => (
              <a
                key={idx}
                href={law.link}
                target="_blank"
                rel="noopener noreferrer"
                className="glassmorphic-dark rounded-xl p-6 border border-slate-500/20 hover:border-amber-500/50 transition hover:shadow-lg hover:shadow-amber-500/20 text-center"
              >
                <div className="text-4xl mb-3">{law.icon}</div>
                <h3 className="text-sm font-semibold text-white">{law.name}</h3>
                <p className="text-xs text-amber-400 mt-2">Learn more →</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-950 to-blue-950/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-5xl mb-4">⭐</div>
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-2">Why Choose GST Tax Wale?</h2>
            <p className="text-slate-400">Trusted by 15,000+ businesses</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: '👨‍💼', title: 'Expert CA & Tax Professionals', desc: 'Certified professionals with 10+ years of experience in tax compliance and planning' },
              { icon: '🕐', title: '24/7 Customer Support', desc: 'Round-the-clock support available via chat, email, and phone to assist you anytime' },
              { icon: '📱', title: 'Digital Documentation', desc: 'Secure online portal for easy document uploading, tracking, and filing management' },
              { icon: '✓', title: 'Compliance Guaranteed', desc: '100% tax law compliance with timely filing guarantees and zero errors policy' },
              { icon: '🔒', title: 'Bank-Level Security', desc: '256-bit SSL encryption protects all your personal and financial information' },
              { icon: '💵', title: 'No Hidden Charges', desc: 'Transparent, fixed pricing with complete cost breakdown upfront' }
            ].map((item, idx) => (
              <div key={idx} className="glassmorphic-dark rounded-xl p-8 border border-slate-500/20 hover:border-amber-500/30 transition">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-blue-950/30 to-slate-950 border-y border-slate-700/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-5xl mb-4">💬</div>
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center">What Our Clients Say</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Rajesh Kumar', role: 'Business Owner', rating: 5, text: 'GST Tax Wale made tax filing incredibly easy. Their support team was always available when I needed them.' },
              { name: 'Priya Sharma', role: 'Freelancer', rating: 5, text: 'Professional, accurate, and transparent. They saved me hours of work and potential compliance issues.' },
              { name: 'Amit Patel', role: 'Startup Founder', rating: 5, text: 'Best tax solution for startups. The team understood our unique needs and provided perfect guidance.' }
            ].map((testimonial, idx) => (
              <div key={idx} className="glassmorphic-dark rounded-xl p-6 border border-slate-500/20 hover:border-amber-500/30 transition">
                <div className="flex items-center gap-2 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-amber-400">★</span>
                  ))}
                </div>
                <p className="text-slate-300 mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <p className="text-white font-semibold">{testimonial.name}</p>
                  <p className="text-slate-400 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-amber-950/10 to-slate-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-5xl mb-4">✨</div>
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-2">Premium Features</h2>
            <p className="text-slate-400">Everything you need for stress-free tax management</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: '⚡', title: 'Fast Processing', desc: 'Get your filings done in record time' },
              { icon: '📊', title: 'Smart Analytics', desc: 'Detailed tax insights and optimization tips' },
              { icon: '🤝', title: 'Expert Guidance', desc: 'One-on-one consultation with tax experts' },
              { icon: '📜', title: 'Legal Compliance', desc: 'Full compliance with all tax regulations' }
            ].map((feature, idx) => (
              <div key={idx} className="text-center p-6 glassmorphic-dark rounded-xl border border-slate-500/20 hover:border-green-500/30 transition">
                <div className="text-5xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-950 to-blue-950/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-5xl mb-4">❓</div>
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-4">
            {[
              { q: 'How long does tax filing take?', a: 'Typically 24 hours. Our expert team works fast to ensure quick turnaround without compromising accuracy.' },
              { q: 'Is my data secure?', a: 'Yes. We use 256-bit SSL encryption and follow all data protection regulations to keep your information safe.' },
              { q: 'Do you provide support after filing?', a: 'Absolutely. We provide free support for 365 days including notice handling and any compliance queries.' },
              { q: 'What documents do I need?', a: 'Typically: GST certificates, tax identification proofs, business documents, and income details. We guide you through everything.' }
            ].map((item, idx) => (
              <div key={idx} className="glassmorphic-dark rounded-xl p-6 border border-slate-500/20 hover:border-blue-500/30 transition">
                <h3 className="text-lg font-semibold text-amber-400 mb-2">Q: {item.q}</h3>
                <p className="text-slate-400">A: {item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-950 via-slate-950 to-blue-950 border-t border-slate-700/30">
        <div className="max-w-4xl mx-auto">
          <div className="glassmorphic-dark rounded-2xl p-12 border border-amber-500/30 text-center relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-600/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-green-600/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Simplify Your Tax Compliance?</h3>
              <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of happy clients who have saved time, money, and stress by choosing GST Tax Wale. Get started today with expert support every step of the way.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/login" className="bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-white px-8 py-3 rounded-lg hover:shadow-lg hover:shadow-amber-600/50 transition font-semibold inline-block">
                  Start Now - Login / Sign Up
                </Link>
                <Link href="/contact" className="border-2 border-amber-400 hover:border-amber-300 text-amber-300 hover:text-amber-200 px-8 py-3 rounded-lg transition font-semibold inline-block">
                  Schedule Free Consultation
                </Link>
              </div>
              
              {/* Bottom trust line */}
              <div className="mt-10 pt-10 border-t border-slate-700/30">
                <p className="text-slate-400 text-sm">
                  <span className="text-green-400">✓</span> Free notice management included &nbsp;&nbsp;
                  <span className="text-green-400">✓</span> 365 days of support &nbsp;&nbsp;
                  <span className="text-green-400">✓</span> Zero hidden charges
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


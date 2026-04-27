import Link from 'next/link';
import { Star, Users, Award, Zap, Shield, Lightbulb } from 'lucide-react';

export default function About() {
  const values = [
    {
      icon: '🎯',
      title: 'Transparency',
      description: 'We believe in clear, honest communication with no hidden charges or surprises.'
    },
    {
      icon: '💼',
      title: 'Professional',
      description: 'Our team consists of qualified CAs and tax experts with years of experience.'
    },
    {
      icon: '🚀',
      title: 'Innovation',
      description: 'We continuously update our platform with latest tax laws and technologies.'
    },
    {
      icon: '🤝',
      title: 'Customer-Centric',
      description: 'Your success is our success. We provide dedicated support and personalized solutions.'
    }
  ];

  const services = [
    { name: 'Income Tax Filing', desc: 'ITR filing for individuals, HUFs, and businesses' },
    { name: 'GST Compliance', desc: 'GST returns, reconciliation, and consultation' },
    { name: 'Tax Planning', desc: 'Strategies to minimize tax liability legally' },
    { name: 'Business Setup', desc: 'Registration, compliance, and initial setup' },
    { name: 'Bookkeeping', desc: 'Accounting and financial record maintenance' },
    { name: 'Audit Services', desc: 'Statutory and internal audit services' }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            About <span className="text-blue-600">GST Tax Wale</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Democratizing tax services in India by making compliance simple, affordable, and stress-free for everyone
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              GST Tax Wale was founded with a simple mission: to democratize tax services in India. We believe that every business, regardless of size, deserves access to expert tax consultation and filing services without breaking the bank.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              We're committed to making GST compliance, income tax filing, and statutory compliance straightforward and transparent. By leveraging technology and a team of experienced professionals, we ensure your financial matters are handled with precision and care.
            </p>
          </div>
          <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 rounded-lg p-12">
            <div className="space-y-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-600 mb-2">10,000+</div>
                <p className="text-gray-700 text-lg">Businesses Served</p>
              </div>
              <div className="text-center border-t border-amber-500/30 pt-8">
                <div className="text-5xl font-bold text-blue-600 mb-2">₹50Cr+</div>
                <p className="text-gray-700 text-lg">Tax Filed Successfully</p>
              </div>
              <div className="text-center border-t border-amber-500/30 pt-8">
                <div className="text-5xl font-bold text-blue-600 mb-2">99%</div>
                <p className="text-gray-700 text-lg">Customer Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-slate-800/30 rounded-lg my-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-16 text-center">Our Core Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, i) => (
            <div key={i} className="bg-slate-900/50 rounded-lg p-8 border border-slate-700/30 hover:border-slate-600/50 transition">
              <div className="text-4xl mb-4">{value.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-900 mb-16 text-center">Why Choose GST Tax Wale?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
            <Zap className="text-blue-600 mb-4" size={32} />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Quick & Easy</h3>
            <p className="text-gray-700">User-friendly interface that makes tax filing simple and quick, saving you hours of work.</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-8">
            <Shield className="text-green-600 mb-4" size={32} />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Secure & Safe</h3>
            <p className="text-gray-700">Bank-level encryption and strict data protection standards ensure your information is always secure.</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-8">
            <Award className="text-purple-600 mb-4" size={32} />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Expert Support</h3>
            <p className="text-gray-700">Our team of qualified CAs and tax experts is always ready to help you navigate complex situations.</p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-900 mb-16 text-center">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-8 hover:border-gray-300 transition\">\n              <h3 className="text-xl font-bold text-gray-900 mb-2\">{service.name}</h3>\n              <p className="text-gray-700\">{service.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-900 mb-16 text-center">Our Team</h2>
        <div className="bg-white border border-gray-200 rounded-lg p-12 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Experienced & Qualified Professionals</h3>
              <p className="text-gray-700 text-lg mb-4">
                Our team comprises of:
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Chartered Accountants (CAs) with 10+ years experience</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Tax consultants specializing in GST, Income Tax, and Corporate Compliance</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Technology experts building intuitive tax solutions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Customer support team available 24/7 to assist you</span>
                </li>
              </ul>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
              <Users className="text-blue-600 mb-4" size={40} />
              <p className="text-gray-900 text-lg font-semibold mb-2">Ready to Help</p>
              <p className="text-gray-700">We're passionate about making taxation easier for everyone. Connect with our team today!</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-amber-900/30 to-amber-800/20 border border-amber-500/30 rounded-lg p-16 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to Simplify Your Taxes?</h2>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses and individuals who trust GST Tax Wale for their tax compliance needs.
          </p>
          <Link href="/contact" className="inline-block bg-gradient-to-r from-amber-500 to-amber-400 text-white font-bold px-10 py-4 rounded-lg hover:from-amber-400 hover:to-amber-300 transition text-lg">
            Contact for Account
          </Link>
        </div>
      </section>
    </div>
  );
}

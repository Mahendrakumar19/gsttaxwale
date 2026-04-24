import { Star } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Rajesh Kumar',
      company: 'Tech Solutions Pvt Ltd',
      text: 'GST Tax Wale helped us streamline our GST filing process. The service is professional and affordable.',
      rating: 5,
      image: '👨‍💼',
    },
    {
      name: 'Priya Sharma',
      company: 'Fashion Boutique',
      text: 'Their ITR filing service is excellent. They explained everything clearly and filed my return without any hassle.',
      rating: 5,
      image: '👩‍💼',
    },
    {
      name: 'Arjun Patel',
      company: 'Import-Export Business',
      text: 'Best tax services I have used! Timely filing, transparent pricing, and great customer support.',
      rating: 5,
      image: '👨‍💼',
    },
    {
      name: 'Neha Gupta',
      company: 'Freelance Consultant',
      text: 'As a freelancer, tax compliance used to be confusing. GST Tax Wale made it simple and affordable.',
      rating: 5,
      image: '👩‍💼',
    },
    {
      name: 'Vikas Singh',
      company: 'Manufacturing Business',
      text: 'Excellent support team! They answered all my questions and helped us file all required returns on time.',
      rating: 5,
      image: '👨‍💼',
    },
    {
      name: 'Anjali Verma',
      company: 'Startup Founder',
      text: 'Perfect for startups! Affordable pricing coupled with expert guidance made our compliance journey smooth.',
      rating: 5,
      image: '👩‍💼',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <section className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          What Our Customers Say
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Join thousands of satisfied businesses and individuals who trust GST Tax Wale for their tax needs
        </p>
      </section>

      {/* Testimonials Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-8 hover:border-blue-300 transition">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.text}"</p>

              <div className="flex items-center gap-4">
                <div className="text-3xl">{testimonial.image}</div>
                <div>
                  <p className="text-gray-900 font-bold">{testimonial.name}</p>
                  <p className="text-gray-600 text-sm">{testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <StatBox number="10,000+" label="Happy Customers" />
          <StatBox number="99%" label="Satisfaction Rate" />
          <StatBox number="₹5Cr+" label="Tax Filed" />
          <StatBox number="24/7" label="Support Available" />
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to experience the difference?</h2>
        <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg transition transform hover:scale-105">
          Get Started Today
        </button>
      </section>
    </div>
  );
}

function StatBox({ number, label }: { number: string; label: string }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <p className="text-3xl font-bold text-blue-600 mb-2">{number}</p>
      <p className="text-gray-700">{label}</p>
    </div>
  );
}

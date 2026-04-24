export default function Team() {
  const team = [
    {
      name: 'CA Mahendra Kumar',
      role: 'Founder & Chief Compliance Officer',
      expertise: 'GST & Income Tax',
      bio: '10+ years of experience in tax consulting',
      social: '👨‍💼',
    },
    {
      name: 'Priya Sharma',
      role: 'Head of Operations',
      expertise: 'GST Compliance',
      bio: 'Expert in GST implementation and filings',
      social: '👩‍💼',
    },
    {
      name: 'Arjun Patel',
      role: 'Senior Tax Consultant',
      expertise: 'Income Tax & TDS',
      bio: 'Specializes in tax planning strategies',
      social: '👨‍💼',
    },
    {
      name: 'Neha Gupta',
      role: 'IP & Company Registration Specialist',
      expertise: 'Trademarks & Company Reg',
      bio: 'Expert in intellectual property and business registration',
      social: '👩‍💼',
    },
    {
      name: 'Vikas Singh',
      role: 'Customer Success Manager',
      expertise: 'Client Relations',
      bio: 'Dedicated to ensuring customer satisfaction',
      social: '👨‍💼',
    },
    {
      name: 'Anjali Verma',
      role: 'Digital Marketing Lead',
      expertise: 'Brand & Marketing',
      bio: 'Helping businesses grow through digital solutions',
      social: '👩‍💼',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <section className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          Our Expert Team
        </h1>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto">
          Meet the professionals dedicated to making your tax compliance simple and stress-free
        </p>
      </section>

      {/* Team Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member, idx) => (
            <div key={idx} className="bg-slate-800/50 border border-amber-500/30 rounded-lg p-6 hover:border-amber-400 transition text-center">
              <div className="text-6xl mb-4">{member.social}</div>

              <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
              <p className="text-blue-600 font-bold mb-2">{member.role}</p>

              <div className="bg-slate-700/50 rounded-lg p-3 mb-4">
                <p className="text-blue-600 text-sm font-bold mb-1">Expertise</p>
                <p className="text-gray-700 text-sm">{member.expertise}</p>
              </div>

              <p className="text-gray-700 text-sm mb-4">{member.bio}</p>

              <div className="flex items-center justify-center gap-3">
                <button className="px-3 py-1 text-blue-600 hover:text-blue-700 text-sm font-bold transition">
                  LinkedIn
                </button>
                <span className="text-gray-300">•</span>
                <button className="px-3 py-1 text-blue-600 hover:text-blue-700 text-sm font-bold transition">
                  Schedule
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Culture Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Culture & Values</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CultureCard
            icon="🎯"
            title="Excellence"
            description="We strive for perfection in every service we deliver to our clients"
          />
          <CultureCard
            icon="🤝"
            title="Integrity"
            description="Honesty and transparency form the foundation of all our dealings"
          />
          <CultureCard
            icon="💡"
            title="Innovation"
            description="Constantly improving and adopting latest tax compliance technologies"
          />
        </div>
      </section>

      {/* Join Us */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Our Team</h2>
          <p className="text-gray-700 mb-6">
            We're always looking for talented professionals passionate about tax and compliance.
          </p>
          <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition">
            View Openings
          </button>
        </div>
      </section>
    </div>
  );
}

function CultureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-slate-800/50 border border-amber-500/30 rounded-lg p-6 text-center hover:border-amber-400 transition">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-700">{description}</p>
    </div>
  );
}

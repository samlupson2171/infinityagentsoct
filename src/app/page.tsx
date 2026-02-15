'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState, FormEvent } from 'react';

function ContactEnquirySection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    setResult(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setResult({ success: true, message: 'Message sent. We\'ll be in touch soon.' });
        setFormData({ name: '', email: '', phone: '', company: '', message: '' });
      } else {
        setResult({ success: false, message: data.error || 'Something went wrong. Please try again.' });
      }
    } catch {
      setResult({ success: false, message: 'Failed to send. Please email us directly.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center">
          Get in touch
        </h2>
        <div className="w-16 h-1 bg-orange-500 mx-auto mt-4 mb-4"></div>
        <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          Have a question about working with us? Want to find out more before registering?
          Drop us a message or give us a call.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Details */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Contact details</h3>
            <div className="space-y-6">
              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="bg-orange-100 p-3 rounded-full flex-shrink-0">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Phone</p>
                  <a href="tel:08009949934" className="text-orange-600 hover:text-orange-700 text-lg font-medium transition-colors">
                    0800 994 9934
                  </a>
                  <p className="text-sm text-gray-500 mt-1">Freephone — available during office hours</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="bg-orange-100 p-3 rounded-full flex-shrink-0">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Email</p>
                  <a href="mailto:emma@infinityweekends.co.uk" className="text-orange-600 hover:text-orange-700 text-lg font-medium transition-colors">
                    emma@infinityweekends.co.uk
                  </a>
                  <p className="text-sm text-gray-500 mt-1">We aim to reply within 24 hours</p>
                </div>
              </div>

              {/* Quick info */}
              <div className="bg-gray-50 rounded-xl p-6 mt-8">
                <p className="font-semibold text-gray-900 mb-2">Prefer to talk?</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Call us on <a href="tel:08009949934" className="text-orange-600 font-medium">0800 994 9934</a> and
                  ask for Emma. We&apos;re happy to walk you through how it all works, no commitment needed.
                </p>
              </div>
            </div>
          </div>

          {/* Enquiry Form */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Send us a message</h3>
            {result?.success ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-lg font-semibold text-green-800">{result.message}</p>
                <button
                  onClick={() => setResult(null)}
                  className="mt-4 text-sm text-green-600 hover:text-green-700 underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Your name *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                      placeholder="Jane Smith"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email address *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                      placeholder="jane@agency.co.uk"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone number
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                      placeholder="07700 900000"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-company" className="block text-sm font-medium text-gray-700 mb-1">
                      Agency / company
                    </label>
                    <input
                      id="contact-company"
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                      placeholder="Your agency name"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1">
                    Your message *
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors resize-vertical"
                    placeholder="Tell us what you'd like to know — destinations, packages, how it works, anything at all."
                  />
                </div>
                {result && !result.success && (
                  <p className="text-red-600 text-sm">{result.message}</p>
                )}
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 px-6 rounded-lg text-lg transition-colors"
                >
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
                <p className="text-xs text-gray-500 text-center">
                  Your message will be sent to emma@infinityweekends.co.uk. We&apos;ll get back to you as soon as we can.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center mb-8">
            <img
              src="/infinity-weekends-logo.png"
              alt="Infinity Weekends"
              className="h-16 w-auto mx-auto mb-8"
            />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center leading-tight">
            Become a stag &amp; hen{' '}
            <span className="text-orange-400">specialist</span> without the
            stress
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-300 text-center max-w-3xl mx-auto leading-relaxed">
            Infinity Weekends helps travel agents sell profitable stag and hen
            groups across 30+ European and UK destinations, with expert ground
            support and ready-made packages that make groups easy.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
            >
              Register as an Agent
            </Link>
            <Link
              href="/auth/login"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors border border-white/20"
            >
              Agent Login
            </Link>
          </div>

          {/* Stats Strip */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-orange-400">20+</p>
              <p className="mt-1 text-gray-300">Years&apos; experience</p>
              <p className="text-sm text-gray-400">Specialist stag &amp; hen group operator</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-orange-400">400,000+</p>
              <p className="mt-1 text-gray-300">Travellers</p>
              <p className="text-sm text-gray-400">Passengers handled so far</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-orange-400">30+</p>
              <p className="mt-1 text-gray-300">Destinations</p>
              <p className="text-sm text-gray-400">European &amp; UK stag and hen hotspots</p>
            </div>
          </div>

          {/* Trust Strip */}
          <p className="mt-10 text-center text-sm text-gray-400 tracking-wide uppercase">
            Groups Tour Operator &bull; DMC &bull; UK &amp; European stag &amp; hen specialists
          </p>
        </div>
      </section>

      {/* Section 2: Who We Are */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center">
            Who we are &amp; why agents trust us
          </h2>
          <div className="w-16 h-1 bg-orange-500 mx-auto mt-4 mb-8"></div>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto text-center leading-relaxed">
            Infinity Weekends was founded over 20 years ago by two former senior
            Thomas Cook managers and has grown into a specialist stag and hen
            groups tour operator and DMC. Most of our ground staff are ex British
            tour reps or resort management, so they understand exactly how UK
            customers travel, party and behave in resort. We are based in
            Benidorm and operate in more than 30 European destinations, including
            all the key UK party cities, giving your clients huge choice with one
            trusted partner.
          </p>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { stat: '20+', label: 'Years trading in group travel' },
              { stat: '400,000+', label: 'Travellers handled so far' },
              { stat: '30+', label: 'European & UK destinations' },
              { stat: '🇬🇧', label: 'English-speaking in-resort team based in Benidorm' },
            ].map((item) => (
              <div key={item.label} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-500">{item.stat}</p>
                <p className="mt-1 text-sm text-gray-600">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Who We Work With */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center">
            Who we work with
          </h2>
          <div className="w-16 h-1 bg-orange-500 mx-auto mt-4 mb-8"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto text-center leading-relaxed mb-10">
            We partner with UK travel agents, independent homeworkers, online
            travel brands and small agencies who want to grow their group
            business without needing to become stag and hen experts themselves.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              'High-street and independent travel agencies selling leisure and group travel',
              'Homeworkers and micro-agencies looking to boost commission with groups',
              'OTA-style and niche online brands that want a specialist stag & hen partner',
              'Tour operators that prefer to outsource stag & hen to an experienced DMC',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                <svg className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-gray-700">{item}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-center text-gray-600 italic max-w-3xl mx-auto">
            Whether you are an experienced group specialist or just starting to
            sell stag and hen, we provide the training, tools and support you
            need to convert enquiries confidently.
          </p>
        </div>
      </section>

      {/* Section 4: Why Sell Stag & Hen With Us */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center">
            Why sell stag &amp; hen with Infinity Weekends
          </h2>
          <div className="w-16 h-1 bg-orange-500 mx-auto mt-4 mb-10"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Column A */}
            <div className="bg-green-50 rounded-xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-2xl">💰</span> The benefits for your agency
              </h3>
              <ul className="space-y-4">
                <li>
                  <p className="font-semibold text-gray-900">Big groups, big commissions</p>
                  <p className="text-gray-600 text-sm mt-1">A typical party of 15–25 passengers means strong per-booking earnings.</p>
                </li>
                <li>
                  <p className="font-semibold text-gray-900">Repeat and referral business</p>
                  <p className="text-gray-600 text-sm mt-1">One stag or hen can turn into 20 summer holidays once the group sees how well the trip runs.</p>
                </li>
                <li>
                  <p className="font-semibold text-gray-900">Fewer options, easier sales</p>
                  <p className="text-gray-600 text-sm mt-1">Curated packages and recommended activities reduce choice overload and help you close faster.</p>
                </li>
              </ul>
            </div>
            {/* Column B */}
            <div className="bg-blue-50 rounded-xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-2xl">🛡️</span> The problems we solve for you
              </h3>
              <ul className="space-y-4">
                <li>
                  <p className="font-semibold text-gray-900">Hotels that &ldquo;don&rsquo;t take groups&rdquo;</p>
                  <p className="text-gray-600 text-sm mt-1">We know which hotels welcome stag &amp; hen, and more importantly, they know us.</p>
                </li>
                <li>
                  <p className="font-semibold text-gray-900">Group logistics</p>
                  <p className="text-gray-600 text-sm mt-1">Arrival times, check-ins, excursions and late-night issues are coordinated by our in-resort team, not your office.</p>
                </li>
                <li>
                  <p className="font-semibold text-gray-900">Difficult group dynamics</p>
                  <p className="text-gray-600 text-sm mt-1">Numbers going up and down, collecting money and last-minute changes are things we handle every day.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: How Working With Us Works */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center">
            How working with Infinity Weekends works
          </h2>
          <div className="w-16 h-1 bg-orange-500 mx-auto mt-4 mb-4"></div>
          <p className="text-lg text-gray-600 text-center mb-12">
            We keep the process simple so you can focus on selling, not firefighting.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '1',
                title: 'Register your agency',
                desc: 'Submit your details via our agent registration form so we can verify your agency and set up your access.',
              },
              {
                step: '2',
                title: 'Access training & offers',
                desc: "Once approved, you'll log in to our private agent portal to see live offers, destination guides, selling tips and ready-made superpackages.",
              },
              {
                step: '3',
                title: 'Sell, book and relax',
                desc: 'Use our packages, activity ideas and support to close the booking; our local teams then deliver the experience and handle the in-resort hassles.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-center text-gray-500 italic text-sm max-w-2xl mx-auto">
            You stay the face of the booking for your client, while we quietly do the heavy lifting in the background.
          </p>
        </div>
      </section>

      {/* Section 6: Destinations & Experiences */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center">
            Where your groups can go
          </h2>
          <div className="w-16 h-1 bg-orange-500 mx-auto mt-4 mb-4"></div>
          <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            We operate across Europe and the UK, covering the classic stag and
            hen hotspots your customers already ask for.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {/* European */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🌍</span> Top European destinations
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Albufeira', 'Amsterdam', 'Barcelona', 'Benalmadena',
                  'Benidorm', 'Berlin', 'Budapest', 'Dublin',
                  'Ibiza', 'Krakow', 'Magaluf', 'Marbella',
                  'Prague', 'Salou',
                ].map((dest) => (
                  <p key={dest} className="text-gray-700 py-1 px-3 bg-gray-50 rounded text-sm">{dest}</p>
                ))}
              </div>
            </div>
            {/* UK */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🇬🇧</span> Top UK destinations
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Bath', 'Birmingham', 'Bournemouth', 'Brighton',
                  'Bristol', 'Cardiff', 'Edinburgh', 'Leeds',
                  'Liverpool', 'London', 'Manchester', 'Newcastle',
                  'Nottingham',
                ].map((dest) => (
                  <p key={dest} className="text-gray-700 py-1 px-3 bg-gray-50 rounded text-sm">{dest}</p>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-12 bg-orange-50 rounded-xl p-6 max-w-4xl mx-auto text-center">
            <p className="text-gray-700 leading-relaxed">
              From cocktail-making classes and bottomless brunches to go karting,
              boat parties, bubble football, cheeky butlers and VIP club access
              — we build weekends around the experience the group actually wants.
            </p>
          </div>
        </div>
      </section>

      {/* Section 7: Agent Tools, Training & Support */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center">
            Agent tools, training &amp; support
          </h2>
          <div className="w-16 h-1 bg-orange-500 mx-auto mt-4 mb-4"></div>
          <p className="text-lg text-gray-600 text-center mb-10 max-w-3xl mx-auto">
            Inside the agent portal you&apos;ll find simple training materials,
            sales tips and ready-to-sell example packages designed to help you
            close bookings quickly.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
            {[
              'Ready-made superpackages with transfers, accommodation and key activities built in, based on current rates.',
              'Top tips on building clear, simple packages and explaining add-ons and upgrades.',
              'Guidance on what not to do, such as flights and unsuitable hotels, to protect your time and margin.',
              '24-hour emergency line and local reps in resort for when something needs attention.',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-gray-700 text-sm">{item}</p>
              </div>
            ))}
          </div>

          {/* Example Superpackage Card */}
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg border-2 border-orange-200 overflow-hidden">
            <div className="bg-orange-500 text-white px-6 py-3">
              <p className="text-sm font-medium uppercase tracking-wide">Example Superpackage</p>
            </div>
            <div className="p-6">
              <h4 className="text-lg font-bold text-gray-900">Benidorm – March</h4>
              <p className="text-2xl font-bold text-orange-500 mt-1">From £123 <span className="text-sm font-normal text-gray-500">per person</span></p>
              <p className="text-sm text-gray-500 mt-1">2 nights</p>
              <ul className="mt-4 space-y-2">
                {[
                  'Private return transfers',
                  'Smashed Bar Crawl',
                  'Centrally located accommodation',
                  '24-hour rep service',
                ].map((inc) => (
                  <li key={inc} className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {inc}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8: Contact & Enquiry Form */}
      <ContactEnquirySection />

      {/* Section 9: Final CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to start selling stag &amp; hen the easy way?
          </h2>
          <p className="mt-6 text-lg text-gray-300 leading-relaxed">
            If you&apos;d like to turn stag and hen enquiries into confident,
            profitable bookings — without taking on extra operational stress —
            register for your Infinity Weekends agent account today.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
            >
              Register as an Agent
            </Link>
            <Link
              href="/auth/login"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors border border-white/20"
            >
              Existing Agent Login
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-400">
            Agent access is free for approved agencies. We&apos;ll review your
            details and come back to you as soon as possible with login
            information.
          </p>
        </div>
      </section>

      {/* Authenticated Quick Access (shown when logged in) */}
      {status !== 'loading' && session && (
        <section className="py-12 bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Welcome back, {session.user?.name || 'Agent'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <Link
                href="/enquiries"
                className="flex items-center gap-4 p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Submit Enquiry</p>
                  <p className="text-sm text-gray-600">Get personalised quotes for your clients</p>
                </div>
              </Link>
              <Link
                href="/training"
                className="flex items-center gap-4 p-6 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
              >
                <div className="bg-green-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Training Materials</p>
                  <p className="text-sm text-gray-600">Access guides, tips and resources</p>
                </div>
              </Link>
            </div>
            {session.user?.role === 'admin' && (
              <div className="mt-6 text-center">
                <Link
                  href="/admin/dashboard"
                  className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Go to Admin Dashboard
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6 text-sm">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <Link href="/auth/register" className="hover:text-white transition-colors">Register</Link>
              <Link href="/auth/login" className="hover:text-white transition-colors">Agent Login</Link>
              <Link href="#contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
            <p className="text-xs text-gray-500 text-center md:text-right">
              Infinity Weekends — specialist stag &amp; hen group tour operator and DMC operating in 30+ European and UK destinations.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

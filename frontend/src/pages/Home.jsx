import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useLanguage } from '../i18n/LanguageContext'

export default function Home() {
  const navigate = useNavigate()
  const { account } = useAuth()
  const { t } = useLanguage()
  const [hoveredFeature, setHoveredFeature] = useState(null)

  // If user is logged in, redirect to dashboard
  useEffect(() => {
    if (account) {
      navigate('/dashboard')
    }
  }, [account, navigate])

  const features = [
    {
      id: 1,
      title: 'Real-time Tracking',
      description: 'Monitor your drone fleet in real-time with live GPS tracking',
      icon: '📍',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 2,
      title: 'Fleet Management',
      description: 'Efficiently manage and maintain your entire drone fleet',
      icon: '🚁',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 3,
      title: 'Delivery Tracking',
      description: 'Track shipments and manage deliveries seamlessly',
      icon: '🚚',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      id: 4,
      title: 'Analytics Dashboard',
      description: 'Get detailed insights with comprehensive analytics dashboard',
      icon: '📊',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      id: 5,
      title: 'Secure Platform',
      description: 'Enterprise-grade security for your delivery operations',
      icon: '🔒',
      gradient: 'from-indigo-500 to-blue-500'
    },
    {
      id: 6,
      title: '24/7 Support',
      description: 'Round-the-clock customer support for any issues',
      icon: '💬',
      gradient: 'from-pink-500 to-rose-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute top-40 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>

      <div className="relative z-10">
        {/* Navigation Header */}
        <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🚁</div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              DroneHub
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <LanguageSwitcher compact />
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 text-white font-semibold rounded-lg border-2 border-white/30 hover:border-white/60 transition-all duration-300 hover:bg-white/10"
            >
              {t('Login')}
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="btn-primary px-6 py-2.5"
            >
              {t('Sign Up')}
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="min-h-[85vh] px-4 py-20 flex flex-col items-center justify-center">
          <div className="text-center animate-fadeIn max-w-4xl">
            {/* Main Icon */}
            <div className="inline-block mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-75 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-6 shadow-2xl">
                  <span className="text-7xl block">🚁</span>
                </div>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {t('The Future of')}
              </span>
              <br />
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                {t('Drone Delivery')}
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              {t('CICD testingR evolutionize your delivery operations with our intelligent drone management platform.')} 
              {t('Real-time tracking, fleet optimization, and advanced analytics all in one place.')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button
                onClick={() => navigate('/signup')}
                className="btn-primary px-8 py-3 text-lg shadow-2xl shadow-blue-500/50 transform hover:scale-105"
              >
                {t('Get Started Free')}
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3 text-lg font-semibold text-white rounded-lg border-2 border-white/30 hover:border-white/60 hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
              >
                {t('Sign In')}
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✅</span>
                <span>Trusted by 500+ Companies</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-gray-600"></div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                <span>Industry Leading Technology</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-gray-600"></div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔒</span>
                <span>Bank-Grade Security</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="px-4 py-20 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to manage and scale your drone delivery operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className="group relative animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s` }}
                onMouseEnter={() => setHoveredFeature(feature.id)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                {/* Card Background Glow */}
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300`}></div>

                {/* Card */}
                <div className="relative h-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 transition-all duration-300 hover:bg-white/20 hover:border-white/40 transform hover:scale-105">
                  {/* Animated Border */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform translate-x-full group-hover:translate-x-0 transition-transform duration-1000"></div>

                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`text-6xl mb-4 transform transition-transform duration-300 ${hoveredFeature === feature.id ? 'scale-125 rotate-12' : ''}`}>
                      {feature.icon}
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-white mb-3">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-300">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="px-4 py-20 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                500+
              </div>
              <p className="text-gray-300">Active Companies</p>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                50M+
              </div>
              <p className="text-gray-300">Deliveries Completed</p>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
              <div className="text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                99.9%
              </div>
              <p className="text-gray-300">Uptime Guaranteed</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="px-4 py-20 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Delivery?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of companies already using our platform to streamline their operations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="btn-primary px-8 py-3 text-lg"
              >
                Create Account
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3 text-lg font-semibold text-white rounded-lg border-2 border-white/30 hover:border-white/60 hover:bg-white/10 transition-all duration-300"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-12 border-t border-white/10 mt-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h4 className="text-white font-bold mb-4">Product</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-white transition">Features</a></li>
                  <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                  <li><a href="#" className="hover:text-white transition">Security</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-white transition">About</a></li>
                  <li><a href="#" className="hover:text-white transition">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition">Careers</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">Support</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition">Contact</a></li>
                  <li><a href="#" className="hover:text-white transition">Status</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">Legal</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                  <li><a href="#" className="hover:text-white transition">Terms</a></li>
                  <li><a href="#" className="hover:text-white transition">Cookies</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between">
              <p className="text-gray-400 text-sm">
                © 2026 DroneHub. All rights reserved.
              </p>
              <div className="flex gap-6 mt-4 sm:mt-0">
                <a href="#" className="text-gray-400 hover:text-white transition">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white transition">LinkedIn</a>
                <a href="#" className="text-gray-400 hover:text-white transition">GitHub</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ChartBarIcon, 
  CpuChipIcon, 
  ShieldCheckIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const LandingPage = () => {
  const features = [
    {
      icon: ChartBarIcon,
      title: 'Real-Time Market Analysis',
      description: 'Get instant insights on Forex and Crypto markets with AI-powered analysis using Gemini AI.'
    },
    {
      icon: CpuChipIcon,
      title: 'Automated Trading Bot',
      description: 'Let our intelligent bot execute trades based on market signals and your preferences.'
    },
    {
      icon: SparklesIcon,
      title: 'AI-Powered Insights',
      description: 'Advanced machine learning algorithms provide predictive analytics and trend analysis.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with multi-tier access control and encrypted data storage.'
    }
  ];

  const plans = [
    {
      name: 'Basic',
      price: '$29.99',
      period: '/month',
      features: [
        'Real-time market data',
        'Basic AI analysis',
        'Email support',
        'Mobile app access'
      ],
      popular: false
    },
    {
      name: 'Premium',
      price: '$99.99',
      period: '/month',
      features: [
        'Everything in Basic',
        'Advanced AI insights',
        'Automated trading bot',
        'Priority support',
        'Custom strategies',
        'Risk management tools'
      ],
      popular: true
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="relative">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <CpuChipIcon className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">MK7</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Advanced AI Trading
              <span className="block gradient-bg bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              MK7 Trading Bot combines cutting-edge AI technology with real-time market analysis 
              to help you make smarter trading decisions in Forex and Cryptocurrency markets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register" 
                className="btn-primary text-lg px-8 py-3 flex items-center justify-center space-x-2"
              >
                <span>Start Trading Now</span>
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <Link 
                to="/login" 
                className="btn-secondary text-lg px-8 py-3"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Traders
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to analyze markets, automate trades, and maximize your profits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="card text-center hover:shadow-lg transition-shadow">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Trading Plan
            </h2>
            <p className="text-xl text-gray-600">
              Start with our basic plan or unlock advanced features with Premium.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`card relative ${plan.popular ? 'ring-2 ring-primary-500 transform scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center justify-center text-gray-600">
                        <ShieldCheckIcon className="h-4 w-4 text-success-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Link 
                    to="/register" 
                    className={`w-full block text-center py-3 px-6 rounded-lg font-medium transition-colors ${
                      plan.popular 
                        ? 'bg-primary-600 hover:bg-primary-700 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-bg py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Trading?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of traders who are already using MK7 to maximize their profits 
            with AI-powered market analysis and automated trading.
          </p>
          <Link 
            to="/register" 
            className="bg-white text-primary-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
          >
            <span>Start Your Journey</span>
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <CpuChipIcon className="h-8 w-8 text-primary-400" />
              <span className="text-2xl font-bold">MK7</span>
            </div>
            <p className="text-gray-400 mb-4">
              Advanced AI Trading Platform for Forex and Cryptocurrency Markets
            </p>
            <p className="text-gray-500 text-sm">
              © 2024 MK7 Trading Bot. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
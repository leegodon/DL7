import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ChartBarIcon, 
  CpuChipIcon, 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

const Dashboard = () => {
  const { user, isPremium } = useAuth();
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [recentAnalysis, setRecentAnalysis] = useState([]);

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    fetchCryptoPrices();
  }, []);

  const fetchCryptoPrices = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/market/crypto-prices`);
      setCryptoPrices(response.data);
    } catch (error) {
      console.error('Failed to fetch crypto prices:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      name: 'Active Trades',
      value: isPremium ? '12' : '3',
      icon: CpuChipIcon,
      change: '+4.2%',
      changeType: 'positive'
    },
    {
      name: 'Portfolio Value',
      value: isPremium ? '$24,521' : '$1,240',
      icon: CurrencyDollarIcon,
      change: '+2.1%',
      changeType: 'positive'
    },
    {
      name: 'Today\'s P&L',
      value: isPremium ? '+$421' : '+$52',
      icon: ArrowTrendingUpIcon,
      change: '+8.2%',
      changeType: 'positive'
    },
    {
      name: 'AI Signals',
      value: isPremium ? '24' : '8',
      icon: ChartBarIcon,
      change: '+12.5%',
      changeType: 'positive'
    }
  ];

  const topCryptos = Object.entries(cryptoPrices).slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.full_name}
          </h1>
          <p className="text-gray-600 mt-1">
            Here's your trading overview for today
          </p>
        </div>

        {/* Plan Upgrade Banner */}
        {!isPremium && (
          <div className="mb-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Upgrade to Premium</h3>
                <p className="text-primary-100">
                  Unlock advanced AI insights, automated trading, and unlimited market analysis
                </p>
              </div>
              <button className="bg-white text-primary-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Upgrade Now
              </button>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className={`text-sm mt-1 ${
                      stat.changeType === 'positive' ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      {stat.change}
                    </p>
                  </div>
                  <div className="p-3 bg-primary-50 rounded-lg">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Market Overview */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Market Overview</h3>
              <button 
                onClick={fetchCryptoPrices}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {topCryptos.map(([symbol, data]) => (
                  <div key={symbol} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{symbol}</p>
                      <p className="text-sm text-gray-600">${data.usd?.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        data.usd_24h_change > 0 ? 'text-success-600' : 'text-danger-600'
                      }`}>
                        {data.usd_24h_change > 0 ? '+' : ''}{data.usd_24h_change?.toFixed(2)}%
                      </p>
                      <p className="text-xs text-gray-500">24h change</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
            
            <div className="space-y-4">
              {[
                { type: 'analysis', symbol: 'BTC/USD', time: '2 hours ago', status: 'completed' },
                { type: 'trade', symbol: 'ETH/USD', time: '4 hours ago', status: 'profit' },
                { type: 'analysis', symbol: 'SOL/USD', time: '6 hours ago', status: 'completed' },
                { type: 'trade', symbol: 'ADA/USD', time: '8 hours ago', status: 'profit' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'analysis' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    {activity.type === 'analysis' ? (
                      <ChartBarIcon className={`h-4 w-4 ${
                        activity.type === 'analysis' ? 'text-blue-600' : 'text-green-600'
                      }`} />
                    ) : (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.type === 'analysis' ? 'AI Analysis' : 'Trade Executed'} - {activity.symbol}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {activity.time}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    activity.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {activity.status === 'completed' ? 'Completed' : 'Profit'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="card hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary-200">
            <div className="text-center">
              <ChartBarIcon className="h-8 w-8 text-primary-600 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-1">Market Analysis</h3>
              <p className="text-sm text-gray-600">Get AI-powered market insights</p>
            </div>
          </button>

          <button className="card hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary-200">
            <div className="text-center">
              <CpuChipIcon className="h-8 w-8 text-primary-600 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-1">Trading Bot</h3>
              <p className="text-sm text-gray-600">Configure automated trading</p>
            </div>
          </button>

          <button className="card hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary-200">
            <div className="text-center">
              <UserGroupIcon className="h-8 w-8 text-primary-600 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-1">Community</h3>
              <p className="text-sm text-gray-600">Connect with other traders</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
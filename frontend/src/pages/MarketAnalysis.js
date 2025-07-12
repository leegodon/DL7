import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ChartBarIcon, 
  SparklesIcon, 
  ClockIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

const MarketAnalysis = () => {
  const { user, isPremium } = useAuth();
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [symbol, setSymbol] = useState('BTC');
  const [timeframe, setTimeframe] = useState('1d');
  const [analysisType, setAnalysisType] = useState('technical');
  const [cryptoPrices, setCryptoPrices] = useState({});

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
    }
  };

  const runAnalysis = async () => {
    if (!isPremium && analysisType === 'advanced') {
      toast.error('Advanced analysis requires Premium subscription');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/analysis/gemini`, {
        symbol,
        timeframe,
        analysis_type: analysisType
      });
      
      setAnalysisData(response.data);
      toast.success('Analysis completed successfully!');
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error(error.response?.data?.detail || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const symbols = [
    { value: 'BTC', label: 'Bitcoin (BTC)' },
    { value: 'ETH', label: 'Ethereum (ETH)' },
    { value: 'BNB', label: 'Binance Coin (BNB)' },
    { value: 'ADA', label: 'Cardano (ADA)' },
    { value: 'SOL', label: 'Solana (SOL)' },
    { value: 'EURUSD', label: 'EUR/USD' },
    { value: 'GBPUSD', label: 'GBP/USD' },
    { value: 'USDJPY', label: 'USD/JPY' }
  ];

  const timeframes = [
    { value: '1h', label: '1 Hour' },
    { value: '4h', label: '4 Hours' },
    { value: '1d', label: '1 Day' },
    { value: '1w', label: '1 Week' },
    { value: '1m', label: '1 Month' }
  ];

  const analysisTypes = [
    { value: 'technical', label: 'Technical Analysis', premium: false },
    { value: 'fundamental', label: 'Fundamental Analysis', premium: false },
    { value: 'advanced', label: 'Advanced AI Analysis', premium: true }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Market Analysis</h1>
          <p className="text-gray-600">
            AI-powered market insights and technical analysis powered by Gemini AI
          </p>
        </div>

        {/* Premium Notice */}
        {!isPremium && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <InformationCircleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Limited Features</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  You're on the Basic plan. Upgrade to Premium for advanced AI analysis and unlimited requests.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Analysis Controls */}
          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Analysis Settings</h3>
              
              <div className="space-y-6">
                {/* Symbol Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Market Symbol
                  </label>
                  <select
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="input-field"
                  >
                    {symbols.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Timeframe Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timeframe
                  </label>
                  <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="input-field"
                  >
                    {timeframes.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Analysis Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Analysis Type
                  </label>
                  <div className="space-y-2">
                    {analysisTypes.map((type) => (
                      <label key={type.value} className="flex items-center">
                        <input
                          type="radio"
                          name="analysisType"
                          value={type.value}
                          checked={analysisType === type.value}
                          onChange={(e) => setAnalysisType(e.target.value)}
                          disabled={type.premium && !isPremium}
                          className="mr-2"
                        />
                        <span className={`text-sm ${
                          type.premium && !isPremium ? 'text-gray-400' : 'text-gray-700'
                        }`}>
                          {type.label}
                          {type.premium && (
                            <span className="ml-1 text-xs bg-yellow-100 text-yellow-800 px-1 rounded">
                              Premium
                            </span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Run Analysis Button */}
                <button
                  onClick={runAnalysis}
                  disabled={loading}
                  className={`w-full btn-primary flex items-center justify-center space-x-2 ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-4 w-4" />
                      <span>Run Analysis</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Current Prices */}
            <div className="card mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Prices</h3>
              <div className="space-y-3">
                {Object.entries(cryptoPrices).slice(0, 5).map(([symbol, data]) => (
                  <div key={symbol} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium text-gray-900 capitalize">{symbol}</span>
                    <div className="text-right">
                      <p className="text-sm font-medium">${data.usd?.toLocaleString()}</p>
                      <p className={`text-xs ${
                        data.usd_24h_change > 0 ? 'text-success-600' : 'text-danger-600'
                      }`}>
                        {data.usd_24h_change > 0 ? '+' : ''}{data.usd_24h_change?.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Analysis Results */}
          <div className="lg:col-span-2">
            {analysisData ? (
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Analysis Results: {analysisData.symbol}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <ClockIcon className="h-4 w-4" />
                    <span>{new Date(analysisData.generated_at).toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <SparklesIcon className="h-5 w-5 text-primary-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Generated by {analysisData.analyst}
                    </span>
                  </div>
                  
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                      {analysisData.analysis}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded">
                      {analysisData.timeframe}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                      AI Analysis
                    </span>
                  </div>
                  
                  <button
                    onClick={() => setAnalysisData(null)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear Results
                  </button>
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="text-center py-12">
                  <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Ready for Market Analysis
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Configure your analysis settings and click "Run Analysis" to get AI-powered insights
                  </p>
                  <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">What you'll get:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Market trend analysis</li>
                      <li>• Support and resistance levels</li>
                      <li>• AI-powered predictions</li>
                      <li>• Risk assessment</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketAnalysis;
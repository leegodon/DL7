import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  CpuChipIcon, 
  PlayIcon, 
  PauseIcon,
  CogIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const TradingBot = () => {
  const { user, isPremium } = useAuth();
  const [botActive, setBotActive] = useState(false);
  const [botConfig, setBotConfig] = useState({
    strategy: 'conservative',
    riskLevel: 'low',
    maxTradeAmount: 100,
    stopLoss: 5,
    takeProfit: 10,
    tradingPairs: ['BTC/USD', 'ETH/USD'],
    timeframe: '1h'
  });

  const handleConfigChange = (field, value) => {
    setBotConfig({
      ...botConfig,
      [field]: value
    });
  };

  const toggleBot = () => {
    if (!isPremium) {
      toast.error('Trading Bot requires Premium subscription');
      return;
    }
    
    setBotActive(!botActive);
    toast.success(botActive ? 'Trading Bot stopped' : 'Trading Bot started');
  };

  const saveConfiguration = () => {
    toast.success('Bot configuration saved successfully');
  };

  const strategies = [
    { value: 'conservative', label: 'Conservative', description: 'Low risk, steady returns' },
    { value: 'balanced', label: 'Balanced', description: 'Medium risk, balanced approach' },
    { value: 'aggressive', label: 'Aggressive', description: 'High risk, high reward' }
  ];

  const riskLevels = [
    { value: 'low', label: 'Low Risk', color: 'green' },
    { value: 'medium', label: 'Medium Risk', color: 'yellow' },
    { value: 'high', label: 'High Risk', color: 'red' }
  ];

  const tradingPairs = [
    'BTC/USD', 'ETH/USD', 'BNB/USD', 'ADA/USD', 'SOL/USD',
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD'
  ];

  const mockTrades = [
    { id: 1, pair: 'BTC/USD', type: 'BUY', amount: '$250', profit: '+$12.50', time: '2 hours ago', status: 'completed' },
    { id: 2, pair: 'ETH/USD', type: 'SELL', amount: '$150', profit: '+$8.75', time: '4 hours ago', status: 'completed' },
    { id: 3, pair: 'SOL/USD', type: 'BUY', amount: '$100', profit: '-$2.30', time: '6 hours ago', status: 'completed' },
    { id: 4, pair: 'ADA/USD', type: 'BUY', amount: '$75', profit: '+$4.20', time: '8 hours ago', status: 'completed' }
  ];

  const botStats = {
    totalTrades: isPremium ? 247 : 12,
    successRate: isPremium ? '68.4%' : '75.0%',
    totalProfit: isPremium ? '+$2,847' : '+$127',
    activePositions: isPremium ? 5 : 2
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Trading Bot</h1>
          <p className="text-gray-600">
            Automated trading powered by AI algorithms and market analysis
          </p>
        </div>

        {/* Premium Notice */}
        {!isPremium && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Premium Feature</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  The Trading Bot is a Premium feature. Upgrade your plan to enable automated trading.
                </p>
                <button className="mt-2 text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700">
                  Upgrade to Premium
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bot Control Panel */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Bot Control</h3>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  botActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {botActive ? 'Active' : 'Inactive'}
                </div>
              </div>

              {/* Bot Status */}
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
                  botActive ? 'bg-green-100' : 'bg-gray-100'
                } mb-4`}>
                  <CpuChipIcon className={`h-10 w-10 ${
                    botActive ? 'text-green-600' : 'text-gray-600'
                  }`} />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">MK7 Trading Bot</h4>
                <p className="text-sm text-gray-600">
                  {botActive ? 'Currently monitoring markets and executing trades' : 'Standing by for activation'}
                </p>
              </div>

              {/* Control Buttons */}
              <div className="space-y-4">
                <button
                  onClick={toggleBot}
                  disabled={!isPremium}
                  className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                    !isPremium 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : botActive
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {botActive ? (
                    <>
                      <PauseIcon className="h-5 w-5" />
                      <span>Stop Bot</span>
                    </>
                  ) : (
                    <>
                      <PlayIcon className="h-5 w-5" />
                      <span>Start Bot</span>
                    </>
                  )}
                </button>

                <button
                  onClick={saveConfiguration}
                  disabled={!isPremium}
                  className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium border transition-colors ${
                    !isPremium
                      ? 'border-gray-300 text-gray-500 cursor-not-allowed'
                      : 'border-primary-600 text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  <CogIcon className="h-4 w-4" />
                  <span>Save Config</span>
                </button>
              </div>
            </div>

            {/* Bot Statistics */}
            <div className="card mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Trades</span>
                  <span className="text-sm font-medium">{botStats.totalTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="text-sm font-medium text-green-600">{botStats.successRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Profit</span>
                  <span className="text-sm font-medium text-green-600">{botStats.totalProfit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Positions</span>
                  <span className="text-sm font-medium">{botStats.activePositions}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration & Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bot Configuration */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Bot Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strategy Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trading Strategy
                  </label>
                  <select
                    value={botConfig.strategy}
                    onChange={(e) => handleConfigChange('strategy', e.target.value)}
                    disabled={!isPremium}
                    className="input-field"
                  >
                    {strategies.map((strategy) => (
                      <option key={strategy.value} value={strategy.value}>
                        {strategy.label} - {strategy.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Risk Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Risk Level
                  </label>
                  <select
                    value={botConfig.riskLevel}
                    onChange={(e) => handleConfigChange('riskLevel', e.target.value)}
                    disabled={!isPremium}
                    className="input-field"
                  >
                    {riskLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Max Trade Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Trade Amount ($)
                  </label>
                  <input
                    type="number"
                    value={botConfig.maxTradeAmount}
                    onChange={(e) => handleConfigChange('maxTradeAmount', parseInt(e.target.value))}
                    disabled={!isPremium}
                    className="input-field"
                    min="10"
                    max="10000"
                  />
                </div>

                {/* Stop Loss */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stop Loss (%)
                  </label>
                  <input
                    type="number"
                    value={botConfig.stopLoss}
                    onChange={(e) => handleConfigChange('stopLoss', parseFloat(e.target.value))}
                    disabled={!isPremium}
                    className="input-field"
                    min="1"
                    max="50"
                    step="0.1"
                  />
                </div>

                {/* Take Profit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Take Profit (%)
                  </label>
                  <input
                    type="number"
                    value={botConfig.takeProfit}
                    onChange={(e) => handleConfigChange('takeProfit', parseFloat(e.target.value))}
                    disabled={!isPremium}
                    className="input-field"
                    min="1"
                    max="100"
                    step="0.1"
                  />
                </div>

                {/* Timeframe */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Analysis Timeframe
                  </label>
                  <select
                    value={botConfig.timeframe}
                    onChange={(e) => handleConfigChange('timeframe', e.target.value)}
                    disabled={!isPremium}
                    className="input-field"
                  >
                    <option value="1m">1 Minute</option>
                    <option value="5m">5 Minutes</option>
                    <option value="15m">15 Minutes</option>
                    <option value="1h">1 Hour</option>
                    <option value="4h">4 Hours</option>
                    <option value="1d">1 Day</option>
                  </select>
                </div>
              </div>

              {/* Trading Pairs */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Active Trading Pairs
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {tradingPairs.map((pair) => (
                    <label key={pair} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={botConfig.tradingPairs.includes(pair)}
                        onChange={(e) => {
                          const newPairs = e.target.checked
                            ? [...botConfig.tradingPairs, pair]
                            : botConfig.tradingPairs.filter(p => p !== pair);
                          handleConfigChange('tradingPairs', newPairs);
                        }}
                        disabled={!isPremium}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{pair}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* API Keys Notice */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Trading API Setup Required</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      To enable live trading, configure your broker API keys in the Admin section. 
                      Currently using demo mode with simulated trades.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Trades */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Bot Trades</h3>
              
              <div className="space-y-4">
                {mockTrades.map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${
                        trade.type === 'BUY' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {trade.type === 'BUY' ? (
                          <ChartBarIcon className="h-4 w-4 text-green-600" />
                        ) : (
                          <ChartBarIcon className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {trade.type} {trade.pair}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {trade.time}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{trade.amount}</p>
                      <p className={`text-sm ${
                        trade.profit.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {trade.profit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingBot;
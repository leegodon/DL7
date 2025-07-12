import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  UserGroupIcon, 
  CogIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  KeyIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState({
    basic_plan_price: 29.99,
    premium_plan_price: 99.99,
    trading_api_keys: {},
    payment_api_keys: {}
  });
  const [loading, setLoading] = useState(false);
  const [newApiKey, setNewApiKey] = useState({ service: '', key: '', type: 'trading' });

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'settings') {
      fetchSettings();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to fetch users');
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Failed to fetch settings');
    }
  };

  const updateUserPlan = async (userId, newPlan) => {
    try {
      await axios.put(`${API_URL}/api/admin/users/${userId}/upgrade`, {}, {
        params: { new_plan: newPlan }
      });
      toast.success(`User plan updated to ${newPlan}`);
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user plan:', error);
      toast.error('Failed to update user plan');
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      await axios.put(`${API_URL}/api/admin/settings`, settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const addApiKey = () => {
    if (!newApiKey.service || !newApiKey.key) {
      toast.error('Please provide both service name and API key');
      return;
    }

    const updatedSettings = { ...settings };
    if (newApiKey.type === 'trading') {
      updatedSettings.trading_api_keys[newApiKey.service] = newApiKey.key;
    } else {
      updatedSettings.payment_api_keys[newApiKey.service] = newApiKey.key;
    }

    setSettings(updatedSettings);
    setNewApiKey({ service: '', key: '', type: 'trading' });
    toast.success('API key added (click Save Settings to persist)');
  };

  const removeApiKey = (service, type) => {
    const updatedSettings = { ...settings };
    if (type === 'trading') {
      delete updatedSettings.trading_api_keys[service];
    } else {
      delete updatedSettings.payment_api_keys[service];
    }
    setSettings(updatedSettings);
    toast.success('API key removed (click Save Settings to persist)');
  };

  const adminStats = {
    totalUsers: users.length,
    basicUsers: users.filter(u => u.user_type === 'basic').length,
    premiumUsers: users.filter(u => u.user_type === 'premium').length,
    revenue: users.filter(u => u.user_type === 'premium').length * settings.premium_plan_price +
             users.filter(u => u.user_type === 'basic').length * settings.basic_plan_price
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'users', name: 'Users', icon: UserGroupIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon },
    { id: 'api-keys', name: 'API Keys', icon: KeyIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">
            Manage users, settings, and system configuration
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="card">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <UserGroupIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{adminStats.totalUsers}</p>
                  </div>
                </div>
              </div>
              
              <div className="card">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Premium Users</p>
                    <p className="text-2xl font-bold text-gray-900">{adminStats.premiumUsers}</p>
                  </div>
                </div>
              </div>
              
              <div className="card">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <UserGroupIcon className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Basic Users</p>
                    <p className="text-2xl font-bold text-gray-900">{adminStats.basicUsers}</p>
                  </div>
                </div>
              </div>
              
              <div className="card">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <ChartBarIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">${adminStats.revenue.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-sm font-medium text-gray-900">API Services</p>
                  <p className="text-xs text-green-600">Operational</p>
                </div>
                <div className="text-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-sm font-medium text-gray-900">Database</p>
                  <p className="text-xs text-green-600">Connected</p>
                </div>
                <div className="text-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-sm font-medium text-gray-900">Trading Bot</p>
                  <p className="text-xs text-yellow-600">Setup Required</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">User Management</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.user_type === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.user_type === 'premium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.user_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <select
                          value={user.user_type}
                          onChange={(e) => updateUserPlan(user.id, e.target.value)}
                          className="text-sm border-gray-300 rounded-md"
                        >
                          <option value="basic">Basic</option>
                          <option value="premium">Premium</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">System Settings</h3>
            
            <div className="space-y-6">
              {/* Pricing Settings */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Plan Pricing</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Basic Plan Price ($)
                    </label>
                    <input
                      type="number"
                      value={settings.basic_plan_price}
                      onChange={(e) => setSettings({
                        ...settings,
                        basic_plan_price: parseFloat(e.target.value)
                      })}
                      className="input-field"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Premium Plan Price ($)
                    </label>
                    <input
                      type="number"
                      value={settings.premium_plan_price}
                      onChange={(e) => setSettings({
                        ...settings,
                        premium_plan_price: parseFloat(e.target.value)
                      })}
                      className="input-field"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={saveSettings}
                  disabled={loading}
                  className={`btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'api-keys' && (
          <div className="space-y-6">
            {/* Add New API Key */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Add API Key</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newApiKey.type}
                    onChange={(e) => setNewApiKey({ ...newApiKey, type: e.target.value })}
                    className="input-field"
                  >
                    <option value="trading">Trading</option>
                    <option value="payment">Payment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                  <input
                    type="text"
                    value={newApiKey.service}
                    onChange={(e) => setNewApiKey({ ...newApiKey, service: e.target.value })}
                    placeholder="e.g., Binance, Stripe"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                  <input
                    type="password"
                    value={newApiKey.key}
                    onChange={(e) => setNewApiKey({ ...newApiKey, key: e.target.value })}
                    placeholder="Enter API key"
                    className="input-field"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={addApiKey}
                    className="btn-primary w-full flex items-center justify-center space-x-2"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Trading API Keys */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Trading API Keys</h3>
              
              {Object.keys(settings.trading_api_keys || {}).length === 0 ? (
                <p className="text-gray-500 text-center py-8">No trading API keys configured</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(settings.trading_api_keys || {}).map(([service, key]) => (
                    <div key={service} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{service}</p>
                        <p className="text-sm text-gray-500">
                          ****{key.slice(-4)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeApiKey(service, 'trading')}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment API Keys */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment API Keys</h3>
              
              {Object.keys(settings.payment_api_keys || {}).length === 0 ? (
                <p className="text-gray-500 text-center py-8">No payment API keys configured</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(settings.payment_api_keys || {}).map(([service, key]) => (
                    <div key={service} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{service}</p>
                        <p className="text-sm text-gray-500">
                          ****{key.slice(-4)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeApiKey(service, 'payment')}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={saveSettings}
                disabled={loading}
                className={`btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Saving...' : 'Save All API Keys'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
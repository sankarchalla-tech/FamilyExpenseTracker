import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFamily } from '../context/FamilyContext';
import { familyAPI } from '../api/family';
import FamilyMemberManagement from '../components/FamilyMemberManagement';
import logger from '../utils/logger';

function FamilySettingsPage() {
  const { user } = useAuth();
  const { selectedFamily, isAdmin } = useFamily();
  const { familyId } = useParams();
  const navigate = useNavigate();
  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    currency: 'INR',
    timezone: 'Asia/Kolkata'
  });
  const [message, setMessage] = useState(null);

  const currencies = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' }
  ];

  const timezones = [
    'Asia/Kolkata',
    'Asia/Dubai',
    'Europe/London',
    'Europe/Paris',
    'America/New_York',
    'America/Los_Angeles',
    'America/Chicago',
    'Asia/Tokyo',
    'Australia/Sydney',
    'UTC'
  ];

  useEffect(() => {
    if (parseInt(familyId) !== selectedFamily?.id) {
      navigate('/dashboard');
      return;
    }
    if (!isAdmin()) {
      navigate('/dashboard');
      return;
    }
    loadFamily();
  }, [familyId]);

  const loadFamily = async () => {
    try {
      const data = await familyAPI.getFamily(familyId);
      setFamily(data);
      setFormData({
        name: data.name || '',
        currency: data.currency || 'INR',
        timezone: data.timezone || 'Asia/Kolkata'
      });
    } catch (error) {
      console.error('Error loading family:', error);
      setMessage({
        type: 'error',
        text: 'Failed to load family settings'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      // Note: This would require adding updateFamily API endpoint
      // For now, we'll simulate the update
      logger.log('Updating family settings:', formData);
      
      setFamily({ ...family, ...formData });
      setEditing(false);
      
      setMessage({
        type: 'success',
        text: 'Settings updated successfully!'
      });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to update settings'
      });
    }
  };

  const handleDeleteFamily = async () => {
    if (!confirm(`Are you sure you want to delete "${family.name}"? This action cannot be undone and will remove all associated data including expenses, income, and members.`)) {
      return;
    }

    try {
      await familyAPI.deleteFamily(familyId);
      navigate('/dashboard');
      // Clear selected family from context and localStorage
      setSelectedFamily(null);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to delete family'
      });
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                ← Back to Dashboard
              </Link>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Family Settings
              </h1>
            </div>
            <span className="text-gray-700 dark:text-gray-300">{user?.name}</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {family?.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your family's settings and preferences
              </p>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
              >
                Edit Settings
              </button>
            )}
          </div>

          {!editing ? (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Family Name
                    </label>
                    <p className="text-gray-900 dark:text-white">{family?.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Created By
                    </label>
                    <p className="text-gray-900 dark:text-white">{family?.created_by === user?.id ? 'You' : 'Another admin'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Created On
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(family?.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Member Count
                    </label>
                    <p className="text-gray-900 dark:text-white">{family?.members?.length || 0} members</p>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Currency
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {currencies.find(c => c.code === formData.currency)?.symbol} {formData.currency}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Timezone
                    </label>
                    <p className="text-gray-900 dark:text-white">{formData.timezone}</p>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Family Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Total Members</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                      {family?.members?.length || 0}
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400 mb-1">Admins</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                      {family?.members?.filter(m => m.role === 'admin').length || 0}
                    </p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Members</p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">
                      {family?.members?.filter(m => m.role === 'member').length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdateSettings} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Family Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Currency
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                      {currencies.map(currency => (
                        <option key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.code} - {currency.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Timezone
                    </label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                      {timezones.map(timezone => (
                        <option key={timezone} value={timezone}>{timezone}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      name: family.name,
                      currency: family.currency || 'INR',
                      timezone: family.timezone || 'Asia/Kolkata'
                    });
                  }}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Family Member Management */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            {logger.log('FamilySettings: isAdmin() =', isAdmin(), 'family.members =', family.members)}
            {isAdmin() && (
              <FamilyMemberManagement
                familyId={familyId}
                isAdmin={isAdmin()}
                familyMembers={family.members || []}
                onUpdate={loadFamily}
              />
            )}
            {!isAdmin() && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-yellow-800 dark:text-yellow-200 text-center">
                  <strong>Access Denied:</strong> Only family administrators can manage family members.
                </p>
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-4">Danger Zone</h3>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-900 dark:text-red-300 mb-4">
                <strong>Warning:</strong> Deleting a family is permanent and cannot be undone. This will remove all expenses, income, categories, and member data.
              </p>
              <button
                onClick={handleDeleteFamily}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg"
              >
                Delete Family
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div className={`fixed top-4 right-4 p-4 rounded-lg ${
            message.type === 'error' 
              ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' 
              : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
          }`}>
            {message.text}
          </div>
        )}
      </main>
    </div>
  );
}

export default FamilySettingsPage;
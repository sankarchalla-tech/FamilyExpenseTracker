import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFamily } from '../context/FamilyContext';
import { familyAPI } from '../api/family';
import { expenseAPI } from '../api/expense';
import { categoryAPI } from '../api/category';
import { analyticsAPI } from '../api/analytics';
import logger from '../utils/logger';

import CashFlowSummary from '../components/CashFlowSummary';
import IncomeTable from '../components/IncomeTable';
import EnhancedExpenseTable from '../components/EnhancedExpenseTable';
import CategoryDonutChart from '../components/CategoryDonutChart';
import FutureExpenseTable from '../components/FutureExpenseTable';
import FamilyMembers from '../components/FamilyMembers';
import LoadingSpinner from '../components/LoadingSpinner';

function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { selectedFamily, setSelectedFamily, isAdmin } = useFamily();
  const [families, setFamilies] = useState([]);
  const [showCreateFamily, setShowCreateFamily] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedMember, setSelectedMember] = useState('all');
   const [loading, setLoading] = useState(true);
   const [familyMembers, setFamilyMembers] = useState([]);

  useEffect(() => {
    loadFamilies();
  }, []);

  useEffect(() => {
    if (selectedFamily) {
      loadFamilyMembers(selectedFamily.id);
      loadAnalytics(selectedFamily.id, selectedMember);
      if (activeTab === 'expenses') {
        loadExpenses(selectedFamily.id, selectedMember);
      }
    } else {
      // Clear familyMembers if no family selected
      setFamilyMembers([]);
    }
  }, [selectedFamily, selectedMonth, activeTab, selectedMember]);

  const loadFamilies = async () => {
    logger.log('Loading families...');
    try {
      const data = await familyAPI.getFamilies();
      logger.log('Families loaded:', data);
      logger.log('Number of families:', data.length);
      setFamilies(data);
      
      // Force clear any problematic family ID 2 selections
      if (selectedFamily && selectedFamily.id === 2) {
        logger.log('Clearing problematic family ID 2 from selection');
        setSelectedFamily(null);
        return;
      }
      
      // Check if selected family is still valid for this user
      if (selectedFamily && data.length > 0) {
        const isValidFamily = data.some(family => family.id === selectedFamily.id);
        if (!isValidFamily) {
          logger.log('Selected family is not valid, clearing selection');
          setSelectedFamily(data[0]);
        }
      } else if (data.length > 0 && !selectedFamily) {
        setSelectedFamily(data[0]);
      }
    } catch (error) {
      console.error('Error loading families:', error);
      console.error('Error details:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadFamilyMembers = async (familyId) => {
    try {
      const members = await familyAPI.getFamilyMembers(familyId);
      setFamilyMembers(members);
    } catch (error) {
      console.error('Error loading family members:', error);
    }
  };

  const loadAnalytics = async (familyId, memberId = 'all') => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const startDate = new Date(year, month, 1).toISOString().split('T')[0];
    const lastDay = new Date(year, month + 1, 0);
    const endDate = lastDay.toISOString().split('T')[0];

    logger.log('Loading analytics:', { familyId, startDate, endDate, memberId });

    try {
      const data = await analyticsAPI.getAnalytics(familyId, startDate, endDate, memberId === 'all' ? null : memberId);
      logger.log('Analytics loaded:', data);
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      console.error('Error details:', error.message);
    }
  };

  const loadExpenses = async (familyId, memberId = 'all') => {
    logger.log('Loading expenses:', { familyId, memberId });
    try {
      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth();
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const lastDay = new Date(year, month + 1, 0);
      const endDate = lastDay.toISOString().split('T')[0];

      const filters = { startDate, endDate };
      if (memberId && memberId !== 'all') {
        filters.userId = parseInt(memberId);
      }

      logger.log('Fetching expenses with filters:', filters);

      const [expensesData, categoriesData] = await Promise.all([
        expenseAPI.getExpenses(familyId, filters),
        categoryAPI.getCategories(familyId)
      ]);
      setExpenses(expensesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const handleCreateFamily = async (e) => {
    e.preventDefault();
    try {
      const family = await familyAPI.createFamily(newFamilyName);
      setFamilies([...families, family]);
      setSelectedFamily(family);
      setNewFamilyName('');
      setShowCreateFamily(false);
    } catch (error) {
      console.error('Error creating family:', error);
    }
  };



  const handleEditExpense = (expense) => {
    navigate(`/family/${selectedFamily?.id}/expenses`, { state: { editingExpense: expense } });
  };

  const handleDeleteExpense = async (expenseId, expenseUserId) => {
    // Only admins can delete any expense, regular users can only delete their own
    const canDelete = isAdmin() || expenseUserId === user?.id;
    
    if (!canDelete) {
      alert('You can only delete your own expenses');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      await expenseAPI.deleteExpense(selectedFamily?.id, expenseId);
      loadExpenses(selectedFamily?.id, selectedMember);
      loadAnalytics(selectedFamily?.id);
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="large" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Family Expense Tracker
              </h1>
            </button>
            <div className="flex items-center gap-3">
              {selectedFamily && isAdmin() && (
                <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-full font-medium">
                  Admin
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                {/* <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Family
                </label> */}
                <select
                  value={selectedFamily?.id || 'all'}
                  onChange={(e) => {
                    const familyId = e.target.value;
                    if (familyId === 'all') {
                      setSelectedFamily(null);
                    } else {
                      const family = families.find(f => f.id == familyId);
                      setSelectedFamily(family);
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Families</option>
                  {families.map((family) => (
                    <option key={family.id} value={family.id}>
                      {family.name}
                      {family.id === user?.id && ' (You)'}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => {
                  logger.log('Mine Only button clicked in nav, user ID:', user?.id);
                  setSelectedMember(user?.id || 'all');
                }}
                className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                Mine Only
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg text-sm"
              >
                Profile
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {families.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome, {user?.name}!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first family to start tracking expenses
            </p>
            <button
              onClick={() => setShowCreateFamily(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
            >
              Create Family
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h2>

              <div className="space-y-4 mb-8">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                  {families.length > 1 && (
                    <div className="flex-1 w-full sm:w-auto">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Family
                      </label>
                      <select
                        value={selectedFamily?.id || ''}
                        onChange={(e) => {
                          const family = families.find(f => f.id === parseInt(e.target.value));
                          setSelectedFamily(family);
                          setSelectedMember('all');
                        }}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      >
                        {families.map(family => (
                          <option key={family.id} value={family.id}>{family.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="flex-1 w-full sm:w-auto">
                    <FamilyMembers
                      familyId={selectedFamily?.id}
                      selectedMember={selectedMember}
                      onMemberChange={setSelectedMember}
                    />
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        logger.log('Mine Only button clicked in content area, user ID:', user?.id);
                        setSelectedMember(user?.id || 'all');
                      }}
                      className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    >
                      Mine Only
                    </button>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="month"
                      value={selectedMonth.toISOString().slice(0, 7)}
                      onChange={(e) => setSelectedMonth(new Date(e.target.value + '-01'))}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      onClick={() => setSelectedMonth(new Date())}
                      className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                      title="Current Month"
                    >
                      Today
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-4 py-2 font-medium rounded-lg ${
                      activeTab === 'dashboard'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('income')}
                    className={`px-4 py-2 font-medium rounded-lg ${
                      activeTab === 'income'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    Income
                  </button>
                  <button
                    onClick={() => setActiveTab('expenses')}
                    className={`px-4 py-2 font-medium rounded-lg ${
                      activeTab === 'expenses'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    Expenses
                  </button>
                  <button
                    onClick={() => setActiveTab('future')}
                    className={`px-4 py-2 font-medium rounded-lg ${
                      activeTab === 'future'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    EMIs
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {activeTab === 'dashboard' && (
                <>
                  {isAdmin() && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl shadow-sm p-6 mb-6">
                      <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-3">
                        👑 Admin Panel
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <button
                          onClick={() => navigate(`/family/${selectedFamily?.id}`)}
                          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg text-sm"
                        >
                          Manage Members
                        </button>
                        <button
                          onClick={() => navigate(`/family/${selectedFamily?.id}/categories`)}
                          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg text-sm"
                        >
                          Manage Categories
                        </button>
                        <button
                          onClick={() => navigate(`/family/${selectedFamily?.id}/settings`)}
                          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg text-sm"
                        >
                          Family Settings
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <CashFlowSummary analytics={analytics} />
                    <CategoryDonutChart analytics={analytics} />
                  </div>

                  {analytics && analytics.perMember.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Spending by Member
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                          - {selectedMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                        </span>
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Who's spending most this month
                      </p>
                      <div className="space-y-3">
                        {analytics.perMember.slice(0, 5).map((member, index) => {
                          const percentage = analytics.total > 0 ? (member.total / analytics.total) * 100 : 0;
                          const isHighest = index === 0;
                          return (
                            <div key={member.id} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    isHighest
                                      ? 'bg-yellow-100 dark:bg-yellow-900 ring-2 ring-yellow-400 dark:ring-yellow-500'
                                      : 'bg-blue-100 dark:bg-blue-900'
                                  }`}>
                                    <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                                      {member.name.charAt(0)}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-900 dark:text-white">{member.name}</span>
                                    {isHighest && (
                                      <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-full">
                                        Highest
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-gray-900 dark:text-white text-lg">
                                    ₹{member.total.toFixed(2)}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {percentage.toFixed(1)}%
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {analytics.perMember.length > 5 && (
                          <div className="text-center pt-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              +{analytics.perMember.length - 5} more members
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'income' && (
                <IncomeTable familyId={selectedFamily?.id} selectedMonth={selectedMonth} selectedMember={selectedMember} />
              )}

              {activeTab === 'expenses' && (
                <>
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses</h2>
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                        - {selectedMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <button
                      onClick={() => navigate(`/family/${selectedFamily?.id}/expenses`)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                    >
                      + Add Expense
                    </button>
                    </div>

                    <EnhancedExpenseTable
                    expenses={expenses}
                    categories={categories}
                    onEdit={handleEditExpense}
                    onDelete={handleDeleteExpense}
                    selectedMonth={selectedMonth}
                    currentUser={user}
                    isAdmin={isAdmin()}
                  />
                </>
              )}

              {activeTab === 'future' && (
                <FutureExpenseTable familyId={selectedFamily?.id} selectedMonth={selectedMonth} selectedMember={selectedMember} />
              )}
            </div>

            {isAdmin() && (
              <div className="mt-8">
                <Link
                  to={`/family/${selectedFamily?.id}`}
                  className="block w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg text-center transition-colors"
                >
                  Manage Family Members
                </Link>
              </div>
            )}
          </>
        )}

        {showCreateFamily && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Create New Family
              </h3>
              <form onSubmit={handleCreateFamily} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Family Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newFamilyName}
                    onChange={(e) => setNewFamilyName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="My Family"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCreateFamily(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default DashboardPage;
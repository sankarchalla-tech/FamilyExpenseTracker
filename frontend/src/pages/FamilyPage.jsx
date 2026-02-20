import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFamily } from '../context/FamilyContext';
import { familyAPI } from '../api/family';
import UserManagement from '../components/UserManagement';
import FamilyMemberManagement from '../components/FamilyMemberManagement';
import { getErrorMessage } from '../utils/getErrorMessage';

function FamilyPage() {
  const { user } = useAuth();
  const { selectedFamily } = useFamily();
  const { familyId } = useParams();
  const navigate = useNavigate();
  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [addMemberForm, setAddMemberForm] = useState({ email: '', name: '', role: 'member' });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (parseInt(familyId) !== selectedFamily?.id) {
      navigate('/dashboard');
      return;
    }
    loadFamily();
  }, [familyId]);

  const loadFamily = async () => {
    try {
      const data = await familyAPI.getFamily(familyId);
      setFamily(data);
    } catch (error) {
      console.error('Error loading family:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      const result = await familyAPI.addMember(
        familyId,
        addMemberForm.email,
        addMemberForm.name,
        addMemberForm.role
      );
      
      const newMember = {
        id: result.id,
        name: result.name,
        email: result.email,
        role: result.role,
        joined_at: new Date().toISOString()
      };
      
      setFamily({ ...family, members: [...family.members, newMember] });
      setAddMemberForm({ email: '', name: '', role: 'member' });
      setShowAddMember(false);
      
      setMessage({
        type: 'success',
        text: result.isNewUser 
          ? `${result.name} added! Default password: password123` 
          : `${result.name} added to family!`
      });
      
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: getErrorMessage(error, 'Failed to add member')
      });
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from the family?`)) {
      return;
    }

    try {
      await familyAPI.removeMember(familyId, memberId);
      setFamily({
        ...family,
        members: family.members.filter(m => m.id !== memberId)
      });
      setMessage({
        type: 'success',
        text: `${memberName} removed from family`
      });
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: getErrorMessage(error, 'Failed to remove member')
      });
    }
  };

  const isAdmin = family?.role === 'admin';

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const currentMember = family?.members?.find(m => m.id === user?.id);
  const canManageMembers = currentMember?.role === 'admin';

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
                {selectedFamily?.name}
              </h1>
            </div>
            <span className="text-gray-700 dark:text-gray-300">{user?.name}</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{family?.name}</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Created on {new Date(family?.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Family Members ({family?.members?.length || 0})
            </h3>
            <div className="flex gap-2">
              {canManageMembers && (
                <>
                  <button
                    onClick={() => setShowAddMember(true)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-sm"
                  >
                    Add Member
                  </button>
                  <button
                    onClick={() => navigate('/profile')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm"
                  >
                    My Profile
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* Family Member Management Section */}
          <FamilyMemberManagement
            familyId={familyId}
            isAdmin={canManageMembers}
            familyMembers={family.members || []}
            onUpdate={() => loadFamily()}
          />

          {family?.members && family.members.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {family.members.map((member) => (
                <div key={member.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg relative">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <span className="text-lg font-medium text-blue-600 dark:text-blue-300">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{member.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                      {member.role}
                    </span>
                    {canManageMembers && member.id !== user?.id && (
                      <button
                        onClick={() => handleRemoveMember(member.id, member.name)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 p-1"
                        title="Remove member"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No members found</p>
          )}
        </div>

        <div className="mt-6">
          <Link
            to={`/family/${familyId}/expenses`}
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
          >
            View Expenses
          </Link>
        </div>

        {message && (
          <div className={`mt-4 p-4 rounded-lg ${
            message.type === 'error' 
              ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' 
              : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
          }`}>
            {message.text}
          </div>
        )}

        {showAddMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Add Family Member
              </h3>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={addMemberForm.email}
                    onChange={(e) => setAddMemberForm({ ...addMemberForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="member@example.com"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    If the user doesn't exist, they will be created with default password
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name (required for new users)
                  </label>
                  <input
                    type="text"
                    value={addMemberForm.name}
                    onChange={(e) => setAddMemberForm({ ...addMemberForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role
                  </label>
                  <select
                    value={addMemberForm.role}
                    onChange={(e) => setAddMemberForm({ ...addMemberForm, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddMember(false);
                      setAddMemberForm({ email: '', name: '', role: 'member' });
                    }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                  >
                    Add Member
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

export default FamilyPage;

import React, { useState } from 'react';
import { familyAPI } from '../api/family';
import { useFamily } from '../context/FamilyContext';

export default function FamilyMemberManagement({ familyId, isAdmin, familyMembers, onUpdate }) {
  const { selectedFamily, setSelectedFamily: updateSelectedFamily } = useFamily();
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'member'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Update local state when familyMembers prop changes
  React.useEffect(() => {
    // This will trigger re-render when family members are updated
  }, [familyMembers]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const result = await familyAPI.addMember(
        familyId,
        formData.email,
        formData.name,
        formData.role
      );
      
      onUpdate(); // Refresh family members list
      
      // Also update the selected family in context to refresh dashboard
      if (selectedFamily?.id === parseInt(familyId)) {
        const updatedFamily = await familyAPI.getFamily(familyId);
        updateSelectedFamily(updatedFamily);
      }
      
      setFormData({ email: '', name: '', role: 'member' });
      setShowAddMember(false);
      setMessage({
        type: 'success',
        text: `${result.name || formData.email} added to family successfully`
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to add member'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from the family?`)) {
      return;
    }

    setLoading(true);
    try {
      await familyAPI.removeMember(familyId, memberId);
      onUpdate(); // Refresh family members list
      
      // Also update the selected family in context to refresh dashboard
      if (selectedFamily?.id === parseInt(familyId)) {
        const updatedFamily = await familyAPI.getFamily(familyId);
        updateSelectedFamily(updatedFamily);
      }
      
      setMessage({
        type: 'success',
        text: `${memberName} removed from family successfully`
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to remove member'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setFormData({
      email: member.email,
      name: member.name,
      role: member.role
    });
    setShowAddMember(true);
  };

  const handleUpdateMember = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Remove then re-add member with updated info
      await familyAPI.removeMember(familyId, editingMember.id);
      await familyAPI.addMember(
        familyId,
        formData.email,
        formData.name,
        formData.role
      );
      
      onUpdate(); // Refresh family members list
      
      // Also update the selected family in context to refresh dashboard
      if (selectedFamily?.id === parseInt(familyId)) {
        const updatedFamily = await familyAPI.getFamily(familyId);
        updateSelectedFamily(updatedFamily);
      }
      
      setEditingMember(null);
      setFormData({ email: '', name: '', role: 'member' });
      setShowAddMember(false);
      setMessage({
        type: 'success',
        text: `${formData.name} updated successfully`
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to update member'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Family Members ({familyMembers.length})
        </h3>
        {isAdmin && (
          <button
            onClick={() => {
              setEditingMember(null);
              setFormData({ email: '', name: '', role: 'member' });
              setShowAddMember(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm"
          >
            + Add Member
          </button>
        )}
      </div>

      {/* Members List */}
      <div className="space-y-4 mb-6">
        {familyMembers.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                  {member.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {member.name}
                  {member.joined_at && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                      (Joined {new Date(member.joined_at).toLocaleDateString()})
                    </span>
                  )}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                member.role === 'admin' 
                  ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              }`}>
                {member.role}
              </span>
              {isAdmin && member.role !== 'owner' && (
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditMember(member)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 p-1"
                    title="Edit member"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 0L15 5m-4 0v9" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleRemoveMember(member.id, member.name)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 p-1"
                    title="Remove member"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingMember ? 'Edit Family Member' : 'Add New Family Member'}
            </h3>
            
            {message && (
              <div className={`mb-4 p-3 rounded-lg ${
                message.type === 'error' 
                  ? 'bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300' 
                  : 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300'
              }`}>
                <p className="text-sm">{message.text}</p>
              </div>
            )}

            <form onSubmit={editingMember ? handleUpdateMember : handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="member@example.com"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  If user doesn't exist, they will be created with default password "password123"
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name (required for new users)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
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
                    setEditingMember(null);
                    setFormData({ email: '', name: '', role: 'member' });
                    setMessage(null);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : (editingMember ? 'Update' : 'Add Member')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
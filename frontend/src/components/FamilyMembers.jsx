import { useState, useEffect } from 'react';
import { familyAPI } from '../api/family';
import { useAuth } from '../context/AuthContext';
import logger from '../utils/logger';

export default function FamilyMembers({ familyId, selectedMember, onMemberChange }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadMembers = async () => {
    try {
      const family = await familyAPI.getFamily(familyId);
      setMembers(family.members || []);
    } catch (error) {
      console.error('Error loading family members:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [familyId]);

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Loading members...</div>;
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Family Member
        </label>
        <select
          value={selectedMember || 'all'}
          onChange={(e) => {
            logger.log('FamilyMembers dropdown changed to:', e.target.value);
            onMemberChange(e.target.value);
          }}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white cursor-pointer hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          <option value="all">All Members</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
              {member.id === user?.id && ' (You)'}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
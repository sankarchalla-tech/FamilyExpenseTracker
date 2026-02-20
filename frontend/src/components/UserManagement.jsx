import { useState } from 'react';
import { userAPI } from '../api/user';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function UserManagement({ familyId, familyMembers, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(null);

  const handleResetPassword = async (userId, userName) => {
    if (!confirm(`Are you sure you want to reset password for ${userName}?`)) {
      return;
    }

    setLoading(true);
    try {
      const result = await userAPI.resetPassword(userId);
      setMessage({
        type: 'success',
        text: `${userName}'s password has been reset. New password: ${result.temporaryPassword}`
      });
      setShowResetConfirm(null);
    } catch (error) {
      setMessage({
        type: 'error',
        text: getErrorMessage(error, 'Failed to reset password')
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        User Management
      </h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {familyMembers.map((member) => (
              <tr key={member.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {member.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {member.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {member.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => setShowResetConfirm(member.id)}
                    disabled={loading}
                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium disabled:opacity-50"
                  >
                    Reset Password
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {message && (
        <div className={`mt-4 p-4 rounded-lg ${
          message.type === 'error' 
            ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' 
            : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
        }`}>
          <div className="font-medium">{message.text}</div>
          {message.type === 'success' && (
            <div className="mt-2 text-sm">
              Please share this temporary password with the user. They should change it immediately after logging in.
            </div>
          )}
        </div>
      )}

      {showResetConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border sm:my-8 sm:w-full sm:max-w-lg sm:p-6 md:my-10">
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl">
              <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Confirm Password Reset
                </h3>
                <button
                  onClick={() => setShowResetConfirm(null)}
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 10.586l4.293 4.293a1 1 0 111.414 0L10 11.414l-4.293 4.293a1 1 0 01-1.414 0L8.586 10l-4.293-4.293a1 1 0 00-1.414 0L10 8.586l4.293-4.293a1 1 0 111.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <p className="text-gray-700 dark:text-gray-300">
                  Are you sure you want to reset the password for this user? 
                  A new temporary password will be generated and displayed.
                </p>
                <div className="flex justify-end mt-4 space-x-3">
                  <button
                    onClick={() => setShowResetConfirm(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleResetPassword(showResetConfirm, familyMembers.find(m => m.id === showResetConfirm)?.name)}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 disabled:opacity-50"
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

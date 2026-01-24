export default function EnhancedExpenseTable({ expenses, categories, onEdit, onDelete, selectedMonth, currentUser, isAdmin }) {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <p className="text-center text-red-900 dark:text-red-300">
          No expenses found for {selectedMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
        </p>
      </div>
    );
  }

  const categoryMap = new Map(categories.map(cat => [cat.id, cat]));

  const categoryGroups = [
    { name: 'Housing', color: '#3B82F6', ids: [] },
    { name: 'Bills', color: '#F59E0B', ids: [] },
    { name: 'Shopping', color: '#8B5CF6', ids: [] },
    { name: 'Transport', color: '#10B981', ids: [] },
    { name: 'Ration', color: '#EF4444', ids: [] },
    { name: 'Credit Card', color: '#EC4899', ids: [] },
    { name: 'Medical', color: '#6366F1', ids: [] },
    { name: 'Dining', color: '#14B8A6', ids: [] },
    { name: 'Travel', color: '#F97316', ids: [] },
    { name: 'Other', color: '#6B7280', ids: [] }
  ];

  expenses.forEach(expense => {
    const category = categoryMap.get(expense.category_id);
    if (category) {
      const group = categoryGroups.find(g => g.name === category.name);
      if (group) {
        group.ids.push(expense.id);
      }
    }
  });

  const totalAmount = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  return (
    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-red-800 dark:text-red-300">
          💸 Money Out - Expenses
        </h2>
        <p className="text-sm text-red-600 dark:text-red-400">
          Total: ₹{totalAmount.toFixed(2)}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-red-100 dark:bg-red-900/40">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-red-800 dark:text-red-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-red-800 dark:text-red-300 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-red-800 dark:text-red-300 uppercase tracking-wider">
                Note
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-red-800 dark:text-red-300 uppercase tracking-wider">
                User
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-red-800 dark:text-red-300 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-red-800 dark:text-red-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-red-200 dark:divide-red-800">
            {expenses.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No expenses found
                </td>
              </tr>
            ) : (
              expenses.map((expense) => {
                const category = categoryMap.get(expense.category_id);
                const bgColor = category?.color || '#6B7280';
                
                return (
                  <tr key={expense.id} className="hover:bg-red-100 dark:hover:bg-red-900/30">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {new Date(expense.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${bgColor}20`,
                          color: bgColor
                        }}
                      >
                        {category?.name || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                      {expense.note || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {expense.user_name || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white text-right">
                      ₹{expense.amount?.toFixed(2) || '0.00'}
                    </td>
                     <td className="px-4 py-3 text-sm text-right">
                       {onEdit && (isAdmin || expense.user_id === currentUser?.id) && (
                         <button
                           onClick={() => onEdit(expense)}
                           className="text-blue-600 hover:text-blue-900 dark:text-blue-400 mr-2"
                         >
                           Edit
                         </button>
                       )}
                       {onDelete && (isAdmin || expense.user_id === currentUser?.id) && (
                         <button
                           onClick={() => onDelete(expense.id, expense.user_id)}
                           className="text-red-600 hover:text-red-900 dark:text-red-400"
                         >
                           Delete
                         </button>
                       )}
                       {!isAdmin && expense.user_id !== currentUser?.id && (
                         <span className="text-gray-400 text-xs">Read-only</span>
                       )}
                     </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
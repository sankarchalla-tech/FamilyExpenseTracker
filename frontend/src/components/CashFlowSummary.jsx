export default function CashFlowSummary({ analytics }) {
  if (!analytics) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          </div>
        ))}
      </div>
    );
  }

  const { totalIncome, total, netBalance, expensePercentage } = analytics;
  const netBalanceColor = netBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  const expensePercentageColor = expensePercentage > 80 ? 'text-red-600 dark:text-red-400' : expensePercentage > 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Cash Flow Summary
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">Total Income</p>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            ₹{totalIncome?.toFixed(2) || '0.00'}
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">Total Expense</p>
          <p className="text-xl font-bold text-red-600 dark:text-red-400">
            ₹{total?.toFixed(2) || '0.00'}
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">Net Balance</p>
          <p className={`text-xl font-bold ${netBalanceColor}`}>
            ₹{netBalance?.toFixed(2) || '0.00'}
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <p className="text-xs font-medium text-purple-700 dark:text-purple-400 mb-1">Expense %</p>
          <p className={`text-xl font-bold ${expensePercentageColor}`}>
            {expensePercentage?.toFixed(1) || '0.0'}%
          </p>
        </div>
      </div>
    </div>
  );
}
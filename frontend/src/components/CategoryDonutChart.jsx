import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12" fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function CategoryDonutChart({ analytics }) {
  if (!analytics || !analytics.byCategory || analytics.byCategory.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Expense by Category
        </h3>
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No expense data available
        </div>
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#F59E0B', '#8B5CF6', '#10B981', '#EF4444', '#EC4899', '#6366F1', '#14B8A6', '#6B7280'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Expense by Category
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {analytics.byCategory.reduce((sum, cat) => sum + (cat.total || 0), 0).toFixed(2)} total
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-80 min-h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={analytics.byCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="total"
              >
                {analytics.byCategory.map((entry, index) => (
                  <Cell
                    key={`cell-${index}-${entry.id}`}
                    fill={COLORS[index % COLORS.length]}
                    strokeWidth={0}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#fff'
                }}
                formatter={(value, name) => {
                  const entry = analytics.byCategory.find(cat => cat.name === name);
                  return `${name}: ₹${entry?.total?.toFixed(2) || '0.00'}`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Category Breakdown
          </h4>
          {analytics.byCategory.map((category, index) => {
            const percentage = analytics.total > 0 
              ? (category.total / analytics.total * 100).toFixed(1)
              : 0;
            
            return (
              <div key={category.id} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      ₹{category.total?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {percentage}% of total expenses
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
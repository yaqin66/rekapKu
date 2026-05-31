import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTheme } from '../context/ThemeContext';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-600 rounded-xl p-3 shadow-lg text-sm">
        <p className="font-medium" style={{ color: payload[0].payload.color }}>
          {payload[0].name}
        </p>
        <p className="text-xs text-dark-500 mt-0.5">
          Rp {payload[0].value.toLocaleString('id-ID')} ({payload[0].payload.percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
  if (percentage < 5) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {percentage}%
    </text>
  );
};

export default function ChartCategory({ data }) {
  const { isDark } = useTheme();

  if (!data || data.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-3 sm:p-5 overflow-hidden">
        <h3 className="font-display font-semibold text-base mb-4">Pengeluaran per Kategori</h3>
        <div className="flex items-center justify-center h-48 sm:h-52 text-dark-400 dark:text-dark-500 text-sm">
          Belum ada data pengeluaran
        </div>
      </div>
    );
  }

  const total = data.reduce((s, d) => s + d.value, 0);
  const chartData = data.map(d => ({
    ...d,
    percentage: total > 0 ? ((d.value / total) * 100).toFixed(1) : 0,
  }));

  return (
    <div className="glass-card rounded-2xl p-3 sm:p-5 overflow-hidden">
      <h3 className="font-display font-semibold text-base mb-4">Pengeluaran per Kategori</h3>
      <div className="h-48 sm:h-64" style={{ minWidth: 0 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
              label={renderCustomLabel}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        {chartData.slice(0, 6).map((entry, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="truncate text-dark-500 dark:text-dark-400">{entry.name}</span>
            <span className="ml-auto font-medium">{entry.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#3B82F6', '#F59E0B', '#06B6D4', '#EF4444', '#84CC16'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900/90 backdrop-blur-lg border border-white/20 rounded-xl p-3 shadow-lg">
        <p className="text-white font-semibold text-sm">{data.name}</p>
        <p className="text-white/70 text-sm">
          Value: <span style={{ color: data.payload.fill }}>{data.value.toLocaleString()}</span>
        </p>
        {data.payload.percentage && (
          <p className="text-white/50 text-xs">{data.payload.percentage}%</p>
        )}
      </div>
    );
  }
  return null;
};

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function GlassPieChart({
  data = [],
  dataKey = 'value',
  nameKey = 'name',
  height = 300,
  showLegend = true,
  showLabels = true,
  animate = true,
  innerRadius = 0,
  colors = COLORS,
}) {
  const processedData = data.map((item, index) => ({
    ...item,
    fill: colors[index % colors.length],
    percentage: ((item[dataKey] / data.reduce((sum, d) => sum + d[dataKey], 0)) * 100).toFixed(1),
  }));

  return (
    <motion.div
      initial={animate ? { opacity: 0, scale: 0.9 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={processedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={showLabels ? renderCustomizedLabel : false}
            innerRadius={innerRadius}
            outerRadius="80%"
            paddingAngle={2}
            dataKey={dataKey}
            nameKey={nameKey}
            animationDuration={1500}
            animationEasing="ease-out"
          >
            {processedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.fill}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={2}
                style={{
                  filter: `drop-shadow(0 0 8px ${entry.fill}40)`,
                }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              formatter={(value) => <span className="text-white/70 text-sm">{value}</span>}
              wrapperStyle={{ paddingLeft: '20px' }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

import React from 'react';
import { PieChart, Pie, Sector } from 'recharts';

const data = [
  { name: 'Speed', value: 60 }, // Example speed value
  { name: 'Remaining', value: 40 }, // Remaining portion of the gauge
];

const GaugeChart = () => {
  const width = 300;
  const height = 300;

  return (
    <PieChart width={width} height={height}>
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        cx={width / 2}
        cy={height / 2}
        innerRadius={100}
        outerRadius={140}
        fill="#8884d8"
        label={(entry) => entry.name === 'Speed' ? ${entry.value}% : ''}
      />
      <Sector
        cx={width / 2}
        cy={height / 2}
        innerRadius={100}
        outerRadius={140}
        startAngle={0}
        endAngle={(60 / 100) * 360} // Adjust based on speed value
        fill="#82ca9d"
      />
    </PieChart>
  );
};

export default GaugeChart;
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';

const depthData = [
  { name: 'Mon', depth: 4 },
  { name: 'Tue', depth: 3 },
  { name: 'Wed', depth: 7 },
  { name: 'Thu', depth: 5 },
  { name: 'Fri', depth: 8 },
  { name: 'Sat', depth: 6 },
  { name: 'Sun', depth: 9 },
];

const skillData = [
  { subject: 'Instruction Clarity', A: 120, fullMark: 150 },
  { subject: 'Classroom Mgmt', A: 98, fullMark: 150 },
  { subject: 'Student Engagement', A: 86, fullMark: 150 },
  { subject: 'Task Design', A: 99, fullMark: 150 },
  { subject: 'Feedback Skills', A: 85, fullMark: 150 },
  { subject: 'Tech Integration', A: 65, fullMark: 150 },
];

export function ReflectionDepthChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={depthData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fill: '#94a3b8' }} 
        />
        <YAxis hide />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            borderRadius: '12px', 
            border: 'none', 
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
          }} 
        />
        <Line 
          type="monotone" 
          dataKey="depth" 
          stroke="#0ea5e9" 
          strokeWidth={3} 
          dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }} 
          activeDot={{ r: 6 }} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SkillGrowthChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
        <PolarGrid stroke="#f1f5f9" />
        <PolarAngleAxis 
          dataKey="subject" 
          tick={{ fontSize: 8, fill: '#64748b' }} 
        />
        <PolarRadiusAxis angle={30} domain={[0, 150]} hide />
        <Radar
          name="Skills"
          dataKey="A"
          stroke="#0ea5e9"
          fill="#0ea5e9"
          fillOpacity={0.6}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

"use client";

import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { TrendingUp, Phone, Calendar, Users } from "lucide-react";

const callVolumeData = [
  { month: "Oct", calls: 312, booked: 45 },
  { month: "Nov", calls: 428, booked: 67 },
  { month: "Dec", calls: 389, booked: 52 },
  { month: "Jan", calls: 521, booked: 89 },
  { month: "Feb", calls: 247, booked: 43 },
];

const agentPerformance = [
  { name: "RE Qualifier", calls: 128, booked: 24, success: 87 },
  { name: "Clinic Bot", calls: 96, booked: 18, success: 92 },
  { name: "Tour Booker", calls: 23, booked: 1, success: 65 },
];

const outcomeData = [
  { name: "Booked", value: 43, color: "#00F0FF" },
  { name: "Qualified", value: 67, color: "#0066FF" },
  { name: "No Answer", value: 89, color: "#71717A" },
  { name: "Voicemail", value: 31, color: "#F59E0B" },
  { name: "Failed", value: 17, color: "#EF4444" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1e] border border-white/10 rounded-lg px-3 py-2 text-sm">
        <p className="text-[#71717A] mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const kpis = [
  { label: "Total Calls (Feb)", value: "247", change: "+12%", icon: Phone, color: "#00F0FF" },
  { label: "Appointments Booked", value: "43", change: "+8%", icon: Calendar, color: "#0066FF" },
  { label: "Connection Rate", value: "68%", change: "+3%", icon: TrendingUp, color: "#10B981" },
  { label: "Conversion Rate", value: "17.4%", change: "+2.1%", icon: Users, color: "#F59E0B" },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6" data-testid="analytics-page">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass-card p-5"
            data-testid={`analytics-kpi-${i}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${kpi.color}15`, border: `1px solid ${kpi.color}30` }}
              >
                <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
              </div>
            </div>
            <div className="font-outfit text-2xl font-semibold text-white">{kpi.value}</div>
            <div className="text-xs text-[#71717A] mt-0.5">{kpi.label}</div>
            <div className="text-xs text-emerald-400 mt-1">{kpi.change} vs last month</div>
          </motion.div>
        ))}
      </div>

      {/* Call Volume + Outcome */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Call Volume */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass-card p-6"
          data-testid="call-volume-chart"
        >
          <h3 className="font-outfit font-semibold text-white mb-1">Call Volume vs Appointments</h3>
          <p className="text-xs text-[#71717A] mb-5">Monthly comparison</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={callVolumeData} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
              <defs>
                <linearGradient id="callsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#00F0FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="bookedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0066FF" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0066FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: "#71717A", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#71717A", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="calls" stroke="#00F0FF" strokeWidth={2} fill="url(#callsGrad)" name="Calls" dot={false} />
              <Area type="monotone" dataKey="booked" stroke="#0066FF" strokeWidth={2} fill="url(#bookedGrad)" name="Booked" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Outcome Pie */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
          data-testid="outcome-chart"
        >
          <h3 className="font-outfit font-semibold text-white mb-1">Call Outcomes</h3>
          <p className="text-xs text-[#71717A] mb-4">This month</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={outcomeData}
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {outcomeData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [value, name]}
                contentStyle={{ background: "#1a1a1e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                itemStyle={{ color: "#fff" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {outcomeData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-[#A1A1AA]">{d.name}</span>
                </div>
                <span className="text-white font-medium">{d.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Agent Performance */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-6"
        data-testid="agent-performance-chart"
      >
        <h3 className="font-outfit font-semibold text-white mb-1">Agent Performance</h3>
        <p className="text-xs text-[#71717A] mb-5">Calls, bookings, and success rate</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={agentPerformance} margin={{ top: 5, right: 20, bottom: 5, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="name" tick={{ fill: "#71717A", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#71717A", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="calls" fill="#00F0FF" name="Calls" radius={[4, 4, 0, 0]} opacity={0.8} />
            <Bar dataKey="booked" fill="#0066FF" name="Booked" radius={[4, 4, 0, 0]} opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}

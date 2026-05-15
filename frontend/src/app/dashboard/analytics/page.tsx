"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { TrendingUp, Phone, Calendar, Users } from "lucide-react";
import { useAgents, useLeads, useCallLogs, useAppointments } from "@/hooks/useSupabaseData";

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const CustomTooltip = ({
  active, payload, label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; color: string; name: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1e] border border-white/10 rounded-lg px-3 py-2 text-sm">
        <p className="text-[#71717A] mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const { data: agents } = useAgents();
  const { data: leads } = useLeads();
  const { data: callLogs } = useCallLogs();
  const { data: appointments } = useAppointments();

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // ── Per-month call volume (last 6 months including current) ────────
  const callVolumeData = useMemo(() => {
    const buckets: { month: string; calls: number; booked: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      buckets.push({
        month: MONTHS_SHORT[d.getMonth()],
        calls: 0,
        booked: 0,
      });
    }
    const startMonth = new Date(currentYear, currentMonth - 5, 1);
    for (const c of callLogs) {
      const d = new Date(c.created_at);
      if (d < startMonth) continue;
      const idx =
        (d.getFullYear() - startMonth.getFullYear()) * 12 +
        (d.getMonth() - startMonth.getMonth());
      if (idx >= 0 && idx < buckets.length) {
        buckets[idx].calls += 1;
        if (c.status === "completed") buckets[idx].booked += 1;
      }
    }
    return buckets;
  }, [callLogs, currentMonth, currentYear]);

  // ── KPIs ───────────────────────────────────────────────────────────
  const thisMonthCalls = callLogs.filter((c) => {
    const d = new Date(c.created_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const lastMonthCalls = callLogs.filter((c) => {
    const d = new Date(c.created_at);
    const lm = new Date(currentYear, currentMonth - 1, 1);
    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
  });

  const thisMonthBooked = appointments.filter((a) => {
    const [y, m] = (a.appointment_date || "").split("-").map(Number);
    return m - 1 === currentMonth && y === currentYear;
  }).length;

  const connectionRate =
    thisMonthCalls.length > 0
      ? Math.round(
          (thisMonthCalls.filter((c) => c.status === "completed").length /
            thisMonthCalls.length) *
            100
        )
      : 0;

  const conversionRate =
    leads.length > 0
      ? Math.round(
          (leads.filter((l) => l.status === "booked").length / leads.length) * 1000
        ) / 10
      : 0;

  const pctChange = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? "+100%" : "0%";
    const diff = Math.round(((curr - prev) / prev) * 100);
    return `${diff >= 0 ? "+" : ""}${diff}%`;
  };

  const kpis = [
    {
      label: `Total Calls (${MONTHS_SHORT[currentMonth]})`,
      value: thisMonthCalls.length.toLocaleString(),
      change: pctChange(thisMonthCalls.length, lastMonthCalls.length),
      icon: Phone,
      color: "#00F0FF",
    },
    {
      label: "Appointments Booked",
      value: thisMonthBooked.toLocaleString(),
      change: "",
      icon: Calendar,
      color: "#0066FF",
    },
    {
      label: "Connection Rate",
      value: `${connectionRate}%`,
      change: "",
      icon: TrendingUp,
      color: "#10B981",
    },
    {
      label: "Conversion Rate",
      value: `${conversionRate}%`,
      change: "",
      icon: Users,
      color: "#F59E0B",
    },
  ];

  // ── Outcome pie (this month) ───────────────────────────────────────
  const outcomeData = useMemo(() => {
    const map = {
      completed: { name: "Completed", value: 0, color: "#00F0FF" },
      qualified: { name: "Qualified", value: 0, color: "#0066FF" },
      no_answer: { name: "No Answer", value: 0, color: "#71717A" },
      voicemail: { name: "Voicemail", value: 0, color: "#F59E0B" },
      failed: { name: "Failed", value: 0, color: "#EF4444" },
      busy: { name: "Busy", value: 0, color: "#A1A1AA" },
    } as Record<string, { name: string; value: number; color: string }>;
    for (const c of thisMonthCalls) {
      if (map[c.status]) map[c.status].value += 1;
    }
    return Object.values(map);
  }, [thisMonthCalls]);

  const hasOutcomes = outcomeData.some((d) => d.value > 0);

  // ── Agent performance ──────────────────────────────────────────────
  const agentPerformance = agents.slice(0, 6).map((a) => {
    const aCalls = callLogs.filter((c) => c.agent_id === a.id);
    const aCompleted = aCalls.filter((c) => c.status === "completed").length;
    return {
      name: a.name.length > 14 ? a.name.slice(0, 14) + "…" : a.name,
      calls: aCalls.length,
      booked: aCompleted,
    };
  });

  const hasAnyData =
    callLogs.length > 0 || appointments.length > 0 || leads.length > 0 || agents.length > 0;

  return (
    <div className="space-y-6" data-testid="analytics-page">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass-card p-5"
            data-testid={`analytics-kpi-${i}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: `${kpi.color}15`,
                  border: `1px solid ${kpi.color}30`,
                }}
              >
                <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
              </div>
            </div>
            <div className="font-outfit text-2xl font-semibold text-white">
              {kpi.value}
            </div>
            <div className="text-xs text-[#71717A] mt-0.5">{kpi.label}</div>
            {kpi.change && (
              <div className="text-xs text-emerald-400 mt-1">
                {kpi.change} vs last month
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {!hasAnyData && (
        <div className="glass-card p-12 text-center">
          <p className="text-sm text-white">No analytics data yet.</p>
          <p className="text-xs text-[#71717A] mt-1">
            Create agents, add leads, and start running campaigns — your charts will fill up here.
          </p>
        </div>
      )}

      {/* Call Volume + Outcome */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass-card p-6"
          data-testid="call-volume-chart"
        >
          <h3 className="font-outfit font-semibold text-white mb-1">
            Call Volume vs Completed
          </h3>
          <p className="text-xs text-[#71717A] mb-5">Last 6 months</p>
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
              <YAxis tick={{ fill: "#71717A", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="calls" stroke="#00F0FF" strokeWidth={2} fill="url(#callsGrad)" name="Calls" dot={false} />
              <Area type="monotone" dataKey="booked" stroke="#0066FF" strokeWidth={2} fill="url(#bookedGrad)" name="Completed" dot={false} />
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
          {hasOutcomes ? (
            <>
              <div style={{ width: "100%", height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={outcomeData.filter((d) => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {outcomeData
                        .filter((d) => d.value > 0)
                        .map((entry) => (
                          <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                        ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#1a1a1e",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 8,
                      }}
                      itemStyle={{ color: "#fff" }}
                      labelStyle={{ color: "#71717A" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {outcomeData
                  .filter((d) => d.value > 0)
                  .map((d) => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                        <span className="text-[#A1A1AA]">{d.name}</span>
                      </div>
                      <span className="text-white font-medium">{d.value}</span>
                    </div>
                  ))}
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-xs text-[#71717A]">
              No call outcomes this month yet.
            </div>
          )}
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
        <p className="text-xs text-[#71717A] mb-5">Calls and completions per agent</p>
        {agentPerformance.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#71717A]">
            Create an agent to start tracking performance.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={agentPerformance} margin={{ top: 5, right: 20, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: "#71717A", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#71717A", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="calls" fill="#00F0FF" name="Calls" radius={[4, 4, 0, 0]} opacity={0.8} />
              <Bar dataKey="booked" fill="#0066FF" name="Completed" radius={[4, 4, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Phone, Clock, Users, Calendar, Bot, ArrowRight,
  CheckCircle2, XCircle, PhoneMissed,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  useAgents,
  useLeads,
  useCallLogs,
  useAppointments,
} from "@/hooks/useSupabaseData";
import { formatDuration } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.06, ease: "easeOut" },
  }),
};

const BUSINESS_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

type CallBucket = {
  day: string;
  date: string;
  calls: number;
  completed: number;
  missed: number;
};

const CustomTooltip = ({
  active, payload, label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: CallBucket }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    const day = payload[0].payload;
    return (
      <div className="bg-[#1a1a1e] border border-white/10 rounded-lg px-3 py-2 text-sm">
        <p className="text-[#71717A]">{label} · {day.date}</p>
        <p className="text-[#00F0FF] font-semibold">{day.calls} calls</p>
        <p className="text-xs text-[#A1A1AA]">
          {day.completed} completed · {day.missed} other
        </p>
      </div>
    );
  }
  return null;
};

function startOfBusinessWeek(date: Date) {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function DashboardPage() {
  const { data: agents } = useAgents();
  const { data: leads } = useLeads();
  const { data: callLogs } = useCallLogs();
  const { data: appointments } = useAppointments();

  // ── KPIs ────────────────────────────────────────────────────────────
  const completedCalls = callLogs.filter((c) => c.status === "completed");
  const totalMinutes = Math.round(
    callLogs.reduce((acc, c) => acc + (c.duration || 0), 0) / 60
  );
  const contactedLeads = leads.filter((l) => l.status !== "new").length;
  const bookedAppointments = appointments.filter(
    (a) => a.status === "scheduled" || a.status === "confirmed"
  ).length;

  const stats = [
    {
      label: "Calls Completed",
      value: completedCalls.length.toLocaleString(),
      icon: Phone,
      color: "#00F0FF",
    },
    {
      label: "Minutes Used",
      value: totalMinutes.toLocaleString(),
      icon: Clock,
      color: "#0066FF",
    },
    {
      label: "Leads Contacted",
      value: contactedLeads.toLocaleString(),
      icon: Users,
      color: "#10B981",
    },
    {
      label: "Appointments Booked",
      value: bookedAppointments.toLocaleString(),
      icon: Calendar,
      color: "#F59E0B",
    },
  ];

  // ── Business week call volume ───────────────────────────────────────
  const callData = useMemo(() => {
    const weekStart = startOfBusinessWeek(new Date());
    const buckets: CallBucket[] = BUSINESS_DAYS.map((day, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      return {
        day,
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        calls: 0,
        completed: 0,
        missed: 0,
      };
    });

    for (const c of callLogs) {
      const d = new Date(c.created_at);
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const diff = Math.floor((dayStart.getTime() - weekStart.getTime()) / 86400000);
      if (diff >= 0 && diff < buckets.length) {
        buckets[diff].calls += 1;
        if (c.status === "completed") {
          buckets[diff].completed += 1;
        } else {
          buckets[diff].missed += 1;
        }
      }
    }
    return buckets;
  }, [callLogs]);

  // ── Recent activity ─────────────────────────────────────────────────
  const recentActivity = callLogs.slice(0, 5).map((c) => {
    const lead = leads.find((l) => l.id === c.lead_id);
    return {
      id: c.id,
      type: c.status,
      lead: lead?.name || "Unknown lead",
      time: timeAgo(c.created_at),
      duration: c.duration ? formatDuration(c.duration) : "—",
      result:
        c.status === "completed"
          ? c.summary || "Call completed"
          : c.status === "no_answer"
          ? "No answer"
          : c.status === "voicemail"
          ? "Voicemail left"
          : c.status === "failed"
          ? "Call failed"
          : "Line busy",
    };
  });

  // ── Agent quick list ────────────────────────────────────────────────
  const agentsList = agents.slice(0, 5).map((a) => {
    const calls = callLogs.filter((c) => c.agent_id === a.id).length;
    const booked = callLogs.filter(
      (c) => c.agent_id === a.id && c.status === "completed"
    ).length;
    return {
      id: a.id,
      name: a.name,
      status: a.is_active,
      calls,
      booked,
    };
  });

  // ── Upcoming appointments ───────────────────────────────────────────
  const upcoming = useMemo(() => {
    const now = new Date();
    return appointments
      .map((a) => {
        const [y, m, d] = (a.appointment_date || "").split("-").map(Number);
        const dt = new Date(y || 1970, (m || 1) - 1, d || 1);
        const lead = leads.find((l) => l.id === a.lead_id);
        return { ...a, dt, leadName: lead?.name || a.title };
      })
      .filter((a) => a.dt >= new Date(now.getFullYear(), now.getMonth(), now.getDate()))
      .sort((a, b) => a.dt.getTime() - b.dt.getTime())
      .slice(0, 4);
  }, [appointments, leads]);

  return (
    <div className="space-y-6" data-testid="dashboard-overview">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={i}
            className="glass-card p-6 hover:-translate-y-0.5 transition-transform duration-200"
            data-testid={`stat-card-${stat.label.toLowerCase().replace(/ /g, "-")}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{
                  background: `${stat.color}15`,
                  border: `1px solid ${stat.color}30`,
                }}
              >
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
            </div>
            <div className="font-outfit text-3xl font-semibold text-white">
              {stat.value}
            </div>
            <div className="text-xs text-[#71717A] mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={4}
          className="lg:col-span-2 glass-card p-6"
          data-testid="call-volume-chart"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-outfit font-semibold text-white">Call Volume</h3>
              <p className="text-xs text-[#71717A]">Monday to Friday</p>
            </div>
            <Badge variant="default">This Week</Badge>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={callData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="callGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#00F0FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: "#71717A", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#71717A", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="calls" stroke="#00F0FF" strokeWidth={2} fill="url(#callGradient)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={5}
          className="glass-card p-6"
          data-testid="recent-activity"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-outfit font-semibold text-white">Recent Activity</h3>
            <Link href="/dashboard/call-history">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentActivity.length === 0 && (
              <p className="text-xs text-[#71717A]">
                No call activity yet. Once your agents start making calls, the latest results will appear here.
              </p>
            )}
            {recentActivity.map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0"
              >
                <div className="mt-0.5 shrink-0">
                  {a.type === "completed" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : a.type === "no_answer" ? (
                    <PhoneMissed className="w-4 h-4 text-red-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{a.lead}</div>
                  <div className="text-xs text-[#71717A] truncate">{a.result}</div>
                </div>
                <div className="text-xs text-[#71717A] shrink-0">{a.time}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Agents + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={6}
          className="glass-card p-6"
          data-testid="agent-status-cards"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-outfit font-semibold text-white">AI Agents</h3>
            <Link href="/dashboard/agents">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                Manage <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {agentsList.length === 0 && (
              <p className="text-xs text-[#71717A]">
                No agents yet. Create your first AI voice agent in the AI Agents tab.
              </p>
            )}
            {agentsList.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-[#A1A1AA]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {agent.name}
                  </div>
                  <div className="text-xs text-[#71717A]">
                    {agent.calls} calls · {agent.booked} completed
                  </div>
                </div>
                <div
                  className={`w-2 h-2 rounded-full ${
                    agent.status ? "bg-emerald-400" : "bg-[#71717A]"
                  }`}
                />
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={7}
          className="glass-card p-6"
          data-testid="upcoming-appointments"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-outfit font-semibold text-white">Upcoming</h3>
            <Link href="/dashboard/calendar">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                Calendar <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {upcoming.length === 0 && (
              <p className="text-xs text-[#71717A]">
                No upcoming appointments. They&apos;ll appear here once leads are booked.
              </p>
            )}
            {upcoming.map((appt) => {
              const dateLabel = appt.dt.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
              return (
                <div
                  key={appt.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5"
                >
                  <div className="w-2 shrink-0 self-stretch rounded-full bg-[#00F0FF]/40" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {appt.leadName}
                    </div>
                    <div className="text-xs text-[#71717A]">
                      {dateLabel}
                      {appt.appointment_time
                        ? `, ${appt.appointment_time.slice(0, 5)}`
                        : ""}
                    </div>
                  </div>
                  <Badge variant="default" className="text-xs shrink-0 capitalize">
                    {appt.type?.replace("_", " ") || "appt"}
                  </Badge>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

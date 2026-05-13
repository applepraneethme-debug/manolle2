"use client";

import { motion } from "framer-motion";
import {
  Phone, Clock, Users, Calendar, TrendingUp, TrendingDown,
  Bot, ArrowRight, CheckCircle2, XCircle, PhoneMissed
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const callData = [
  { day: "Mon", calls: 42 },
  { day: "Tue", calls: 58 },
  { day: "Wed", calls: 35 },
  { day: "Thu", calls: 71 },
  { day: "Fri", calls: 89 },
  { day: "Sat", calls: 63 },
  { day: "Sun", calls: 47 },
];

const stats = [
  {
    label: "Calls Completed",
    value: "247",
    change: "+12%",
    up: true,
    icon: Phone,
    color: "#00F0FF",
  },
  {
    label: "Minutes Used",
    value: "1,847",
    change: "+8%",
    up: true,
    icon: Clock,
    color: "#0066FF",
  },
  {
    label: "Leads Contacted",
    value: "189",
    change: "+23%",
    up: true,
    icon: Users,
    color: "#10B981",
  },
  {
    label: "Appointments Booked",
    value: "43",
    change: "+5%",
    up: true,
    icon: Calendar,
    color: "#F59E0B",
  },
];

const recentActivity = [
  { id: 1, type: "completed", lead: "Rahul Sharma", time: "2m ago", duration: "4:32", result: "Appointment booked" },
  { id: 2, type: "no_answer", lead: "Priya Patel", time: "15m ago", duration: "0:12", result: "No answer" },
  { id: 3, type: "completed", lead: "Amit Kumar", time: "32m ago", duration: "6:10", result: "Qualified — follow up" },
  { id: 4, type: "voicemail", lead: "Sunita Gupta", time: "1h ago", duration: "0:45", result: "Voicemail left" },
  { id: 5, type: "completed", lead: "Vikram Singh", time: "1h ago", duration: "3:22", result: "Appointment booked" },
];

const agents = [
  { id: 1, name: "Real Estate Qualifier", calls: 128, status: true, appointments: 24 },
  { id: 2, name: "Clinic Reminder Bot", calls: 96, status: true, appointments: 18 },
  { id: 3, name: "Property Tour Booker", calls: 23, status: false, appointments: 1 },
];

const upcoming = [
  { name: "Mr. Arun Mehta", time: "Today, 3:00 PM", type: "Site Visit", phone: "+91 98765 43210" },
  { name: "Dr. Sneha Reddy", time: "Today, 4:30 PM", type: "Clinic Consult", phone: "+91 87654 32109" },
  { name: "Raj Properties", time: "Tomorrow, 10:00 AM", type: "Site Visit", phone: "+91 76543 21098" },
  { name: "Beauty Salon — Priya", time: "Tomorrow, 2:00 PM", type: "Appointment", phone: "+91 65432 10987" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, delay: i * 0.08, ease: "easeOut" },
  }),
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1e] border border-white/10 rounded-lg px-3 py-2 text-sm">
        <p className="text-[#71717A]">{label}</p>
        <p className="text-[#00F0FF] font-semibold">{payload[0].value} calls</p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
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
                style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}30` }}
              >
                <stat.icon className="w-4.5 h-4.5" style={{ color: stat.color, width: 18, height: 18 }} />
              </div>
              <span className={`text-xs font-medium flex items-center gap-1 ${stat.up ? "text-emerald-400" : "text-red-400"}`}>
                {stat.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>
            <div className="font-outfit text-3xl font-semibold text-white">{stat.value}</div>
            <div className="text-xs text-[#71717A] mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Call Volume Chart */}
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
              <p className="text-xs text-[#71717A]">Last 7 days</p>
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
              <YAxis tick={{ fill: "#71717A", fontSize: 11 }} axisLine={false} tickLine={false} />
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
            {recentActivity.map((a) => (
              <div key={a.id} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
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
                  <div className="text-xs text-[#71717A]">{a.result}</div>
                </div>
                <div className="text-xs text-[#71717A] shrink-0">{a.time}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Agents + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI Agents Status */}
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
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-[#A1A1AA]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{agent.name}</div>
                  <div className="text-xs text-[#71717A]">
                    {agent.calls} calls · {agent.appointments} booked
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${agent.status ? "bg-emerald-400" : "bg-[#71717A]"}`} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Appointments */}
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
            {upcoming.map((appt, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5"
              >
                <div className="w-2 shrink-0 self-stretch rounded-full bg-[#00F0FF]/40" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{appt.name}</div>
                  <div className="text-xs text-[#71717A]">{appt.time}</div>
                </div>
                <Badge variant="default" className="text-xs shrink-0">{appt.type}</Badge>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

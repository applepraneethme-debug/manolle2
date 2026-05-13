"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Phone, Clock, FileText, Play, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { formatDuration } from "@/lib/utils";

const callLogs = [
  { id: "1", lead: "Rahul Sharma", phone: "+91 98765 43210", agent: "Real Estate Qualifier", duration: 272, status: "completed", date: "Today, 3:45 PM", summary: "Lead interested in 3BHK. Site visit booked for Saturday.", recording: true },
  { id: "2", lead: "Priya Patel", phone: "+91 87654 32109", agent: "Real Estate Qualifier", duration: 12, status: "no_answer", date: "Today, 2:30 PM", summary: null, recording: false },
  { id: "3", lead: "Dr. Amit Kumar", phone: "+91 76543 21098", agent: "Clinic Reminder Bot", duration: 370, status: "completed", date: "Today, 1:15 PM", summary: "Appointment confirmed for Thursday 10 AM.", recording: true },
  { id: "4", lead: "Sunita Gupta", phone: "+91 65432 10987", agent: "Clinic Reminder Bot", duration: 45, status: "voicemail", date: "Today, 12:00 PM", summary: "Left voicemail about appointment reminder.", recording: false },
  { id: "5", lead: "Vikram Singh", phone: "+91 54321 09876", agent: "Real Estate Qualifier", duration: 202, status: "completed", date: "Yesterday, 4:00 PM", summary: "Qualified buyer. Budget 1.2Cr. Tour booked.", recording: true },
  { id: "6", lead: "Anjali Nair", phone: "+91 43210 98765", agent: "Real Estate Qualifier", duration: 0, status: "failed", date: "Yesterday, 2:15 PM", summary: null, recording: false },
  { id: "7", lead: "Rajesh Verma", phone: "+91 32109 87654", agent: "Clinic Reminder Bot", duration: 158, status: "completed", date: "Yesterday, 11:00 AM", summary: "Rescheduled to Friday. Patient confirmed.", recording: true },
  { id: "8", lead: "Deepa Reddy", phone: "+91 21098 76543", agent: "Property Tour Booker", duration: 0, status: "busy", date: "2 days ago, 3:00 PM", summary: null, recording: false },
];

const statusConfig: Record<string, { label: string; variant: any }> = {
  completed: { label: "Completed", variant: "success" },
  no_answer: { label: "No Answer", variant: "destructive" },
  voicemail: { label: "Voicemail", variant: "warning" },
  failed: { label: "Failed", variant: "destructive" },
  busy: { label: "Busy", variant: "secondary" },
};

export default function CallHistoryPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = callLogs.filter((c) => {
    const matchSearch = c.lead.toLowerCase().includes(search.toLowerCase()) ||
      c.agent.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6" data-testid="call-history-page">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
          <Input
            placeholder="Search calls..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="call-search-input"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {["all", "completed", "no_answer", "voicemail", "failed"].map((s) => (
            <Button
              key={s}
              variant={filterStatus === s ? "default" : "secondary"}
              size="sm"
              onClick={() => setFilterStatus(s)}
              className="text-xs"
              data-testid={`call-filter-${s}`}
            >
              {s.replace("_", " ")}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-6 flex-wrap text-sm">
        <span><span className="text-[#71717A]">Total: </span><span className="text-white font-semibold">{callLogs.length}</span></span>
        <span><span className="text-[#71717A]">Completed: </span><span className="text-emerald-400 font-semibold">{callLogs.filter(c => c.status === "completed").length}</span></span>
        <span><span className="text-[#71717A]">Avg Duration: </span><span className="text-white font-semibold">{formatDuration(Math.round(callLogs.filter(c => c.duration > 0).reduce((a, c) => a + c.duration, 0) / callLogs.filter(c => c.duration > 0).length))}</span></span>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden" data-testid="call-history-table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lead</TableHead>
              <TableHead className="hidden sm:table-cell">Agent</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="hidden lg:table-cell">Summary</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((call, i) => (
              <motion.tr
                key={call.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                data-testid={`call-row-${call.id}`}
              >
                <TableCell>
                  <div>
                    <div className="text-sm font-medium text-white">{call.lead}</div>
                    <div className="text-xs text-[#71717A]">{call.phone}</div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-sm text-[#A1A1AA]">{call.agent}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Clock className="w-3.5 h-3.5 text-[#71717A]" />
                    {call.duration > 0 ? formatDuration(call.duration) : "—"}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={statusConfig[call.status]?.variant}>
                    {statusConfig[call.status]?.label}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-xs text-[#71717A]">{call.date}</TableCell>
                <TableCell className="hidden lg:table-cell max-w-xs">
                  {call.summary ? (
                    <p className="text-xs text-[#A1A1AA] truncate">{call.summary}</p>
                  ) : (
                    <span className="text-xs text-[#71717A]">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-7 h-7">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {call.recording && (
                        <DropdownMenuItem><Play className="w-4 h-4" /> Play Recording</DropdownMenuItem>
                      )}
                      <DropdownMenuItem><FileText className="w-4 h-4" /> View Transcript</DropdownMenuItem>
                      <DropdownMenuItem><Phone className="w-4 h-4" /> Call Again</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-[#71717A] text-sm">No calls match your filters.</div>
        )}
      </div>
    </div>
  );
}

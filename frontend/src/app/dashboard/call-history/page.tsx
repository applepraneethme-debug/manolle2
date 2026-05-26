"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Phone, Clock, FileText, Play, MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDuration } from "@/lib/utils";
import { toast } from "sonner";
import {
  useCallLogs,
  useAgents,
  useLeads,
} from "@/hooks/useSupabaseData";

const STATUSES = ["in_progress", "completed", "no_answer", "voicemail", "failed", "busy"];

const statusConfig = {
  in_progress: { label: "In Progress", variant: "secondary" },
  completed: { label: "Completed", variant: "success" },
  no_answer: { label: "No Answer", variant: "destructive" },
  voicemail: { label: "Voicemail", variant: "warning" },
  failed: { label: "Failed", variant: "destructive" },
  busy: { label: "Busy", variant: "secondary" },
} as const;

export default function CallHistoryPage() {
  const { data: callLogs, loading, remove } = useCallLogs();
  const { data: agents } = useAgents();
  const { data: leads } = useLeads();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const leadName = (id?: string) => leads.find((l) => l.id === id)?.name || "Unknown lead";
  const leadPhone = (id?: string) => leads.find((l) => l.id === id)?.phone || "—";
  const agentName = (id?: string) => agents.find((a) => a.id === id)?.name || "—";

  const filtered = callLogs.filter((c) => {
    const ln = leadName(c.lead_id).toLowerCase();
    const an = agentName(c.agent_id).toLowerCase();
    const phone = leadPhone(c.lead_id);
    const q = search.toLowerCase();
    const matchSearch =
      !q || ln.includes(q) || an.includes(q) || phone.includes(search);
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const completedDurations = callLogs.filter((c) => c.duration > 0);
  const avgDuration =
    completedDurations.length > 0
      ? Math.round(
          completedDurations.reduce((a, c) => a + c.duration, 0) /
            completedDurations.length
        )
      : 0;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const sameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      d.getFullYear() === yesterday.getFullYear() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getDate() === yesterday.getDate();
    const time = d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    if (sameDay) return `Today, ${time}`;
    if (isYesterday) return `Yesterday, ${time}`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + ", " + time;
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this call log?")) return;
    try {
      await remove(id);
      toast.success("Call log deleted");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  };

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
          {["all", ...STATUSES].map((s) => (
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
      <div className="flex gap-6 flex-wrap text-sm" data-testid="call-stats">
        <span>
          <span className="text-[#71717A]">Total: </span>
          <span className="text-white font-semibold">{callLogs.length}</span>
        </span>
        <span>
          <span className="text-[#71717A]">Completed: </span>
          <span className="text-emerald-400 font-semibold">
            {callLogs.filter((c) => c.status === "completed").length}
          </span>
        </span>
        <span>
          <span className="text-[#71717A]">Avg Duration: </span>
          <span className="text-white font-semibold">
            {avgDuration > 0 ? formatDuration(avgDuration) : "—"}
          </span>
        </span>
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
                transition={{ delay: i * 0.03 }}
                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                data-testid={`call-row-${call.id}`}
              >
                <TableCell>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {leadName(call.lead_id)}
                    </div>
                    <div className="text-xs text-[#71717A]">
                      {leadPhone(call.lead_id)}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-sm text-[#A1A1AA]">
                  {agentName(call.agent_id)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Clock className="w-3.5 h-3.5 text-[#71717A]" />
                    {call.duration > 0 ? formatDuration(call.duration) : "—"}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={statusConfig[call.status]?.variant}>
                    {statusConfig[call.status]?.label || call.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-xs text-[#71717A]">
                  {formatDate(call.created_at)}
                </TableCell>
                <TableCell className="hidden lg:table-cell max-w-xs">
                  {call.summary ? (
                    <p className="text-xs text-[#A1A1AA] whitespace-pre-line line-clamp-3">
                      {call.summary}
                    </p>
                  ) : (
                    <span className="text-xs text-[#71717A]">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-7 h-7" data-testid={`call-menu-${call.id}`}>
                        <MoreVertical className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {call.recording_url && (
                        <DropdownMenuItem onClick={() => window.open(call.recording_url, "_blank")}>
                          <Play className="w-4 h-4" /> Play Recording
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() =>
                          toast.info(call.transcript || "No transcript available")
                        }
                      >
                        <FileText className="w-4 h-4" /> View Transcript
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toast.info("Calling feature coming soon")}
                      >
                        <Phone className="w-4 h-4" /> Call Again
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-400 focus:text-red-400"
                        onClick={() => handleDelete(call.id)}
                        data-testid={`call-delete-${call.id}`}
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-[#71717A] text-sm">
            {loading
              ? "Loading call history…"
              : callLogs.length === 0
              ? "No calls logged yet."
              : "No calls match your filters."}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Play, Pause, MoreVertical, Users, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const initialCampaigns = [
  {
    id: "1",
    name: "Q1 Real Estate Leads — Mumbai",
    agent: "Real Estate Qualifier",
    status: "running",
    totalLeads: 250,
    leadsContacted: 168,
    appointmentsBooked: 24,
    startDate: "Jan 15, 2025",
    description: "Outreach to premium property inquiries from housing portals",
  },
  {
    id: "2",
    name: "Clinic Appointment Reminders — Jan",
    agent: "Clinic Reminder Bot",
    status: "running",
    totalLeads: 120,
    leadsContacted: 96,
    appointmentsBooked: 18,
    startDate: "Jan 20, 2025",
    description: "Automated reminders and rescheduling for CareFirst clinic patients",
  },
  {
    id: "3",
    name: "Summer Property Tour — Pune",
    agent: "Property Tour Booker",
    status: "paused",
    totalLeads: 80,
    leadsContacted: 23,
    appointmentsBooked: 1,
    startDate: "Feb 1, 2025",
    description: "Premium property tour bookings for upcoming Pune launch",
  },
  {
    id: "4",
    name: "Salon New Customer Outreach",
    agent: "Friendly Follow-up Bot",
    status: "completed",
    totalLeads: 150,
    leadsContacted: 150,
    appointmentsBooked: 42,
    startDate: "Dec 10, 2024",
    description: "New year promotion outreach for salon bookings",
  },
  {
    id: "5",
    name: "Medical Check-up Reminders",
    agent: "Clinic Reminder Bot",
    status: "draft",
    totalLeads: 200,
    leadsContacted: 0,
    appointmentsBooked: 0,
    startDate: "Feb 10, 2025",
    description: "Annual health check-up reminders for existing patients",
  },
];

const statusMap: Record<string, { label: string; variant: any }> = {
  running: { label: "Running", variant: "running" },
  paused: { label: "Paused", variant: "paused" },
  completed: { label: "Completed", variant: "completed" },
  draft: { label: "Draft", variant: "draft" },
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState(initialCampaigns);

  const toggleStatus = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const next = c.status === "running" ? "paused" : "running";
        toast.success(`Campaign ${next}`);
        return { ...c, status: next };
      })
    );
  };

  return (
    <div className="space-y-6" data-testid="campaigns-page">
      <div className="flex items-center justify-between">
        <p className="text-[#A1A1AA] text-sm">
          {campaigns.filter((c) => c.status === "running").length} active campaigns
        </p>
        <Button className="gap-2" onClick={() => toast.info("Campaign creation coming soon")} data-testid="create-campaign-btn">
          <Plus className="w-4 h-4" />
          New Campaign
        </Button>
      </div>

      <div className="space-y-3">
        {campaigns.map((c, i) => {
          const progress = c.totalLeads > 0
            ? Math.round((c.leadsContacted / c.totalLeads) * 100)
            : 0;
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass-card p-5"
              data-testid={`campaign-card-${c.id}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h3 className="font-outfit font-semibold text-white text-sm">{c.name}</h3>
                    <Badge variant={statusMap[c.status]?.variant}>{statusMap[c.status]?.label}</Badge>
                  </div>
                  <p className="text-xs text-[#71717A] mb-3">{c.description}</p>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-[#71717A] mb-1">
                      <span>Progress</span>
                      <span>{progress}% ({c.leadsContacted}/{c.totalLeads})</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>

                  <div className="flex items-center gap-5 text-xs text-[#71717A]">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> {c.totalLeads} leads
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> {c.leadsContacted} contacted
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#00F0FF]" />
                      <span className="text-[#00F0FF]">{c.appointmentsBooked} booked</span>
                    </span>
                    <span>Agent: {c.agent}</span>
                    <span>Started: {c.startDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {(c.status === "running" || c.status === "paused") && (
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => toggleStatus(c.id)}
                      data-testid={`campaign-toggle-${c.id}`}
                    >
                      {c.status === "running" ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Campaign</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-400">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Plus, Phone, Mail, MoreVertical, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const allLeads = [
  { id: "1", name: "Rahul Sharma", phone: "+91 98765 43210", email: "rahul@example.com", status: "booked", source: "Housing.com", campaign: "Q1 Real Estate" },
  { id: "2", name: "Priya Patel", phone: "+91 87654 32109", email: "priya@example.com", status: "contacted", source: "99acres", campaign: "Q1 Real Estate" },
  { id: "3", name: "Dr. Amit Kumar", phone: "+91 76543 21098", email: "amit@example.com", status: "qualified", source: "Referral", campaign: "Clinic Reminders" },
  { id: "4", name: "Sunita Gupta", phone: "+91 65432 10987", email: "sunita@example.com", status: "new", source: "Website", campaign: "Summer Property Tour" },
  { id: "5", name: "Vikram Singh", phone: "+91 54321 09876", email: "vikram@example.com", status: "booked", source: "Facebook Ad", campaign: "Q1 Real Estate" },
  { id: "6", name: "Anjali Nair", phone: "+91 43210 98765", email: "anjali@example.com", status: "unqualified", source: "Google Ad", campaign: "Q1 Real Estate" },
  { id: "7", name: "Rajesh Verma", phone: "+91 32109 87654", email: "rajesh@example.com", status: "contacted", source: "Housing.com", campaign: "Q1 Real Estate" },
  { id: "8", name: "Deepa Reddy", phone: "+91 21098 76543", email: "deepa@example.com", status: "qualified", source: "Website", campaign: "Clinic Reminders" },
];

const statusConfig: Record<string, any> = {
  new: "new",
  contacted: "contacted",
  qualified: "qualified",
  unqualified: "unqualified",
  booked: "booked",
};

export default function LeadsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = allLeads.filter((l) => {
    const matchSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search) ||
      l.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6" data-testid="leads-page">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
            <Input
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-testid="leads-search-input"
            />
          </div>
          <div className="flex gap-1">
            {["all", "new", "contacted", "qualified", "booked"].map((s) => (
              <Button
                key={s}
                variant={filterStatus === s ? "default" : "secondary"}
                size="sm"
                onClick={() => setFilterStatus(s)}
                className="text-xs capitalize"
                data-testid={`filter-${s}`}
              >
                {s}
              </Button>
            ))}
          </div>
        </div>
        <Button
          className="gap-2"
          onClick={() => toast.info("Manual lead creation coming soon")}
          data-testid="add-lead-btn"
        >
          <Plus className="w-4 h-4" />
          Add Lead
        </Button>
      </div>

      {/* Summary */}
      <div className="flex gap-4 flex-wrap">
        {Object.entries({ all: allLeads.length, booked: 2, qualified: 2, new: 1, contacted: 2 }).map(([k, v]) => (
          <div key={k} className="text-sm">
            <span className="text-[#71717A] capitalize">{k}: </span>
            <span className="text-white font-semibold">{v}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden" data-testid="leads-table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lead</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Source</TableHead>
              <TableHead className="hidden lg:table-cell">Campaign</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((lead, i) => (
              <motion.tr
                key={lead.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                data-testid={`lead-row-${lead.id}`}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium text-white shrink-0">
                      {lead.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <span className="font-medium text-white text-sm">{lead.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Phone className="w-3.5 h-3.5 text-[#71717A]" />
                    {lead.phone}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm">{lead.email}</TableCell>
                <TableCell>
                  <Badge variant={statusConfig[lead.status]} className="capitalize">
                    {lead.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm">{lead.source}</TableCell>
                <TableCell className="hidden lg:table-cell text-sm">{lead.campaign}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-7 h-7">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Phone className="w-4 h-4" /> Call Now</DropdownMenuItem>
                      <DropdownMenuItem><UserCheck className="w-4 h-4" /> Mark Qualified</DropdownMenuItem>
                      <DropdownMenuItem><Mail className="w-4 h-4" /> Send Email</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-400">Remove Lead</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-[#71717A] text-sm">
            No leads match your search.
          </div>
        )}
      </div>
    </div>
  );
}

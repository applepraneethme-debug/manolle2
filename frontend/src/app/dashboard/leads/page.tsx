"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Phone, Mail, MoreVertical, UserCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "sonner";
import {
  useLeads,
  useCampaigns,
  dbInsert,
  dbUpdate,
  dbDelete,
  type DbLead,
} from "@/hooks/useSupabaseData";

const STATUSES: DbLead["status"][] = ["new", "contacted", "qualified", "unqualified", "booked"];

const statusVariant: Record<string, string> = {
  new: "new",
  contacted: "contacted",
  qualified: "qualified",
  unqualified: "unqualified",
  booked: "booked",
};

export default function LeadsPage() {
  const { data: leads, loading } = useLeads();
  const { data: campaigns } = useCampaigns();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    source: "",
    campaign_id: "",
  });

  const filtered = leads.filter((l) => {
    const matchSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      (l.phone || "").includes(search) ||
      (l.email || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: leads.length };
    STATUSES.forEach((s) => {
      c[s] = leads.filter((l) => l.status === s).length;
    });
    return c;
  }, [leads]);

  const openCreate = () => {
    setForm({ name: "", phone: "", email: "", source: "", campaign_id: "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Name and phone are required");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        source: form.source.trim() || null,
        status: "new",
      };
      if (form.campaign_id) payload.campaign_id = form.campaign_id;
      await dbInsert("leads", payload);
      toast.success("Lead added");
      setDialogOpen(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to add lead");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (lead: DbLead, status: DbLead["status"]) => {
    try {
      await dbUpdate("leads", lead.id, { status });
      toast.success(`Marked as ${status}`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this lead?")) return;
    try {
      await dbDelete("leads", id);
      toast.success("Lead removed");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  const campaignName = (id?: string) =>
    campaigns.find((c) => c.id === id)?.name || "—";

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
          <div className="flex gap-1 flex-wrap">
            {["all", ...STATUSES].map((s) => (
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
        <Button className="gap-2" onClick={openCreate} data-testid="add-lead-btn">
          <Plus className="w-4 h-4" />
          Add Lead
        </Button>
      </div>

      {/* Summary */}
      <div className="flex gap-4 flex-wrap" data-testid="leads-summary">
        {Object.entries(counts).map(([k, v]) => (
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
                transition={{ delay: i * 0.03 }}
                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                data-testid={`lead-row-${lead.id}`}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium text-white shrink-0">
                      {lead.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
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
                <TableCell className="hidden md:table-cell text-sm">
                  {lead.email || "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[lead.status]} className="capitalize">
                    {lead.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm">
                  {lead.source || "—"}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm">
                  {campaignName(lead.campaign_id)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-7 h-7" data-testid={`lead-menu-${lead.id}`}>
                        <MoreVertical className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleStatusChange(lead, "qualified")}>
                        <UserCheck className="w-4 h-4" /> Mark Qualified
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(lead, "booked")}>
                        <UserCheck className="w-4 h-4" /> Mark Booked
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(lead, "unqualified")}>
                        <Mail className="w-4 h-4" /> Mark Unqualified
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-400 focus:text-red-400"
                        onClick={() => handleDelete(lead.id)}
                        data-testid={`lead-delete-${lead.id}`}
                      >
                        <Trash2 className="w-4 h-4" /> Remove Lead
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
              ? "Loading leads…"
              : leads.length === 0
              ? "No leads yet. Click \"Add Lead\" or import a CSV."
              : "No leads match your search."}
          </div>
        )}
      </div>

      {/* Add Lead Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md" data-testid="lead-dialog">
          <DialogHeader>
            <DialogTitle>Add Lead</DialogTitle>
            <DialogDescription>
              Manually add a single lead. Use Import CSV for bulk uploads.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Full Name *</Label>
              <Input
                placeholder="e.g. Rahul Sharma"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                data-testid="lead-name-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Phone *</Label>
              <Input
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                data-testid="lead-phone-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                data-testid="lead-email-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Source</Label>
                <Input
                  placeholder="e.g. Website"
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  data-testid="lead-source-input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Campaign</Label>
                <Select
                  value={form.campaign_id}
                  onValueChange={(v) => setForm({ ...form, campaign_id: v })}
                >
                  <SelectTrigger data-testid="lead-campaign-select">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} data-testid="lead-save-btn">
              {saving ? "Saving…" : "Add Lead"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

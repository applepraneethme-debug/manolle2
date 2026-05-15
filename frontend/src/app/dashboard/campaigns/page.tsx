"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Play, Pause, MoreVertical, Users, Phone, Calendar, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  useCampaigns,
  useAgents,
  type DbCampaign,
} from "@/hooks/useSupabaseData";

const statusMap: Record<string, { label: string; variant: string }> = {
  running: { label: "Running", variant: "running" },
  paused: { label: "Paused", variant: "paused" },
  completed: { label: "Completed", variant: "completed" },
  draft: { label: "Draft", variant: "draft" },
};

export default function CampaignsPage() {
  const { data: campaigns, loading, insert, update, remove } = useCampaigns();
  const { data: agents } = useAgents();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DbCampaign | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    agent_id: "",
    status: "draft" as DbCampaign["status"],
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", agent_id: "", status: "draft" });
    setDialogOpen(true);
  };

  const openEdit = (c: DbCampaign) => {
    setEditing(c);
    setForm({
      name: c.name,
      description: c.description || "",
      agent_id: c.agent_id || "",
      status: c.status,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Campaign name is required");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        status: form.status,
      };
      if (form.agent_id) payload.agent_id = form.agent_id;
      if (editing) {
        await update(editing.id, payload);
        toast.success("Campaign updated");
      } else {
        await insert({
          ...payload,
          total_leads: 0,
          leads_called: 0,
          appointments_booked: 0,
        });
        toast.success("Campaign created");
      }
      setDialogOpen(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (c: DbCampaign) => {
    const next: DbCampaign["status"] = c.status === "running" ? "paused" : "running";
    try {
      await update(c.id, { status: next });
      toast.success(`Campaign ${next}`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this campaign?")) return;
    try {
      await remove(id);
      toast.success("Campaign deleted");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  const agentName = (id?: string) => agents.find((a) => a.id === id)?.name || "—";

  return (
    <div className="space-y-6" data-testid="campaigns-page">
      <div className="flex items-center justify-between">
        <p className="text-[#A1A1AA] text-sm">
          {campaigns.filter((c) => c.status === "running").length} active campaigns
        </p>
        <Button className="gap-2" onClick={openCreate} data-testid="create-campaign-btn">
          <Plus className="w-4 h-4" />
          New Campaign
        </Button>
      </div>

      {loading && campaigns.length === 0 && (
        <div className="text-center py-12 text-sm text-[#71717A]">Loading campaigns…</div>
      )}

      {!loading && campaigns.length === 0 && (
        <div className="glass-card p-12 text-center text-sm text-[#71717A]">
          No campaigns yet. Click &quot;New Campaign&quot; to launch your first outreach.
        </div>
      )}

      <div className="space-y-3">
        {campaigns.map((c, i) => {
          const progress =
            c.total_leads > 0 ? Math.round((c.leads_called / c.total_leads) * 100) : 0;
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card p-5"
              data-testid={`campaign-card-${c.id}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h3 className="font-outfit font-semibold text-white text-sm">
                      {c.name}
                    </h3>
                    <Badge variant={statusMap[c.status]?.variant}>
                      {statusMap[c.status]?.label}
                    </Badge>
                  </div>
                  {c.description && (
                    <p className="text-xs text-[#71717A] mb-3">{c.description}</p>
                  )}

                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-[#71717A] mb-1">
                      <span>Progress</span>
                      <span>
                        {progress}% ({c.leads_called}/{c.total_leads})
                      </span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>

                  <div className="flex items-center gap-5 text-xs text-[#71717A] flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> {c.total_leads} leads
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> {c.leads_called} contacted
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#00F0FF]" />
                      <span className="text-[#00F0FF]">
                        {c.appointments_booked} booked
                      </span>
                    </span>
                    <span>Agent: {agentName(c.agent_id)}</span>
                    <span>
                      Started:{" "}
                      {new Date(c.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {(c.status === "running" || c.status === "paused") && (
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => toggleStatus(c)}
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
                      <Button variant="ghost" size="icon" data-testid={`campaign-menu-${c.id}`}>
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(c)} data-testid={`campaign-edit-${c.id}`}>
                        <Edit2 className="w-4 h-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-400 focus:text-red-400"
                        onClick={() => handleDelete(c.id)}
                        data-testid={`campaign-delete-${c.id}`}
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" data-testid="campaign-dialog">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Campaign" : "Create Campaign"}</DialogTitle>
            <DialogDescription>
              Set up a calling campaign and assign an AI agent to run it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Campaign Name *</Label>
              <Input
                placeholder="e.g. Q1 Real Estate Leads"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                data-testid="campaign-name-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                placeholder="What is this campaign about?"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="min-h-[80px]"
                data-testid="campaign-description-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>AI Agent</Label>
                <Select
                  value={form.agent_id}
                  onValueChange={(v) => setForm({ ...form, agent_id: v })}
                >
                  <SelectTrigger data-testid="campaign-agent-select">
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.length === 0 && (
                      <SelectItem value="none" disabled>
                        Create an agent first
                      </SelectItem>
                    )}
                    {agents.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm({ ...form, status: v as DbCampaign["status"] })
                  }
                >
                  <SelectTrigger data-testid="campaign-status-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} data-testid="campaign-save-btn">
              {saving ? "Saving…" : editing ? "Save Changes" : "Create Campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

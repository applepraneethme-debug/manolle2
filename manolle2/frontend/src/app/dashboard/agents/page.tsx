"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Bot, Edit2, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useAgents, type DbAgent } from "@/hooks/useSupabaseData";

const voices = [
  { value: "professional-male", label: "Professional Male" },
  { value: "friendly-female", label: "Friendly Female" },
  { value: "energetic-male", label: "Energetic Male" },
  { value: "calm-female", label: "Calm Female" },
  { value: "formal-neutral", label: "Formal Neutral" },
];

export default function AgentsPage() {
  const { data: agents, loading, insert, update, remove } = useAgents();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DbAgent | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    voice: "professional-male",
    system_prompt: "",
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", voice: "professional-male", system_prompt: "" });
    setDialogOpen(true);
  };

  const openEdit = (agent: DbAgent) => {
    setEditing(agent);
    setForm({
      name: agent.name,
      voice: agent.voice,
      system_prompt: agent.system_prompt || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Agent name is required");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await update(editing.id, form);
        toast.success("Agent updated");
      } else {
        await insert({ ...form, is_active: true, calls_made: 0 });
        toast.success("Agent created");
      }
      setDialogOpen(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (agent: DbAgent) => {
    try {
      await update(agent.id, { is_active: !agent.is_active });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to toggle");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this agent? This action cannot be undone.")) return;
    try {
      await remove(id);
      toast.success("Agent deleted");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  const activeCount = agents.filter((a) => a.is_active).length;

  return (
    <div className="space-y-6" data-testid="agents-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#A1A1AA] text-sm">
            {activeCount} of {agents.length} agents active
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2" data-testid="create-agent-btn">
          <Plus className="w-4 h-4" />
          Create Agent
        </Button>
      </div>

      {loading && agents.length === 0 && (
        <div className="text-center py-12 text-sm text-[#71717A]">Loading agents…</div>
      )}

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent, i) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`glass-card p-6 transition-all duration-200 hover:border-white/20 ${
              agent.is_active ? "border-white/10" : "opacity-60"
            }`}
            data-testid={`agent-card-${agent.id}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    agent.is_active
                      ? "bg-[#00F0FF]/10 border-[#00F0FF]/30"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  <Bot
                    className={`w-5 h-5 ${
                      agent.is_active ? "text-[#00F0FF]" : "text-[#71717A]"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="font-outfit font-semibold text-white text-sm">
                    {agent.name}
                  </h3>
                  <p className="text-xs text-[#71717A]">
                    Created{" "}
                    {new Date(agent.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7"
                    data-testid={`agent-menu-${agent.id}`}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEdit(agent)} data-testid={`agent-edit-${agent.id}`}>
                    <Edit2 className="w-4 h-4" /> Edit Agent
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-400 focus:text-red-400"
                    onClick={() => handleDelete(agent.id)}
                    data-testid={`agent-delete-${agent.id}`}
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <p className="text-xs text-[#71717A] line-clamp-2 mb-4 leading-relaxed min-h-[2.5rem]">
              {agent.system_prompt || "No system prompt yet."}
            </p>

            <div className="flex items-center gap-4 mb-4">
              <div className="text-center">
                <div className="font-outfit text-lg font-semibold text-white">
                  {agent.calls_made ?? 0}
                </div>
                <div className="text-xs text-[#71717A]">Calls</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <div className="text-xs text-[#71717A] mb-1">Voice</div>
                <Badge variant="secondary" className="text-xs">
                  {voices.find((v) => v.value === agent.voice)?.label || agent.voice}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <span className="text-xs text-[#71717A]">
                {agent.is_active ? "Active" : "Inactive"}
              </span>
              <Switch
                checked={agent.is_active}
                onCheckedChange={() => toggleStatus(agent)}
                data-testid={`agent-toggle-${agent.id}`}
              />
            </div>
          </motion.div>
        ))}

        {/* Create placeholder */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={openCreate}
          className="glass-card p-6 border-dashed border-white/10 hover:border-[#00F0FF]/30 hover:bg-[#00F0FF]/[0.02] transition-all duration-200 flex flex-col items-center justify-center gap-2 min-h-[200px] group"
          data-testid="create-agent-card"
        >
          <div className="w-10 h-10 rounded-xl border border-dashed border-white/20 group-hover:border-[#00F0FF]/40 flex items-center justify-center">
            <Plus className="w-5 h-5 text-[#71717A] group-hover:text-[#00F0FF]" />
          </div>
          <span className="text-sm text-[#71717A] group-hover:text-white transition-colors">
            New Agent
          </span>
        </motion.button>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" data-testid="agent-dialog">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Agent" : "Create AI Agent"}</DialogTitle>
            <DialogDescription>
              Configure your AI voice agent. The system prompt defines how it behaves.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Agent Name</Label>
              <Input
                placeholder="e.g. Real Estate Qualifier"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                data-testid="agent-name-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Voice</Label>
              <Select
                value={form.voice}
                onValueChange={(v) => setForm({ ...form, voice: v })}
              >
                <SelectTrigger data-testid="agent-voice-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((v) => (
                    <SelectItem key={v.value} value={v.value}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>System Prompt</Label>
              <Textarea
                placeholder="Describe how your agent should behave, what it should say, and how it should qualify leads..."
                value={form.system_prompt}
                onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
                className="min-h-[120px]"
                data-testid="agent-prompt-input"
              />
              <p className="text-xs text-[#71717A]">
                This prompt will be sent directly to the AI brain. Be specific about your business context.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} data-testid="agent-save-btn">
              {saving ? "Saving…" : editing ? "Save Changes" : "Create Agent"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

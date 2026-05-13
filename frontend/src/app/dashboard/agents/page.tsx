"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Bot, Phone, Edit2, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const initialAgents = [
  {
    id: "1",
    name: "Real Estate Qualifier",
    voice: "professional-male",
    status: true,
    calls: 128,
    appointments: 24,
    systemPrompt: "You are a professional real estate assistant calling on behalf of [Company]. Your goal is to qualify leads for property site visits...",
    created: "Jan 15, 2025",
  },
  {
    id: "2",
    name: "Clinic Reminder Bot",
    voice: "friendly-female",
    status: true,
    calls: 96,
    appointments: 18,
    systemPrompt: "You are a polite medical assistant calling to confirm and remind patients about their upcoming appointments...",
    created: "Jan 20, 2025",
  },
  {
    id: "3",
    name: "Property Tour Booker",
    voice: "energetic-male",
    status: false,
    calls: 23,
    appointments: 1,
    systemPrompt: "You are an enthusiastic property consultant calling interested buyers to schedule a premium property tour...",
    created: "Feb 1, 2025",
  },
];

const voices = [
  { value: "professional-male", label: "Professional Male" },
  { value: "friendly-female", label: "Friendly Female" },
  { value: "energetic-male", label: "Energetic Male" },
  { value: "calm-female", label: "Calm Female" },
  { value: "formal-neutral", label: "Formal Neutral" },
];

export default function AgentsPage() {
  const [agents, setAgents] = useState(initialAgents);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<typeof initialAgents[0] | null>(null);
  const [form, setForm] = useState({ name: "", voice: "professional-male", systemPrompt: "" });

  const openCreate = () => {
    setEditingAgent(null);
    setForm({ name: "", voice: "professional-male", systemPrompt: "" });
    setDialogOpen(true);
  };

  const openEdit = (agent: typeof initialAgents[0]) => {
    setEditingAgent(agent);
    setForm({ name: agent.name, voice: agent.voice, systemPrompt: agent.systemPrompt });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error("Agent name is required"); return; }
    if (editingAgent) {
      setAgents((prev) => prev.map((a) => a.id === editingAgent.id ? { ...a, ...form } : a));
      toast.success("Agent updated");
    } else {
      const newAgent = {
        id: Date.now().toString(),
        ...form,
        status: true,
        calls: 0,
        appointments: 0,
        created: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      };
      setAgents((prev) => [...prev, newAgent]);
      toast.success("Agent created");
    }
    setDialogOpen(false);
  };

  const toggleStatus = (id: string) => {
    setAgents((prev) =>
      prev.map((a) => a.id === id ? { ...a, status: !a.status } : a)
    );
  };

  const deleteAgent = (id: string) => {
    setAgents((prev) => prev.filter((a) => a.id !== id));
    toast.success("Agent deleted");
  };

  return (
    <div className="space-y-6" data-testid="agents-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#A1A1AA] text-sm">
            {agents.filter((a) => a.status).length} of {agents.length} agents active
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2" data-testid="create-agent-btn">
          <Plus className="w-4 h-4" />
          Create Agent
        </Button>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent, i) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`glass-card p-6 transition-all duration-200 hover:border-white/20 ${agent.status ? "border-white/10" : "opacity-60"}`}
            data-testid={`agent-card-${agent.id}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                  agent.status
                    ? "bg-[#00F0FF]/10 border-[#00F0FF]/30"
                    : "bg-white/5 border-white/10"
                }`}>
                  <Bot className={`w-5 h-5 ${agent.status ? "text-[#00F0FF]" : "text-[#71717A]"}`} />
                </div>
                <div>
                  <h3 className="font-outfit font-semibold text-white text-sm">{agent.name}</h3>
                  <p className="text-xs text-[#71717A]">Created {agent.created}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-7 h-7" data-testid={`agent-menu-${agent.id}`}>
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEdit(agent)}>
                    <Edit2 className="w-4 h-4" /> Edit Agent
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-400 focus:text-red-400"
                    onClick={() => deleteAgent(agent.id)}
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <p className="text-xs text-[#71717A] line-clamp-2 mb-4 leading-relaxed">
              {agent.systemPrompt}
            </p>

            <div className="flex items-center gap-4 mb-4">
              <div className="text-center">
                <div className="font-outfit text-lg font-semibold text-white">{agent.calls}</div>
                <div className="text-xs text-[#71717A]">Calls</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <div className="font-outfit text-lg font-semibold text-white">{agent.appointments}</div>
                <div className="text-xs text-[#71717A]">Booked</div>
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
                {agent.status ? "Active" : "Inactive"}
              </span>
              <Switch
                checked={agent.status}
                onCheckedChange={() => toggleStatus(agent.id)}
                data-testid={`agent-toggle-${agent.id}`}
              />
            </div>
          </motion.div>
        ))}

        {/* Create placeholder */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: agents.length * 0.07 }}
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
            <DialogTitle>{editingAgent ? "Edit Agent" : "Create AI Agent"}</DialogTitle>
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
              <Select value={form.voice} onValueChange={(v) => setForm({ ...form, voice: v })}>
                <SelectTrigger data-testid="agent-voice-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((v) => (
                    <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>System Prompt</Label>
              <Textarea
                placeholder="Describe how your agent should behave, what it should say, and how it should qualify leads..."
                value={form.systemPrompt}
                onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
                className="min-h-[120px]"
                data-testid="agent-prompt-input"
              />
              <p className="text-xs text-[#71717A]">
                This prompt will be sent directly to the AI brain. Be specific about your business context.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} data-testid="agent-save-btn">
              {editingAgent ? "Save Changes" : "Create Agent"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

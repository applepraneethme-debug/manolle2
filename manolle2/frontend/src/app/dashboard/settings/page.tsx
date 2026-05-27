"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Account = {
  user: { id: string; email: string; role: string };
  organization: {
    client_id: string;
    business_name: string;
    business_type: string;
    plan: string;
    calls_limit: number;
    leads_limit: number;
    expires_at: string | null;
    vapi_assistant_id?: string | null;
    vapi_phone_number_id?: string | null;
  };
};

export default function SettingsPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [saving, setSaving] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("other");
  const [assistantId, setAssistantId] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });

  const load = async () => {
    const response = await fetch("/api/account");
    const data = await response.json();
    if (response.ok) {
      setAccount(data);
      setBusinessName(data.organization.business_name || "");
      setBusinessType(data.organization.business_type || "other");
      setAssistantId(data.organization.vapi_assistant_id || "");
      setPhoneNumberId(data.organization.vapi_phone_number_id || "");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (payload: Record<string, unknown>, success: string) => {
    setSaving(true);
    try {
      const response = await fetch("/api/account", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Save failed");
      toast.success(success);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl" data-testid="settings-page">
      <Tabs defaultValue="profile">
        <TabsList className="mb-6" data-testid="settings-tabs">
          <TabsTrigger value="profile">Credentials</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="agent">Agent</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-5">
            <div>
              <h3 className="font-outfit font-semibold text-white mb-1">Account Credentials</h3>
              <p className="text-sm text-[#71717A]">Your login identity and plan access.</p>
            </div>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Client ID</Label>
                <Input value={account?.organization.client_id || ""} readOnly />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={account?.user.email || ""} readOnly />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Input value={account?.user.role || ""} readOnly />
              </div>
              <div className="space-y-1.5">
                <Label>Plan</Label>
                <div className="h-10 flex items-center">
                  <Badge>{account?.organization.plan || "starter"}</Badge>
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="business">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-5">
            <div>
              <h3 className="font-outfit font-semibold text-white mb-1">Business Profile</h3>
              <p className="text-sm text-[#71717A]">Update what Manolle uses for your workspace.</p>
            </div>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Business Name</Label>
                <Input value={businessName} onChange={(event) => setBusinessName(event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Business Type</Label>
                <Input value={businessType} onChange={(event) => setBusinessType(event.target.value)} placeholder="salon, clinic, realestate, other" />
              </div>
            </div>
            <Button disabled={saving} onClick={() => save({ business_name: businessName, business_type: businessType }, "Business saved")}>
              {saving ? "Saving..." : "Save Business"}
            </Button>
          </motion.div>
        </TabsContent>

        <TabsContent value="agent">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-5">
            <div>
              <h3 className="font-outfit font-semibold text-white mb-1">Agent Configuration</h3>
              <p className="text-sm text-[#71717A]">Vapi IDs connected to this client account.</p>
            </div>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Vapi Assistant ID</Label>
                <Input value={assistantId} onChange={(event) => setAssistantId(event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Vapi Phone Number ID</Label>
                <Input value={phoneNumberId} onChange={(event) => setPhoneNumberId(event.target.value)} />
              </div>
            </div>
            <Button disabled={saving} onClick={() => save({ vapi_assistant_id: assistantId, vapi_phone_number_id: phoneNumberId }, "Agent settings saved")}>
              {saving ? "Saving..." : "Save Agent"}
            </Button>
          </motion.div>
        </TabsContent>

        <TabsContent value="security">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-5">
            <div>
              <h3 className="font-outfit font-semibold text-white mb-1">Change Password</h3>
              <p className="text-sm text-[#71717A]">Password changes keep the same client ID and email.</p>
            </div>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Current Password</Label>
                <Input type="password" value={passwords.currentPassword} onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>New Password</Label>
                <Input type="password" value={passwords.newPassword} onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })} />
              </div>
            </div>
            <Button
              disabled={saving || !passwords.currentPassword || passwords.newPassword.length < 8}
              onClick={() => save(passwords, "Password changed")}
            >
              {saving ? "Saving..." : "Change Password"}
            </Button>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

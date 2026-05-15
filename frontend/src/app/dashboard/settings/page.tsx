"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface ProfileRow {
  id: string;
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  website?: string | null;
  industry?: string | null;
  description?: string | null;
  timezone?: string | null;
  notif_call_completed?: boolean | null;
  notif_appointment_booked?: boolean | null;
  notif_campaign_finished?: boolean | null;
  notif_weekly_report?: boolean | null;
  notif_low_balance?: boolean | null;
  plan?: string | null;
}

const plans = [
  {
    name: "Starter",
    price: "₹2,999",
    period: "/month",
    features: ["100 AI calls/month", "1 AI Agent", "Basic analytics", "CSV import", "Email support"],
    color: "#A1A1AA",
  },
  {
    name: "Pro",
    price: "₹7,999",
    period: "/month",
    features: ["500 AI calls/month", "5 AI Agents", "Advanced analytics", "Campaign management", "Call transcripts", "Priority support"],
    color: "#00F0FF",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    features: ["Unlimited AI calls", "Unlimited Agents", "White-label option", "Custom integrations", "Dedicated manager", "SLA guarantee"],
    color: "#0066FF",
  },
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [profile, setProfile] = useState({
    fullName: "",
    phone: "",
    timezone: "Asia/Kolkata",
  });
  const [company, setCompany] = useState({
    name: "",
    website: "",
    industry: "",
    description: "",
  });
  const [notifications, setNotifications] = useState({
    callCompleted: true,
    appointmentBooked: true,
    campaignFinished: true,
    weeklyReport: false,
    lowBalance: true,
  });
  const [currentPlan, setCurrentPlan] = useState<string>("starter");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);
      setEmail(user.email || "");
      const { data: row } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      const r = (row as ProfileRow | null) || null;
      if (r) {
        setProfile({
          fullName: r.full_name || "",
          phone: r.phone || "",
          timezone: r.timezone || "Asia/Kolkata",
        });
        setCompany({
          name: r.company_name || "",
          website: r.website || "",
          industry: r.industry || "",
          description: r.description || "",
        });
        setNotifications({
          callCompleted: r.notif_call_completed ?? true,
          appointmentBooked: r.notif_appointment_booked ?? true,
          campaignFinished: r.notif_campaign_finished ?? true,
          weeklyReport: r.notif_weekly_report ?? false,
          lowBalance: r.notif_low_balance ?? true,
        });
        setCurrentPlan(r.plan || "starter");
      }
      setLoading(false);
    };
    load();
  }, []);

  const upsertProfile = async (patch: Partial<ProfileRow>) => {
    if (!userId) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: userId, ...patch }, { onConflict: "id" });
      if (error) throw error;
      return true;
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Save failed");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveProfile = async () => {
    const ok = await upsertProfile({
      full_name: profile.fullName,
      phone: profile.phone,
      timezone: profile.timezone,
    });
    if (ok) toast.success("Profile saved");
  };

  const saveCompany = async () => {
    const ok = await upsertProfile({
      company_name: company.name,
      website: company.website,
      industry: company.industry,
      description: company.description,
    });
    if (ok) toast.success("Company saved");
  };

  const saveNotifications = async () => {
    const ok = await upsertProfile({
      notif_call_completed: notifications.callCompleted,
      notif_appointment_booked: notifications.appointmentBooked,
      notif_campaign_finished: notifications.campaignFinished,
      notif_weekly_report: notifications.weeklyReport,
      notif_low_balance: notifications.lowBalance,
    });
    if (ok) toast.success("Preferences saved");
  };

  return (
    <div className="max-w-4xl" data-testid="settings-page">
      <Tabs defaultValue="profile">
        <TabsList className="mb-6" data-testid="settings-tabs">
          <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
          <TabsTrigger value="company" data-testid="tab-company">Company</TabsTrigger>
          <TabsTrigger value="notifications" data-testid="tab-notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing" data-testid="tab-billing">Billing</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 space-y-5"
            data-testid="profile-settings"
          >
            <div>
              <h3 className="font-outfit font-semibold text-white mb-1">Profile Settings</h3>
              <p className="text-sm text-[#71717A]">Update your personal information</p>
            </div>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  placeholder={loading ? "Loading…" : "Your name"}
                  data-testid="profile-name-input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={email} readOnly disabled data-testid="profile-email-input" />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  data-testid="profile-phone-input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Timezone</Label>
                <Input
                  value={profile.timezone}
                  onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                />
              </div>
            </div>
            <div className="pt-2">
              <Button onClick={saveProfile} disabled={saving} data-testid="save-profile-btn">
                {saving ? "Saving…" : "Save Profile"}
              </Button>
            </div>
          </motion.div>
        </TabsContent>

        {/* Company */}
        <TabsContent value="company">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 space-y-5"
            data-testid="company-settings"
          >
            <div>
              <h3 className="font-outfit font-semibold text-white mb-1">Company Settings</h3>
              <p className="text-sm text-[#71717A]">Configure your business profile</p>
            </div>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Company Name</Label>
                <Input
                  value={company.name}
                  onChange={(e) => setCompany({ ...company, name: e.target.value })}
                  data-testid="company-name-input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Website</Label>
                <Input
                  value={company.website}
                  onChange={(e) => setCompany({ ...company, website: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Industry</Label>
                <Input
                  value={company.industry}
                  onChange={(e) => setCompany({ ...company, industry: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Business Description</Label>
              <Textarea
                value={company.description}
                onChange={(e) => setCompany({ ...company, description: e.target.value })}
                className="min-h-[80px]"
              />
            </div>
            <Button onClick={saveCompany} disabled={saving} data-testid="save-company-btn">
              {saving ? "Saving…" : "Save Company"}
            </Button>
          </motion.div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 space-y-5"
            data-testid="notification-settings"
          >
            <div>
              <h3 className="font-outfit font-semibold text-white mb-1">Notifications</h3>
              <p className="text-sm text-[#71717A]">Choose what you want to be notified about</p>
            </div>
            <Separator />
            <div className="space-y-4">
              {[
                { key: "callCompleted", label: "Call Completed", desc: "Notify when an AI call is completed" },
                { key: "appointmentBooked", label: "Appointment Booked", desc: "Notify when a new appointment is booked" },
                { key: "campaignFinished", label: "Campaign Finished", desc: "Notify when a campaign completes all calls" },
                { key: "weeklyReport", label: "Weekly Report", desc: "Receive a weekly performance summary" },
                { key: "lowBalance", label: "Low Call Balance", desc: "Alert when monthly call limit is 90% used" },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                >
                  <div>
                    <div className="text-sm font-medium text-white">{item.label}</div>
                    <div className="text-xs text-[#71717A]">{item.desc}</div>
                  </div>
                  <Switch
                    checked={notifications[item.key as keyof typeof notifications]}
                    onCheckedChange={(v) =>
                      setNotifications({ ...notifications, [item.key]: v })
                    }
                    data-testid={`notification-${item.key}`}
                  />
                </div>
              ))}
            </div>
            <Button onClick={saveNotifications} disabled={saving} data-testid="save-notifications-btn">
              {saving ? "Saving…" : "Save Preferences"}
            </Button>
          </motion.div>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
            data-testid="billing-settings"
          >
            <div className="glass-card p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">
                  Current Plan:{" "}
                  <span className="text-[#00F0FF] capitalize">{currentPlan}</span>
                </p>
                <p className="text-xs text-[#71717A]">Razorpay billing coming soon</p>
              </div>
              <Badge variant="default">Active</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => {
                const isCurrent = plan.name.toLowerCase() === currentPlan;
                return (
                  <div
                    key={plan.name}
                    className={`glass-card p-6 relative transition-all ${
                      isCurrent
                        ? "border-[#00F0FF]/40 shadow-[0_0_20px_rgba(0,240,255,0.08)]"
                        : "hover:border-white/20"
                    }`}
                    data-testid={`plan-${plan.name.toLowerCase()}`}
                  >
                    {isCurrent && (
                      <Badge className="absolute -top-2 right-4 text-xs">Current</Badge>
                    )}
                    <h4 className="font-outfit text-xl font-semibold text-white">
                      {plan.name}
                    </h4>
                    <div className="my-4">
                      <span className="font-outfit text-3xl font-semibold text-white">
                        {plan.price}
                      </span>
                      <span className="text-sm text-[#71717A]">{plan.period}</span>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs text-[#A1A1AA]">
                          <span className="text-[#00F0FF] mt-0.5">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={isCurrent ? "secondary" : "default"}
                      className="w-full"
                      disabled={isCurrent}
                      onClick={() => toast.info("Razorpay billing coming soon")}
                    >
                      {isCurrent ? "Current Plan" : `Switch to ${plan.name}`}
                    </Button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

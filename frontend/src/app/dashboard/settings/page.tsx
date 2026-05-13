"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Building2, Bell, CreditCard, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const plans = [
  {
    name: "Starter",
    price: "₹2,999",
    period: "/month",
    current: false,
    features: ["100 AI calls/month", "1 AI Agent", "Basic analytics", "CSV import", "Email support"],
    color: "#A1A1AA",
  },
  {
    name: "Pro",
    price: "₹7,999",
    period: "/month",
    current: true,
    features: ["500 AI calls/month", "5 AI Agents", "Advanced analytics", "Campaign management", "Call transcripts", "Priority support"],
    color: "#00F0FF",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    current: false,
    features: ["Unlimited AI calls", "Unlimited Agents", "White-label option", "Custom integrations", "Dedicated manager", "SLA guarantee"],
    color: "#0066FF",
  },
];

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    fullName: "Demo User",
    email: "demo@manolleai.com",
    phone: "+91 98765 43210",
    timezone: "Asia/Kolkata",
  });

  const [company, setCompany] = useState({
    name: "Manolle AI Demo",
    website: "https://manolleai.com",
    industry: "Real Estate",
    description: "Leading AI calling automation platform.",
  });

  const [notifications, setNotifications] = useState({
    callCompleted: true,
    appointmentBooked: true,
    campaignFinished: true,
    weeklyReport: false,
    lowBalance: true,
  });

  const handleSave = (section: string) => {
    toast.success(`${section} saved successfully`);
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
                  data-testid="profile-name-input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  data-testid="profile-email-input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  data-testid="profile-phone-input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Timezone</Label>
                <Input value={profile.timezone} onChange={(e) => setProfile({ ...profile, timezone: e.target.value })} />
              </div>
            </div>
            <div className="pt-2">
              <Button onClick={() => handleSave("Profile")} data-testid="save-profile-btn">
                Save Profile
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
                <Input value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} data-testid="company-name-input" />
              </div>
              <div className="space-y-1.5">
                <Label>Website</Label>
                <Input value={company.website} onChange={(e) => setCompany({ ...company, website: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Industry</Label>
                <Input value={company.industry} onChange={(e) => setCompany({ ...company, industry: e.target.value })} />
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
            <Button onClick={() => handleSave("Company")} data-testid="save-company-btn">
              Save Company
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
                <div key={item.key} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-white">{item.label}</div>
                    <div className="text-xs text-[#71717A]">{item.desc}</div>
                  </div>
                  <Switch
                    checked={notifications[item.key as keyof typeof notifications]}
                    onCheckedChange={(v) => setNotifications({ ...notifications, [item.key]: v })}
                    data-testid={`notification-${item.key}`}
                  />
                </div>
              ))}
            </div>
            <Button onClick={() => handleSave("Notifications")} data-testid="save-notifications-btn">
              Save Preferences
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
                <p className="text-sm font-medium text-white">Current Plan: <span className="text-[#00F0FF]">Pro</span></p>
                <p className="text-xs text-[#71717A]">Next billing: March 1, 2025</p>
              </div>
              <Badge variant="default">Active</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`glass-card p-6 relative transition-all ${
                    plan.current
                      ? "border-[#00F0FF]/40 shadow-[0_0_20px_rgba(0,240,255,0.08)]"
                      : "hover:border-white/20"
                  }`}
                  data-testid={`billing-plan-${plan.name.toLowerCase()}`}
                >
                  {plan.current && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-0.5 text-xs font-semibold bg-[#00F0FF] text-black rounded-full">
                        Current
                      </span>
                    </div>
                  )}
                  <h3 className="font-outfit font-semibold text-white mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="font-outfit text-2xl font-semibold text-white">{plan.price}</span>
                    <span className="text-xs text-[#71717A]">{plan.period}</span>
                  </div>
                  <ul className="space-y-2 mb-5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-[#A1A1AA]">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: plan.color }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.current ? "secondary" : "default"}
                    className="w-full text-sm"
                    disabled={plan.current}
                    onClick={() => toast.info("Razorpay billing integration coming soon!")}
                    data-testid={`upgrade-to-${plan.name.toLowerCase()}`}
                  >
                    {plan.current ? "Current Plan" : plan.name === "Enterprise" ? "Contact Sales" : `Upgrade to ${plan.name}`}
                    {!plan.current && <ArrowRight className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              ))}
            </div>

            <div className="glass-card p-4 border-amber-500/20 bg-amber-500/5">
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Payment Integration</p>
                  <p className="text-xs text-[#A1A1AA] mt-1">
                    Razorpay subscription billing will be available in the next release. Upgrade and downgrade plans seamlessly with INR pricing.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Phone, Bot, Users, Calendar, BarChart3, Upload, CheckCircle2,
  Building2, Stethoscope, Scissors, ArrowRight, Zap, Clock, TrendingUp, Star,
  Play, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/landing/Navbar";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" },
  }),
};

const features = [
  {
    icon: Bot,
    title: "Intelligent Voice Agents",
    description: "Create AI callers with custom personalities, voices, and system prompts tuned to your business.",
    accent: "col-span-1",
  },
  {
    icon: Phone,
    title: "Automated Outbound Calls",
    description: "Your AI agent dials leads automatically, handles objections, and qualifies prospects in real time.",
    accent: "col-span-1",
  },
  {
    icon: Calendar,
    title: "Smart Appointment Booking",
    description: "AI books confirmed appointments directly in your calendar without human intervention.",
    accent: "col-span-1",
  },
  {
    icon: Users,
    title: "Lead Qualification Engine",
    description: "Instantly score and qualify every lead based on your custom criteria before you spend time on them.",
    accent: "col-span-1",
  },
  {
    icon: BarChart3,
    title: "Real-Time Call Analytics",
    description: "Track call success rates, agent performance, and conversion funnels from one sleek dashboard.",
    accent: "col-span-1",
  },
  {
    icon: Upload,
    title: "Bulk CSV Import",
    description: "Upload your entire lead list in seconds. Manolle AI validates, deduplicates, and deploys instantly.",
    accent: "col-span-1",
  },
];

const useCases = [
  {
    icon: Building2,
    tag: "Real Estate",
    title: "Automate Property Inquiries",
    description:
      "Automated lead qualification and site-visit scheduling — AI calls every inquiry, qualifies budget, and books visits.",
    stats: [
      { value: "3x", label: "More site visits booked" },
      { value: "80%", label: "Less manual calling time" },
    ],
    color: "#00F0FF",
  },
  {
    icon: Stethoscope,
    tag: "Clinics",
    title: "Never Miss an Appointment",
    description:
      "Patient appointment booking and automated reminders — confirm, reschedule, and follow up on autopilot.",
    stats: [
      { value: "60%", label: "Reduction in no-shows" },
      { value: "2x", label: "Appointment capacity" },
    ],
    color: "#0066FF",
  },
  {
    icon: Scissors,
    tag: "Barbershops",
    title: "Fill Every Chair",
    description:
      "Seamless slot booking and haircut appointment management — confirm walk-ins, fill open slots, reduce no-shows.",
    stats: [
      { value: "40%", label: "More bookings/week" },
      { value: "24/7", label: "Always-on booking line" },
    ],
    color: "#F59E0B",
  },
];

const steps = [
  {
    step: "01",
    title: "Create Your AI Agent",
    description: "Configure your agent with a name, voice, and system prompt that defines how it talks to leads.",
  },
  {
    step: "02",
    title: "Import Your Lead List",
    description: "Upload a CSV or sync from your CRM. Manolle validates and prepares leads for outreach in seconds.",
  },
  {
    step: "03",
    title: "Deploy & Watch It Work",
    description: "Launch your campaign. AI makes calls 24/7, qualifies prospects, and books appointments for you.",
  },
];

const pricing = [
  {
    name: "Starter",
    price: "₹2,999",
    period: "/month",
    description: "Perfect for solo agents and small teams",
    features: [
      "100 AI calls/month",
      "1 AI Agent",
      "Basic analytics",
      "CSV import",
      "Email support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Pro",
    price: "₹7,999",
    period: "/month",
    description: "For growing teams scaling outreach",
    features: [
      "500 AI calls/month",
      "5 AI Agents",
      "Advanced analytics",
      "Campaign management",
      "Call transcripts",
      "Priority support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For high-volume operations",
    features: [
      "Unlimited AI calls",
      "Unlimited AI Agents",
      "White-label option",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const testimonials = [
  {
    name: "Rahul Sharma",
    role: "Real Estate Director, PropNest",
    avatar: "RS",
    quote:
      "Manolle AI books 3x more site visits than our manual team did. It works round the clock, never takes a break.",
  },
  {
    name: "Dr. Priya Nair",
    role: "Clinic Manager, CareFirst",
    avatar: "PN",
    quote:
      "We cut appointment no-shows by 60%. Patients love getting reminded and the AI handles rescheduling perfectly.",
  },
  {
    name: "Amit Verma",
    role: "Sales Head, UrbanHomes",
    avatar: "AV",
    quote:
      "The lead qualification is insane. Our sales team now only talks to hot prospects. Revenue is up 40%.",
  },
];

export default function LandingPage() {
  return (
    <main className="bg-[#0A0A0A] min-h-screen overflow-x-hidden">
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% -20%, rgba(0,240,255,0.12), rgba(0,0,0,0) 60%)",
          }}
        />
        {/* Grid pattern */}
        <div className="absolute inset-0 grid-bg pointer-events-none" />

        <div className="relative z-10 text-center max-w-5xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00F0FF]/20 bg-[#00F0FF]/5 text-[#00F0FF] text-xs font-medium mb-8 tracking-wider uppercase"
            >
              <Zap className="w-3 h-3" />
              AI Calling Automation Platform
            </motion.div>

            <h1 className="font-outfit text-5xl sm:text-6xl lg:text-7xl font-light text-white leading-[1.1] mb-6 tracking-tight">
              Close More Deals.
              <br />
              <span
                className="font-semibold"
                style={{ textShadow: "0 0 60px rgba(0,240,255,0.4)" }}
              >
                Let AI Do The Calling.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-[#A1A1AA] max-w-2xl mx-auto mb-10 leading-relaxed">
              Deploy intelligent AI voice agents that call your leads, qualify
              prospects, and book appointments — 24/7, automatically.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/auth/signup" data-testid="hero-cta-btn">
                <Button size="xl" className="gap-2 font-semibold">
                  Start Free Trial
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="#how-it-works" data-testid="hero-demo-btn">
                <Button size="xl" variant="secondary" className="gap-2">
                  <Play className="w-4 h-4" />
                  See How It Works
                </Button>
              </Link>
            </div>

            {/* Stats bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-8 sm:gap-12"
            >
              {[
                { value: "10,000+", label: "Calls Made Daily" },
                { value: "3x", label: "More Appointments" },
                { value: "60%", label: "Less Manual Work" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-outfit font-semibold text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm text-[#71717A]">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
          >
            <span className="text-xs tracking-widest uppercase text-[#00F0FF] font-medium mb-4 block">
              Features
            </span>
            <h2 className="font-outfit text-4xl sm:text-5xl font-light text-white mb-4">
              Everything You Need to{" "}
              <span className="font-semibold">Automate Outreach</span>
            </h2>
            <p className="text-[#A1A1AA] max-w-xl mx-auto text-lg">
              From first call to booked appointment — completely automated.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.5}
                className="glass-card p-6 hover:-translate-y-1 transition-transform duration-200 group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/20 flex items-center justify-center mb-4 group-hover:border-[#00F0FF]/40 transition-colors">
                  <feature.icon className="w-5 h-5 text-[#00F0FF]" />
                </div>
                <h3 className="font-outfit text-white font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-[#71717A] text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section id="use-cases" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
          >
            <span className="text-xs tracking-widest uppercase text-[#00F0FF] font-medium mb-4 block">
              Use Cases
            </span>
            <h2 className="font-outfit text-4xl sm:text-5xl font-light text-white mb-4">
              Built for <span className="font-semibold">High-Stakes</span>{" "}
              Industries
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((uc, i) => (
              <motion.div
                key={uc.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.3}
                className="glass-card p-8 relative overflow-hidden"
                style={{
                  boxShadow: `0 0 40px ${uc.color}08`,
                }}
              >
                <div
                  className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 blur-3xl"
                  style={{ background: uc.color }}
                />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        background: `${uc.color}15`,
                        border: `1px solid ${uc.color}30`,
                      }}
                    >
                      <uc.icon
                        className="w-5 h-5"
                        style={{ color: uc.color }}
                      />
                    </div>
                    <Badge
                      variant="default"
                      style={{
                        borderColor: `${uc.color}30`,
                        background: `${uc.color}10`,
                        color: uc.color,
                      }}
                    >
                      {uc.tag}
                    </Badge>
                  </div>
                  <h3 className="font-outfit text-2xl font-semibold text-white mb-3">
                    {uc.title}
                  </h3>
                  <p className="text-[#A1A1AA] mb-6 leading-relaxed">
                    {uc.description}
                  </p>
                  <div className="flex gap-8">
                    {uc.stats.map((stat) => (
                      <div key={stat.label}>
                        <div
                          className="text-2xl font-outfit font-semibold"
                          style={{ color: uc.color }}
                        >
                          {stat.value}
                        </div>
                        <div className="text-xs text-[#71717A]">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
          >
            <span className="text-xs tracking-widest uppercase text-[#00F0FF] font-medium mb-4 block">
              How It Works
            </span>
            <h2 className="font-outfit text-4xl sm:text-5xl font-light text-white mb-4">
              From Zero to{" "}
              <span className="font-semibold">Booked Appointments</span>
              <br />
              in 3 Steps
            </h2>
          </motion.div>

          <div className="space-y-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.3}
                className="glass-card p-6 flex items-start gap-6 group hover:border-white/20 transition-colors"
              >
                <div
                  className="text-4xl font-outfit font-light shrink-0"
                  style={{ color: "rgba(0,240,255,0.3)" }}
                >
                  {step.step}
                </div>
                <div>
                  <h3 className="font-outfit text-xl font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[#A1A1AA] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
          >
            <span className="text-xs tracking-widest uppercase text-[#00F0FF] font-medium mb-4 block">
              Social Proof
            </span>
            <h2 className="font-outfit text-4xl sm:text-5xl font-light text-white mb-4">
              Trusted by{" "}
              <span className="font-semibold">Growth-Focused Teams</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.2}
                className="glass-card p-6"
              >
                <div className="flex mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
                <p className="text-[#A1A1AA] text-sm leading-relaxed mb-4">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#00F0FF]/20 border border-[#00F0FF]/30 flex items-center justify-center text-xs font-semibold text-[#00F0FF]">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {t.name}
                    </div>
                    <div className="text-xs text-[#71717A]">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
          >
            <span className="text-xs tracking-widest uppercase text-[#00F0FF] font-medium mb-4 block">
              Pricing
            </span>
            <h2 className="font-outfit text-4xl sm:text-5xl font-light text-white mb-4">
              Simple, Scalable{" "}
              <span className="font-semibold">Pricing</span>
            </h2>
            <p className="text-[#A1A1AA] text-lg">
              Start free. Scale as you grow. No hidden fees.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pricing.map((plan, i) => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.15}
                className={`glass-card p-8 relative transition-all duration-200 ${
                  plan.popular
                    ? "border-[#00F0FF]/40 shadow-[0_0_30px_rgba(0,240,255,0.1)]"
                    : "hover:border-white/20"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 text-xs font-semibold bg-[#00F0FF] text-black rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-outfit text-xl font-semibold text-white mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-[#71717A] text-sm mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="font-outfit text-4xl font-semibold text-white">
                      {plan.price}
                    </span>
                    <span className="text-[#71717A] text-sm">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[#A1A1AA]">
                      <CheckCircle2 className="w-4 h-4 text-[#00F0FF] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup" data-testid={`pricing-cta-${plan.name.toLowerCase()}`}>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "secondary"}
                    size="lg"
                  >
                    {plan.cta}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            className="glass-card p-12 relative overflow-hidden"
            style={{
              background:
                "radial-gradient(circle at 50% 0%, rgba(0,240,255,0.08), rgba(18,18,20,1) 60%)",
            }}
          >
            <div
              className="absolute inset-0 opacity-5"
              style={{
                background:
                  "radial-gradient(circle at 50% -20%, rgba(0,240,255,0.6), transparent 60%)",
              }}
            />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-7 h-7 text-[#00F0FF]" />
              </div>
              <h2 className="font-outfit text-4xl sm:text-5xl font-light text-white mb-4">
                Ready to{" "}
                <span className="font-semibold">Scale Your Calls?</span>
              </h2>
              <p className="text-[#A1A1AA] text-lg mb-8">
                Join hundreds of businesses automating their outreach with
                Manolle AI. Start free, no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <Button size="xl" className="gap-2 font-semibold" data-testid="cta-signup-btn">
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <p className="text-[#71717A] text-sm mt-4">
                14-day free trial. No credit card required.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-[#00F0FF]" />
                </div>
                <span
                  className="font-outfit font-semibold text-white"
                  style={{ textShadow: "0 0 15px rgba(0,240,255,0.4)" }}
                >
                  Manolle AI
                </span>
              </div>
              <p className="text-[#71717A] text-sm max-w-xs">
                AI voice agents for modern sales teams. Automate calls, qualify
                leads, book appointments.
              </p>
            </div>
            <div className="flex gap-12">
              <div>
                <h4 className="text-xs font-semibold text-[#71717A] uppercase tracking-wider mb-3">
                  Product
                </h4>
                <ul className="space-y-2 text-sm text-[#A1A1AA]">
                  <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                  <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                  <li><Link href="#use-cases" className="hover:text-white transition-colors">Use Cases</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[#71717A] uppercase tracking-wider mb-3">
                  Company
                </h4>
                <ul className="space-y-2 text-sm text-[#A1A1AA]">
                  <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[#71717A] text-sm">
              © {new Date().getFullYear()} Manolle AI. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm text-[#71717A]">
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

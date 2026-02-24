"use client";

import Link from "next/link";
import {
  BarChart3,
  Globe,
  Lightbulb,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Zap,
  Clock,
  ArrowRight,
  Activity,
  Target,
  Users,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const revenueData = [
  { month: "Jan", revenue: 42000, optimized: 48000 },
  { month: "Feb", revenue: 45000, optimized: 53000 },
  { month: "Mar", revenue: 48000, optimized: 59000 },
  { month: "Apr", revenue: 47000, optimized: 62000 },
  { month: "May", revenue: 51000, optimized: 68000 },
  { month: "Jun", revenue: 54000, optimized: 74000 },
  { month: "Jul", revenue: 58000, optimized: 82000 },
  { month: "Aug", revenue: 62000, optimized: 89000 },
];

const sourceData = [
  { name: "Direct Sales", value: 42 },
  { name: "Subscriptions", value: 28 },
  { name: "Partnerships", value: 18 },
  { name: "Other", value: 12 },
];
const COLORS = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b"];

const recentActivity = [
  { action: "Revenue Analysis", result: "+$34K opportunity found", time: "2 min ago", icon: BarChart3 },
  { action: "Market Scan", result: "3 new markets identified", time: "15 min ago", icon: Globe },
  { action: "Idea Generated", result: "AI Content Engine (92% score)", time: "1 hr ago", icon: Lightbulb },
  { action: "Pricing Updated", result: "+22% margin improvement", time: "3 hrs ago", icon: DollarSign },
];

const tools = [
  { name: "Revenue Analyzer", icon: BarChart3, href: "/tools/revenue-analyzer", color: "from-indigo-500 to-purple-500", desc: "Analyze revenue streams" },
  { name: "Market Finder", icon: Globe, href: "/tools/market-finder", color: "from-cyan-500 to-blue-500", desc: "Discover opportunities" },
  { name: "Idea Generator", icon: Lightbulb, href: "/tools/idea-generator", color: "from-amber-500 to-orange-500", desc: "Generate business ideas" },
  { name: "Pricing Optimizer", icon: DollarSign, href: "/tools/pricing-optimizer", color: "from-emerald-500 to-teal-500", desc: "Optimize your pricing" },
];

export default function Dashboard() {
  return (
    <div className="pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">
            Revenue Command Center
          </h1>
          <p className="text-slate-400">
            Your AI-powered overview of revenue opportunities and growth metrics.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Monthly Revenue", value: "$62,400", change: "+12.3%", icon: DollarSign, color: "text-success" },
            { label: "Opportunities Found", value: "23", change: "+5 new", icon: Target, color: "text-primary-light" },
            { label: "Revenue Unlocked", value: "$184K", change: "This quarter", icon: TrendingUp, color: "text-accent" },
            { label: "Active Analyses", value: "7", change: "Running", icon: Activity, color: "text-warning" },
          ].map((kpi) => (
            <div key={kpi.label} className="card">
              <div className="flex items-center justify-between mb-3">
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                <span className="text-xs text-success flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  {kpi.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-white">{kpi.value}</div>
              <div className="text-xs text-slate-400 mt-1">{kpi.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="card lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-light" />
                Revenue Trajectory
              </h3>
              <div className="flex gap-2">
                {["6M", "1Y", "All"].map((t) => (
                  <button key={t} className={`px-3 py-1 rounded-lg text-xs ${t === "1Y" ? "bg-primary/20 text-primary-light" : "text-slate-500 hover:text-slate-300"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip
                    contentStyle={{ background: "#1e293b", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "0.75rem" }}
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#64748b" fill="rgba(100,116,139,0.1)" strokeWidth={2} name="Actual" />
                  <Area type="monotone" dataKey="optimized" stroke="#6366f1" fill="url(#dashGradient)" strokeWidth={2} strokeDasharray="5 5" name="AI Optimized" />
                  <defs>
                    <linearGradient id="dashGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Sources */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" />
              Revenue Sources
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {sourceData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#1e293b", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "0.75rem" }}
                    formatter={(value) => [`${value}%`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {sourceData.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                    <span className="text-slate-400">{s.name}</span>
                  </div>
                  <span className="text-white font-medium">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-warning" />
              AI Tools
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {tools.map((tool) => (
                <Link key={tool.name} href={tool.href} className="card group cursor-pointer !p-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <tool.icon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-primary-light transition-colors">
                    {tool.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">{tool.desc}</p>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-primary-light mt-2 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-light" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {recentActivity.map((item, i) => (
                <div key={i} className="card !p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-primary-light" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white">{item.action}</div>
                    <div className="text-xs text-slate-400 truncate">{item.result}</div>
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

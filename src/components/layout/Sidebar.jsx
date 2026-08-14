import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  FileText,
  PoundSterling,
  CreditCard,
  ClipboardCheck,
  FileSignature,
  Shield,
  ChevronLeft,
  ChevronRight,
  Heart,
  Package,
  BarChart2,
  Calculator,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import { useQuery } from "@tanstack/react-query";
//import { base44 } from "@/api/base44Client";
import { isPast, parseISO } from "date-fns";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  function getCases() {}
  function getBudget() {}
  function getPlans() {}

  function getReviews() {}

  const { data: cases = [] } = useQuery({
    queryKey: ["cases"],
    queryFn: () => getCases(), // base44.entities.PHBCase.list("-created_date", 100),
  });
  const { data: budgets = [] } = useQuery({
    queryKey: ["budgets"],
    queryFn: () => getCases(), //base44.entities.Budget.list("-created_date", 100),
  });
  const { data: plans = [] } = useQuery({
    queryKey: ["carePlans"],
    queryFn: () => getCases(),
  });
  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews"],
    queryFn: () => getCases(), //base44.entities.Review.list("-created_date", 50),
  });

  const overdueReviews = cases.filter(
    (c) =>
      c.next_review_date &&
      isPast(parseISO(c.next_review_date)) &&
      c.status === "Active",
  ).length;
  const urgentCases = cases.filter(
    (c) => c.priority === "Urgent" && c.status !== "Closed",
  ).length;
  const pendingApprovals =
    plans.filter((p) => p.status === "Submitted" || p.status === "Under Review")
      .length +
    budgets.filter(
      (b) => b.status === "Submitted" || b.status === "Under Review",
    ).length;
  const scheduledReviews = reviews.filter(
    (r) => r.status === "Scheduled",
  ).length;
  const overspentBudgets = budgets.filter(
    (b) => b.approved_amount > 0 && (b.spent_amount || 0) > b.approved_amount,
  ).length;

  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  // iChord-style sidebar sections with alert counters
  const workflowItems = [
    { label: "Dashboard", path: "/", icon: LayoutDashboard },
    {
      label: "PHB Cases",
      path: "/cases",
      icon: FolderOpen,
      count: urgentCases,
      countColor: "bg-red-600",
    },
    { label: "Patients", path: "/patients", icon: Users },
  ];

  const clinicalItems = [
    {
      label: "Care Plans",
      path: "/care-plans",
      icon: FileText,
      count: pendingApprovals,
      countColor: "bg-amber-500",
    },
    {
      label: "Reviews",
      path: "/reviews",
      icon: ClipboardCheck,
      count: overdueReviews,
      countColor: "bg-red-600",
    },
  ];

  const financialItems = [
    {
      label: "Budgets",
      path: "/budgets",
      icon: PoundSterling,
      count: overspentBudgets,
      countColor: "bg-red-600",
    },
    { label: "Payments", path: "/payments", icon: CreditCard },
    { label: "Care Packages", path: "/care-packages", icon: Package },
    { label: "Contracts", path: "/contracts", icon: FileSignature },
    { label: "Budget Calc", path: "/indicative-budget", icon: Calculator },
  ];

  const adminItems = [
    { label: "Reports", path: "/reports", icon: BarChart2 },
    { label: "Audit Log", path: "/audit-log", icon: Shield },
  ];

  const SidebarSection = ({ title, items, badgeColor }) => (
    <div>
      {!collapsed && (
        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-primary/90 flex items-center justify-between">
          <span>{title}</span>
        </div>
      )}
      {items.map((item) => {
        const active = isActive(item.path);
        return (
          <Link
            key={item.path}
            to={item.path}
            title={item.label}
            className={cn(
              "flex items-center justify-between px-2 py-1.5 text-[12px] transition-colors border-b border-sidebar-border/30 bg-white text-black",
              active && "bg-primary text-white font-semibold",
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              <item.icon className="w-3.5 h-3.5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </div>
            {!collapsed && item.count > 0 && (
              <span
                className={cn(
                  "text-[10px] font-bold text-white rounded px-1.5 py-0.5 min-w-[20px] text-center shrink-0",
                  item.countColor || "bg-red-600",
                )}
              >
                {item.count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border z-40 transition-all duration-200 flex flex-col",
        collapsed ? "w-12" : "w-48",
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 h-10 bg-sidebar-accent/60 border-b border-sidebar-border shrink-0">
        <Heart className="w-4 h-4 text-primary shrink-0" />
        {!collapsed && (
          <span className="text-xs font-bold text-white tracking-tight">
            QA360 PHB
          </span>
        )}
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto">
        {!collapsed && (
          <div className="bg-primary/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            Workflow
          </div>
        )}
        <SidebarSection items={workflowItems} />

        {!collapsed && (
          <div className="bg-primary/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white mt-0.5">
            Clinical
          </div>
        )}
        <SidebarSection items={clinicalItems} />

        {!collapsed && (
          <div className="bg-primary/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white mt-0.5">
            Finance
          </div>
        )}
        <SidebarSection items={financialItems} />

        {!collapsed && (
          <div className="bg-primary/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white mt-0.5">
            Admin
          </div>
        )}
        <SidebarSection items={adminItems} />
      </nav>

      {/* User */}
      {!collapsed && user && (
        <div className="px-2 py-1.5 border-t border-sidebar-border bg-sidebar-accent/40">
          <p className="text-[11px] text-white font-medium truncate">
            {user.full_name || user.email}
          </p>
          <p className="text-[10px] text-sidebar-foreground/60 capitalize">
            {user.role || "user"}
          </p>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-8 border-t border-sidebar-border text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-white transition-colors shrink-0"
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>
    </aside>
  );
}

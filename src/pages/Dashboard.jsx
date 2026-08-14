import React from "react";
// import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  FolderOpen,
  PoundSterling,
  ClipboardCheck,
  AlertTriangle,
  Clock,
  TrendingUp,
  Plus,
  FileText,
  CheckCircle,
  ArrowRight,
  Info,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import WorkflowPipeline from "@/components/dashboard/WorkflowPipeline";
import RecentActivity from "@/components/dashboard/RecentActivity";
import StatusBadge from "@/components/shared/StatusBadge";
import { isPast, parseISO, format, isWithinInterval, addDays } from "date-fns";
import { useAuth } from "@/lib/AuthContext";

function SectionHeader({ children }) {
  return (
    <div className="bg-primary text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 mb-0">
      {children}
    </div>
  );
}

function AlertRow({ type, message, link }) {
  const styles = {
    error: "bg-red-50 border-red-300 text-red-800",
    warning: "bg-amber-50 border-amber-300 text-amber-800",
    info: "bg-blue-50 border-blue-300 text-blue-800",
  };
  return (
    <Link to={link}>
      <div
        className={`flex items-center gap-2 px-3 py-1.5 border-b text-[12px] cursor-pointer hover:opacity-80 ${styles[type]}`}
      >
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        <span className="flex-1">{message}</span>
        <ChevronRight className="w-3 h-3 shrink-0 opacity-50" />
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const today = new Date();

  const { data: patients = [] } = useQuery({
    queryKey: ["patients"],
    queryFn: () => base44.entities.Patient.list("-created_date", 100),
  });
  const { data: cases = [], isLoading: casesLoading } = useQuery({
    queryKey: ["cases"],
    queryFn: () => base44.entities.PHBCase.list("-created_date", 100),
  });
  const { data: budgets = [] } = useQuery({
    queryKey: ["budgets"],
    queryFn: () => base44.entities.Budget.list("-created_date", 100),
  });
  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews"],
    queryFn: () => base44.entities.Review.list("-created_date", 50),
  });
  const { data: plans = [] } = useQuery({
    queryKey: ["carePlans"],
    queryFn: () => base44.entities.CarePlan.list("-created_date", 50),
  });

  const activeCases = cases.filter((c) => c.status === "Active").length;
  const totalBudget = budgets.reduce(
    (sum, b) => sum + (b.approved_amount || b.indicative_amount || 0),
    0,
  );
  const pendingReviews = reviews.filter((r) => r.status === "Scheduled").length;
  const plansAwaitingApproval = plans.filter(
    (p) => p.status === "Submitted" || p.status === "Under Review",
  );
  const budgetsAwaitingApproval = budgets.filter(
    (b) => b.status === "Submitted" || b.status === "Under Review",
  );

  const overdueReviews = cases.filter(
    (c) =>
      c.next_review_date &&
      isPast(parseISO(c.next_review_date)) &&
      c.status === "Active",
  );
  const overspentBudgets = budgets.filter(
    (b) => b.approved_amount > 0 && (b.spent_amount || 0) > b.approved_amount,
  );
  const urgentCases = cases.filter(
    (c) => c.priority === "Urgent" && c.status !== "Closed",
  );
  const reviewsDueSoon = reviews.filter((r) => {
    if (r.status !== "Scheduled" || !r.review_date) return false;
    const d = parseISO(r.review_date);
    return isWithinInterval(d, { start: today, end: addDays(today, 7) });
  });

  const alerts = [
    ...overspentBudgets.map((b) => ({
      type: "error",
      message: `Budget overspent: ${b.patient_name}`,
      link: "/budgets",
    })),
    ...overdueReviews.map((c) => ({
      type: "error",
      message: `Overdue review: ${c.patient_name} (${c.case_reference || "no ref"})`,
      link: "/cases",
    })),
    ...urgentCases.map((c) => ({
      type: "warning",
      message: `Urgent case: ${c.patient_name} — ${c.status}`,
      link: "/cases",
    })),
    ...plansAwaitingApproval.map((p) => ({
      type: "info",
      message: `Care plan awaiting approval: ${p.patient_name} v${p.version}`,
      link: "/care-plans",
    })),
    ...reviewsDueSoon
      .slice(0, 2)
      .map((r) => ({
        type: "info",
        message: `Review due soon: ${r.patient_name} on ${format(parseISO(r.review_date), "dd/MM/yyyy")}`,
        link: "/reviews",
      })),
  ].slice(0, 8);

  const pendingApprovals = [
    ...plansAwaitingApproval.map((p) => ({
      label: p.patient_name,
      sub: `Care Plan v${p.version}`,
      link: "/care-plans",
      type: "Care Plan",
    })),
    ...budgetsAwaitingApproval.map((b) => ({
      label: b.patient_name,
      sub: `£${(b.indicative_amount || 0).toLocaleString()} — ${b.status}`,
      link: "/budgets",
      type: "Budget",
    })),
  ];

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-bold text-foreground">
            {format(today, "EEEE, d MMMM yyyy")}
            {user?.full_name ? ` — ${user.full_name}` : ""}
          </h2>
          <p className="text-[12px] text-muted-foreground">
            {activeCases} active {activeCases === 1 ? "case" : "cases"} ·{" "}
            {alerts.length > 0 ? (
              <span className="text-red-600 font-medium">
                {alerts.length} alert{alerts.length > 1 ? "s" : ""} need
                attention
              </span>
            ) : (
              <span className="text-emerald-600">No urgent alerts</span>
            )}
          </p>
        </div>
        <Link to="/cases">
          <button className="bg-primary hover:bg-primary/90 text-white text-[12px] font-semibold px-3 h-7 rounded-sm flex items-center gap-1.5 transition-colors">
            <Plus className="w-3.5 h-3.5" /> New Case
          </button>
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {[
          {
            label: "Total Patients",
            value: patients.length,
            sub: `${patients.filter((p) => p.status === "Active").length} active`,
            link: "/patients",
            icon: Users,
          },
          {
            label: "Active Cases",
            value: activeCases,
            sub: `${cases.length} total`,
            link: "/cases",
            icon: FolderOpen,
          },
          {
            label: "Total Budget",
            value: `£${totalBudget >= 1000 ? `${(totalBudget / 1000).toFixed(0)}k` : totalBudget.toLocaleString()}`,
            sub: `${budgets.filter((b) => ["Approved", "Active"].includes(b.status)).length} approved`,
            link: "/budgets",
            icon: PoundSterling,
          },
          {
            label: "Pending Reviews",
            value: pendingReviews,
            sub:
              overdueReviews.length > 0
                ? `${overdueReviews.length} overdue`
                : "None overdue",
            link: "/reviews",
            icon: ClipboardCheck,
            overdueCount: overdueReviews.length,
          },
        ].map((s) => (
          <Link key={s.label} to={s.link}>
            <div className="bg-white border border-border hover:border-primary/50 transition-colors p-3 rounded-sm flex items-start gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center shrink-0">
                <s.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                  {s.label}
                </p>
                <p className="text-lg font-bold text-foreground leading-tight">
                  {s.value}
                </p>
                <p
                  className={`text-[11px] ${s.overdueCount > 0 ? "text-red-600 font-semibold" : "text-muted-foreground"}`}
                >
                  {s.sub}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="border border-border rounded-sm overflow-hidden">
          <SectionHeader>
            ⚠ Alerts & Actions Required ({alerts.length})
          </SectionHeader>
          <div>
            {alerts.map((a, i) => (
              <AlertRow key={i} {...a} />
            ))}
          </div>
        </div>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Pipeline */}
        <div className="lg:col-span-2 bg-white border border-border rounded-sm overflow-hidden">
          <SectionHeader>PHB Lifecycle Pipeline</SectionHeader>
          <div className="p-3">
            <WorkflowPipeline cases={cases} />
          </div>
        </div>

        {/* Pending approvals */}
        <div className="bg-white border border-border rounded-sm overflow-hidden">
          <SectionHeader>
            <span className="flex items-center justify-between">
              <span>Pending Approvals</span>
              {pendingApprovals.length > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0 rounded-sm">
                  {pendingApprovals.length}
                </span>
              )}
            </span>
          </SectionHeader>
          <div>
            {pendingApprovals.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                <p className="text-[12px] text-muted-foreground">
                  Nothing to approve
                </p>
              </div>
            ) : (
              pendingApprovals.slice(0, 7).map((item, i) => (
                <Link key={i} to={item.link}>
                  <div
                    className={`flex items-center gap-2 px-3 py-2 border-b border-border/50 hover:bg-blue-50/30 cursor-pointer ${i % 2 === 0 ? "bg-white" : "bg-blue-50/20"}`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium truncate">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {item.sub}
                      </p>
                    </div>
                    <span className="text-[10px] border border-border px-1 py-0 text-muted-foreground rounded-sm shrink-0">
                      {item.type}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Recent cases */}
        <div className="lg:col-span-2">
          <RecentActivity cases={cases} isLoading={casesLoading} />
        </div>

        {/* Right column: reviews + priorities */}
        <div className="space-y-3">
          <div className="bg-white border border-border rounded-sm overflow-hidden">
            <SectionHeader>Upcoming Reviews</SectionHeader>
            {reviews.filter((r) => r.status === "Scheduled").slice(0, 5)
              .length === 0 ? (
              <p className="text-[12px] text-muted-foreground px-3 py-3">
                No scheduled reviews
              </p>
            ) : (
              reviews
                .filter((r) => r.status === "Scheduled")
                .slice(0, 5)
                .map((r, i) => (
                  <div
                    key={r.id}
                    className={`flex items-center justify-between px-3 py-1.5 border-b border-border/50 text-[12px] ${i % 2 === 0 ? "bg-white" : "bg-blue-50/20"}`}
                  >
                    <span className="font-medium truncate">
                      {r.patient_name}
                    </span>
                    <span className="text-muted-foreground ml-2 shrink-0">
                      {r.review_date
                        ? format(new Date(r.review_date), "dd/MM/yy")
                        : "TBC"}
                    </span>
                  </div>
                ))
            )}
          </div>

          <div className="bg-white border border-border rounded-sm overflow-hidden">
            <SectionHeader>Cases by Priority</SectionHeader>
            {["Urgent", "High", "Medium", "Low"].map((p, i) => {
              const count = cases.filter(
                (c) => c.priority === p && c.status !== "Closed",
              ).length;
              return (
                <div
                  key={p}
                  className={`flex items-center justify-between px-3 py-1.5 border-b border-border/50 ${i % 2 === 0 ? "bg-white" : "bg-blue-50/20"}`}
                >
                  <StatusBadge status={p} />
                  <span className="text-[12px] font-bold">{count}</span>
                </div>
              );
            })}
          </div>

          {/* Quick actions */}
          <div className="bg-white border border-border rounded-sm overflow-hidden">
            <SectionHeader>Quick Actions</SectionHeader>
            {[
              { label: "Create PHB Case", to: "/cases", icon: Plus },
              { label: "Build Care Plan", to: "/care-plans", icon: FileText },
              { label: "Approve Budget", to: "/budgets", icon: CheckCircle },
            ].map((a, i) => (
              <Link key={a.label} to={a.to}>
                <div
                  className={`flex items-center gap-2 px-3 py-2 border-b border-border/50 hover:bg-primary/5 cursor-pointer text-[12px] transition-colors ${i % 2 === 0 ? "bg-white" : "bg-blue-50/20"}`}
                >
                  <a.icon className="w-3.5 h-3.5 text-primary" />
                  <span className="text-primary font-medium">{a.label}</span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground ml-auto" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

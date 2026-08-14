import React from "react";
import StatusBadge from "@/components/shared/StatusBadge";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function RecentActivity({ cases, isLoading }) {
  const recentCases = (cases || []).slice(0, 10);

  return (
    <div className="bg-white border border-border rounded-sm overflow-hidden">
      <div className="bg-primary text-white flex items-center justify-between px-3 py-1">
        <span className="text-[11px] font-bold uppercase tracking-wider">Recent Cases</span>
        <Link to="/cases">
          <button className="text-[11px] text-white/80 hover:text-white flex items-center gap-1 transition-colors">
            View all <ArrowRight className="w-3 h-3" />
          </button>
        </Link>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-12 bg-blue-700/90 text-white text-[11px] font-semibold px-3 py-1 border-b border-blue-600">
        <div className="col-span-3">Patient</div>
        <div className="col-span-2">Reference</div>
        <div className="col-span-3">Category</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Date</div>
      </div>

      {isLoading ? (
        <div className="p-3 text-[12px] text-muted-foreground">Loading...</div>
      ) : recentCases.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-[12px] text-muted-foreground">No cases yet</p>
          <Link to="/cases">
            <button className="mt-2 bg-primary text-white text-[11px] px-3 h-6 rounded-sm hover:bg-primary/90 transition-colors">
              Create first case
            </button>
          </Link>
        </div>
      ) : (
        recentCases.map((c, i) => (
          <Link key={c.id} to="/cases">
            <div className={`grid grid-cols-12 px-3 py-1.5 border-b border-border/50 hover:bg-primary/5 cursor-pointer transition-colors text-[12px] ${i % 2 === 0 ? "bg-white" : "bg-blue-50/25"}`}>
              <div className="col-span-3 font-medium truncate pr-2">{c.patient_name}</div>
              <div className="col-span-2 text-muted-foreground truncate pr-2">{c.case_reference || "—"}</div>
              <div className="col-span-3 text-muted-foreground truncate pr-2">{c.eligibility_category || "—"}</div>
              <div className="col-span-2"><StatusBadge status={c.status} /></div>
              <div className="col-span-2 text-muted-foreground">{c.referral_date ? format(new Date(c.referral_date), "dd/MM/yy") : "—"}</div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
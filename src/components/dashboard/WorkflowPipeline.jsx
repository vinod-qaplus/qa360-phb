import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const stages = [
  { key: "Referral",     color: "bg-blue-500",   bar: "bg-blue-500" },
  { key: "Assessment",   color: "bg-amber-500",   bar: "bg-amber-500" },
  { key: "Care Planning",color: "bg-purple-500",  bar: "bg-purple-500" },
  { key: "Approval",     color: "bg-orange-500",  bar: "bg-orange-500" },
  { key: "Active",       color: "bg-emerald-500", bar: "bg-emerald-500" },
  { key: "Under Review", color: "bg-cyan-600",    bar: "bg-cyan-600" },
];

export default function WorkflowPipeline({ cases }) {
  const counts = {};
  stages.forEach(s => counts[s.key] = 0);
  (cases || []).forEach(c => {
    if (counts[c.status] !== undefined) counts[c.status]++;
  });

  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="flex h-4 rounded-sm overflow-hidden gap-px bg-border">
        {stages.map(stage => {
          const pct = (counts[stage.key] / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={stage.key}
              className={cn("h-full transition-all duration-500", stage.bar)}
              style={{ width: `${pct}%` }}
              title={`${stage.key}: ${counts[stage.key]}`}
            />
          );
        })}
      </div>

      {/* Stage counts — iChord style grid */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-1">
        {stages.map(stage => (
          <Link key={stage.key} to="/cases">
            <div className="border border-border bg-white hover:border-primary/40 hover:bg-blue-50/30 transition-colors text-center p-2 rounded-sm cursor-pointer">
              <div className={cn("w-2 h-2 rounded-full mx-auto mb-1", stage.color)} />
              <p className="text-lg font-bold leading-tight">{counts[stage.key]}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{stage.key}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
import React from "react";
import { cn } from "@/lib/utils";

export default function StatCard({ label, value, icon: Icon, trendLabel, className, onClick }) {
  return (
    <div
      className={cn(
        "bg-white border border-border rounded-sm p-3 flex items-start gap-3",
        onClick && "cursor-pointer hover:border-primary/50 hover:bg-blue-50/30 transition-colors",
        className
      )}
      onClick={onClick}
    >
      {Icon && (
        <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-primary" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
        <p className="text-xl font-bold text-foreground leading-tight">{value}</p>
        {trendLabel && <p className="text-[11px] text-muted-foreground mt-0.5">{trendLabel}</p>}
      </div>
    </div>
  );
}
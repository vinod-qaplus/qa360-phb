import React from "react";
import { cn } from "@/lib/utils";

// iChord style: small, flat, bordered badges — minimal radius
const statusStyles = {
  // PHB Case statuses
  "Referral": "bg-blue-100 text-blue-800 border-blue-300",
  "Assessment": "bg-amber-100 text-amber-800 border-amber-300",
  "Care Planning": "bg-purple-100 text-purple-800 border-purple-300",
  "Approval": "bg-orange-100 text-orange-800 border-orange-300",
  "Active": "bg-emerald-100 text-emerald-800 border-emerald-300",
  "Under Review": "bg-cyan-100 text-cyan-800 border-cyan-300",
  "Suspended": "bg-red-100 text-red-800 border-red-300",
  "Closed": "bg-gray-100 text-gray-600 border-gray-300",
  "Draft": "bg-gray-100 text-gray-600 border-gray-300",
  "Submitted": "bg-blue-100 text-blue-800 border-blue-300",
  "Approved": "bg-emerald-100 text-emerald-800 border-emerald-300",
  "Pending": "bg-amber-100 text-amber-800 border-amber-300",
  "Processed": "bg-sky-100 text-sky-800 border-sky-300",
  "Paid": "bg-emerald-100 text-emerald-800 border-emerald-300",
  "Failed": "bg-red-100 text-red-800 border-red-300",
  "Completed": "bg-emerald-100 text-emerald-800 border-emerald-300",
  "Scheduled": "bg-blue-100 text-blue-800 border-blue-300",
  "In Progress": "bg-amber-100 text-amber-800 border-amber-300",
  "Cancelled": "bg-gray-100 text-gray-600 border-gray-300",
  "Expired": "bg-red-100 text-red-800 border-red-300",
  "Overspent": "bg-red-100 text-red-800 border-red-300",
  "On Hold": "bg-orange-100 text-orange-800 border-orange-300",
  "Superseded": "bg-gray-100 text-gray-500 border-gray-300",
  "Archived": "bg-gray-100 text-gray-500 border-gray-300",
  // Priority
  "Low": "bg-gray-100 text-gray-600 border-gray-300",
  "Medium": "bg-blue-100 text-blue-800 border-blue-300",
  "High": "bg-orange-100 text-orange-800 border-orange-300",
  "Urgent": "bg-red-600 text-white border-red-700",
  // Eligibility
  "Eligible": "bg-emerald-100 text-emerald-800 border-emerald-300",
  "Not Eligible": "bg-red-100 text-red-800 border-red-300",
  "Pending Assessment": "bg-amber-100 text-amber-800 border-amber-300",
};

export default function StatusBadge({ status, className }) {
  if (!status) return null;
  const style = statusStyles[status] || "bg-gray-100 text-gray-600 border-gray-300";
  return (
    <span className={cn(
      "inline-flex items-center border px-1.5 py-0 text-[11px] font-medium rounded-sm leading-5",
      style, className
    )}>
      {status}
    </span>
  );
}
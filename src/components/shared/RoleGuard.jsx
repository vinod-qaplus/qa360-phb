import React from "react";
import { Lock } from "lucide-react";
import { useRoleGuard } from "@/hooks/useRoleGuard";

/**
 * Wrap sensitive UI sections with <RoleGuard require="canApprove">.
 * Shows a lock placeholder if the user lacks the required permission.
 */
export default function RoleGuard({ require, fallback, children }) {
  const guards = useRoleGuard();
  const hasAccess = guards[require] === true;

  if (hasAccess) return children;

  if (fallback) return fallback;

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 text-muted-foreground text-sm border border-dashed">
      <Lock className="w-3.5 h-3.5 shrink-0" />
      <span>You don't have permission to access this section.</span>
    </div>
  );
}
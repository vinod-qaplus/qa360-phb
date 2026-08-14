import { useAuth } from "@/lib/AuthContext";

/**
 * Role-based access control hook.
 * Roles in this system: "admin" (full access), "user" (limited access).
 *
 * Usage:
 *   const { canEdit, canApprove, canViewFinancials, isAdmin } = useRoleGuard();
 */
export function useRoleGuard() {
  const { user } = useAuth();
  const role = user?.role || "user";
  const isAdmin = role === "admin";

  return {
    isAdmin,
    // Can create/edit records
    canEdit: isAdmin,
    // Can approve care plans, budgets
    canApprove: isAdmin,
    // Can view financial data (budgets, payments)
    canViewFinancials: isAdmin,
    // Can delete records
    canDelete: isAdmin,
    // Can export data
    canExport: isAdmin,
    // Can view audit logs
    canViewAudit: isAdmin,
    // Convenience: current role label
    role,
  };
}
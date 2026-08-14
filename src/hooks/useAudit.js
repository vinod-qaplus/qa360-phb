import { useCallback } from "react";
// import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

/**
 * Lightweight audit hook — call logAction() after any significant mutation.
 * Writes to AuditLog entity. Fire-and-forget: never blocks the main flow.
 */
export function useAudit() {
  const { user } = useAuth();

  const logAction = useCallback(
    async ({
      action, // "Create" | "Update" | "Delete" | "Approve" | "Status Change" | "Export"
      entityType, // "CarePlan" | "Budget" | "Payment" | etc.
      entityId = null,
      entityReference = null,
      description,
      previousValue = null,
      newValue = null,
    }) => {
      try {
        await base44.entities.AuditLog.create({
          user_email: user?.email || "unknown",
          user_name: user?.full_name || user?.email || "Unknown User",
          user_role: user?.role || "user",
          action,
          entity_type: entityType,
          entity_id: entityId || undefined,
          entity_reference: entityReference || undefined,
          description,
          previous_value: previousValue
            ? JSON.stringify(previousValue)
            : undefined,
          new_value: newValue ? JSON.stringify(newValue) : undefined,
        });
      } catch {
        // Silently fail — audit logging must never break the main workflow
      }
    },
    [user],
  );

  return { logAction };
}

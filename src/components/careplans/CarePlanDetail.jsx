import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatusBadge from "@/components/shared/StatusBadge";
import { Pencil, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

function Field({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

export default function CarePlanDetail({ plan, onEdit, onApprove }) {
  const [approvingEmail, setApprovingEmail] = useState("");
  const [showApproveInput, setShowApproveInput] = useState(false);

  const canApprove = plan.status === "Submitted" || plan.status === "Under Review";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusBadge status={plan.status} />
          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">v{plan.version}</span>
        </div>
        <Button size="sm" variant="outline" onClick={onEdit}><Pencil className="w-3.5 h-3.5 mr-1" />Edit</Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Patient" value={plan.patient_name} />
        <Field label="Consent" value={plan.patient_consent ? "Obtained" + (plan.consent_date ? ` (${format(new Date(plan.consent_date), "dd/MM/yyyy")})` : "") : "Pending"} />
        <Field label="Start Date" value={plan.start_date ? format(new Date(plan.start_date), "dd/MM/yyyy") : null} />
        <Field label="End Date" value={plan.end_date ? format(new Date(plan.end_date), "dd/MM/yyyy") : null} />
        {plan.approved_by && <Field label="Approved By" value={plan.approved_by} />}
        {plan.approval_date && <Field label="Approval Date" value={format(new Date(plan.approval_date), "dd/MM/yyyy")} />}
      </div>

      {plan.primary_needs && (
        <div className="bg-muted/40 rounded-lg p-3">
          <p className="text-xs font-semibold text-muted-foreground mb-1">Primary Needs</p>
          <p className="text-sm">{plan.primary_needs}</p>
        </div>
      )}
      {plan.outcomes && (
        <div className="bg-muted/40 rounded-lg p-3">
          <p className="text-xs font-semibold text-muted-foreground mb-1">Desired Outcomes</p>
          <p className="text-sm">{plan.outcomes}</p>
        </div>
      )}
      {plan.services_required && (
        <div className="bg-muted/40 rounded-lg p-3">
          <p className="text-xs font-semibold text-muted-foreground mb-1">Services Required</p>
          <p className="text-sm">{plan.services_required}</p>
        </div>
      )}
      {plan.risk_assessment && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-amber-700 mb-1">Risk Assessment</p>
          <p className="text-sm text-amber-900">{plan.risk_assessment}</p>
        </div>
      )}
      {plan.safeguarding_notes && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-red-700 mb-1">Safeguarding Notes</p>
          <p className="text-sm text-red-900">{plan.safeguarding_notes}</p>
        </div>
      )}

      {canApprove && (
        <div className="border border-emerald-200 bg-emerald-50 rounded-lg p-3 space-y-2">
          <p className="text-sm font-medium text-emerald-800">Approve this Care Plan</p>
          {!showApproveInput ? (
            <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-700" onClick={() => setShowApproveInput(true)}>
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
            </Button>
          ) : (
            <div className="flex gap-2">
              <Input placeholder="Your email address" value={approvingEmail} onChange={e => setApprovingEmail(e.target.value)} className="text-sm" />
              <Button size="sm" onClick={() => { if (approvingEmail) onApprove(approvingEmail); }} disabled={!approvingEmail}>Confirm</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
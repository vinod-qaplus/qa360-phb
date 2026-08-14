import React from "react";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/shared/StatusBadge";
import { Pencil, ArrowRight } from "lucide-react";
import { format } from "date-fns";

const WORKFLOW = ["Referral", "Assessment", "Care Planning", "Approval", "Active", "Under Review"];

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium mt-0.5">{value || "—"}</p>
    </div>
  );
}

export default function CaseDetail({ caseData, onEdit, onStatusChange }) {
  const currentIndex = WORKFLOW.indexOf(caseData.status);
  const nextStatus = currentIndex >= 0 && currentIndex < WORKFLOW.length - 1 ? WORKFLOW[currentIndex + 1] : null;

  return (
    <div className="space-y-5">
      {/* Workflow Steps */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {WORKFLOW.map((step, i) => {
          const isActive = step === caseData.status;
          const isPast = WORKFLOW.indexOf(caseData.status) > i;
          return (
            <div key={step} className="flex items-center gap-1 shrink-0">
              <div className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                isActive ? "bg-primary text-primary-foreground" :
                isPast ? "bg-emerald-100 text-emerald-700" :
                "bg-muted text-muted-foreground"
              }`}>
                {step}
              </div>
              {i < WORKFLOW.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusBadge status={caseData.status} />
          <StatusBadge status={caseData.priority} />
        </div>
        <div className="flex gap-2">
          {nextStatus && (
            <Button size="sm" onClick={() => onStatusChange(nextStatus)}>
              Advance to {nextStatus} <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Field label="Case Reference" value={caseData.case_reference || `PHB-${caseData.id?.slice(0,6)}`} />
        <Field label="Patient" value={caseData.patient_name} />
        <Field label="NHS Number" value={caseData.patient_nhs_number} />
        <Field label="Category" value={caseData.eligibility_category} />
        <Field label="Referral Date" value={caseData.referral_date ? format(new Date(caseData.referral_date), "dd/MM/yyyy") : null} />
        <Field label="Assessment Date" value={caseData.assessment_date ? format(new Date(caseData.assessment_date), "dd/MM/yyyy") : null} />
        <Field label="Next Review" value={caseData.next_review_date ? format(new Date(caseData.next_review_date), "dd/MM/yyyy") : null} />
        <Field label="Commissioner" value={caseData.assigned_commissioner} />
        <Field label="Clinician" value={caseData.assigned_clinician} />
      </div>

      {caseData.notes && (
        <div className="pt-3 border-t">
          <Field label="Notes" value={caseData.notes} />
        </div>
      )}
    </div>
  );
}
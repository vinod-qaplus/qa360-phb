import React, { useState } from "react";
// import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusBadge from "@/components/shared/StatusBadge";
import {
  Pencil,
  X,
  FileText,
  PoundSterling,
  Package,
  ClipboardCheck,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";

const WORKFLOW = [
  "Referral",
  "Assessment",
  "Care Planning",
  "Approval",
  "Active",
  "Under Review",
];
const NEXT_STATUS = {
  Referral: "Assessment",
  Assessment: "Care Planning",
  "Care Planning": "Approval",
  Approval: "Active",
  Active: "Under Review",
};

function Field({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

function CaseSummary({ caseData, onEdit, onStatusChange }) {
  const idx = WORKFLOW.indexOf(caseData.status);
  const nextStatus = NEXT_STATUS[caseData.status];

  return (
    <div className="space-y-4">
      {/* Workflow progress */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Workflow Progress
        </p>
        <div className="flex items-center gap-1 flex-wrap">
          {WORKFLOW.map((stage, i) => (
            <React.Fragment key={stage}>
              <span
                className={`text-xs px-2 py-1 rounded font-medium ${i <= idx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                {stage}
              </span>
              {i < WORKFLOW.length - 1 && (
                <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
        {nextStatus && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onStatusChange(nextStatus)}
            className="mt-1"
          >
            Advance to {nextStatus}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Case Reference" value={caseData.case_reference} />
        <Field label="NHS Number" value={caseData.patient_nhs_number} />
        <Field
          label="Eligibility Category"
          value={caseData.eligibility_category}
        />
        <Field
          label="Priority"
          value={<StatusBadge status={caseData.priority} />}
        />
        <Field
          label="Referral Date"
          value={
            caseData.referral_date
              ? format(new Date(caseData.referral_date), "dd/MM/yyyy")
              : null
          }
        />
        <Field
          label="Assessment Date"
          value={
            caseData.assessment_date
              ? format(new Date(caseData.assessment_date), "dd/MM/yyyy")
              : null
          }
        />
        <Field
          label="Approval Date"
          value={
            caseData.approval_date
              ? format(new Date(caseData.approval_date), "dd/MM/yyyy")
              : null
          }
        />
        <Field
          label="Active Date"
          value={
            caseData.active_date
              ? format(new Date(caseData.active_date), "dd/MM/yyyy")
              : null
          }
        />
        <Field
          label="Next Review"
          value={
            caseData.next_review_date
              ? format(new Date(caseData.next_review_date), "dd/MM/yyyy")
              : null
          }
        />
        <Field label="Commissioner" value={caseData.assigned_commissioner} />
        <Field label="Clinician" value={caseData.assigned_clinician} />
      </div>
      {caseData.notes && (
        <div className="bg-muted/40 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Notes</p>
          <p className="text-sm">{caseData.notes}</p>
        </div>
      )}
    </div>
  );
}

function CarePlansTab({ caseId }) {
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["carePlans", caseId],
    queryFn: () => base44.entities.CarePlan.filter({ case_id: caseId }),
  });

  if (isLoading)
    return <div className="text-sm text-muted-foreground py-4">Loading...</div>;
  if (!plans.length)
    return (
      <div className="text-sm text-muted-foreground py-6 text-center">
        No care plans linked to this case.
      </div>
    );

  return (
    <div className="space-y-3">
      {plans.map((plan) => (
        <Card key={plan.id} className="border-l-4 border-l-primary">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">
                Care Plan v{plan.version}
              </CardTitle>
              <StatusBadge status={plan.status} />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3 space-y-2">
            {plan.primary_needs && (
              <div>
                <p className="text-xs text-muted-foreground">Primary Needs</p>
                <p className="text-sm">{plan.primary_needs}</p>
              </div>
            )}
            {plan.outcomes && (
              <div>
                <p className="text-xs text-muted-foreground">Outcomes</p>
                <p className="text-sm">{plan.outcomes}</p>
              </div>
            )}
            {plan.services_required && (
              <div>
                <p className="text-xs text-muted-foreground">
                  Services Required
                </p>
                <p className="text-sm">{plan.services_required}</p>
              </div>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
              {plan.start_date && (
                <span>
                  Start: {format(new Date(plan.start_date), "dd/MM/yyyy")}
                </span>
              )}
              {plan.end_date && (
                <span>
                  End: {format(new Date(plan.end_date), "dd/MM/yyyy")}
                </span>
              )}
              <span
                className={
                  plan.patient_consent ? "text-emerald-600" : "text-amber-600"
                }
              >
                Consent: {plan.patient_consent ? "Obtained" : "Pending"}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function BudgetsTab({ caseId }) {
  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ["budgets", caseId],
    queryFn: () => base44.entities.Budget.filter({ case_id: caseId }),
  });
  const { data: items = [] } = useQuery({
    queryKey: ["budgetItems", caseId],
    queryFn: () => base44.entities.BudgetItem.filter({ case_id: caseId }),
  });

  if (isLoading)
    return <div className="text-sm text-muted-foreground py-4">Loading...</div>;
  if (!budgets.length)
    return (
      <div className="text-sm text-muted-foreground py-6 text-center">
        No budgets linked to this case.
      </div>
    );

  return (
    <div className="space-y-4">
      {budgets.map((b) => {
        const budgetItems = items.filter((i) => i.budget_id === b.id);
        const pct = b.approved_amount
          ? Math.min(
              100,
              Math.round(((b.spent_amount || 0) / b.approved_amount) * 100),
            )
          : 0;
        return (
          <Card key={b.id}>
            <CardHeader className="pb-2 pt-3 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">
                  Budget — {b.funding_type || "NHS"}
                </CardTitle>
                <StatusBadge status={b.status} />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-3 space-y-3">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-muted/40 rounded p-2">
                  <p className="text-xs text-muted-foreground">Indicative</p>
                  <p className="text-sm font-semibold">
                    £{(b.indicative_amount || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-muted/40 rounded p-2">
                  <p className="text-xs text-muted-foreground">Approved</p>
                  <p className="text-sm font-semibold text-primary">
                    £{(b.approved_amount || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-muted/40 rounded p-2">
                  <p className="text-xs text-muted-foreground">Remaining</p>
                  <p
                    className={`text-sm font-semibold ${(b.remaining_amount || 0) < 0 ? "text-red-600" : "text-emerald-600"}`}
                  >
                    £{(b.remaining_amount || 0).toLocaleString()}
                  </p>
                </div>
              </div>
              {b.approved_amount > 0 && (
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Spent</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )}
              {budgetItems.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">
                    Line Items
                  </p>
                  <div className="space-y-1">
                    {budgetItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs py-1 border-b last:border-0"
                      >
                        <div>
                          <span className="font-medium">
                            {item.description}
                          </span>
                          <span className="text-muted-foreground ml-2">
                            ({item.category})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={item.status} />
                          <span className="font-mono">
                            £{(item.total_cost || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function PackagesTab({ caseId }) {
  const { data: packages = [], isLoading } = useQuery({
    queryKey: ["carePackages", caseId],
    queryFn: () => base44.entities.CarePackage.filter({ case_id: caseId }),
  });

  if (isLoading)
    return <div className="text-sm text-muted-foreground py-4">Loading...</div>;
  if (!packages.length)
    return (
      <div className="text-sm text-muted-foreground py-6 text-center">
        No care packages linked to this case.
      </div>
    );

  return (
    <div className="space-y-3">
      {packages.map((pkg) => (
        <Card key={pkg.id} className="border-l-4 border-l-accent">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{pkg.provider_name}</CardTitle>
              <StatusBadge status={pkg.status} />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3 space-y-1 text-sm">
            <p className="text-muted-foreground text-xs">{pkg.services}</p>
            <div className="flex items-center gap-4 text-xs pt-1">
              {pkg.hours_per_week && <span>{pkg.hours_per_week}h/week</span>}
              {pkg.weekly_cost && (
                <span className="font-mono">
                  £{pkg.weekly_cost.toLocaleString()}/wk
                </span>
              )}
              {pkg.delivery_method && (
                <Badge variant="outline" className="text-xs">
                  {pkg.delivery_method}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ReviewsTab({ caseId }) {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", caseId],
    queryFn: () => base44.entities.Review.filter({ case_id: caseId }),
  });

  if (isLoading)
    return <div className="text-sm text-muted-foreground py-4">Loading...</div>;
  if (!reviews.length)
    return (
      <div className="text-sm text-muted-foreground py-6 text-center">
        No reviews linked to this case.
      </div>
    );

  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <Card key={r.id}>
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">
                {r.review_type} Review —{" "}
                {r.review_date
                  ? format(new Date(r.review_date), "dd/MM/yyyy")
                  : "TBC"}
              </CardTitle>
              <StatusBadge status={r.status} />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3 space-y-2 text-sm">
            {r.outcomes_met && (
              <div className="flex gap-2">
                <span className="text-muted-foreground text-xs">Outcomes:</span>
                <StatusBadge status={r.outcomes_met} />
              </div>
            )}
            {r.patient_satisfaction && (
              <div className="flex gap-2">
                <span className="text-muted-foreground text-xs">
                  Satisfaction:
                </span>
                <span className="text-xs">{r.patient_satisfaction}</span>
              </div>
            )}
            {r.recommendations && (
              <div>
                <p className="text-xs text-muted-foreground">Recommendations</p>
                <p className="text-sm">{r.recommendations}</p>
              </div>
            )}
            {r.action_required && r.action_required !== "No Change" && (
              <div className="bg-amber-50 border border-amber-200 rounded px-3 py-2 text-xs text-amber-700">
                Action Required: <strong>{r.action_required}</strong>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function CaseDetailPanel({
  caseData,
  onEdit,
  onStatusChange,
  onClose,
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between p-5 border-b bg-muted/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{caseData.patient_name}</h2>
            <StatusBadge status={caseData.status} />
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>
              {caseData.case_reference || `PHB-${caseData.id?.slice(0, 6)}`}
            </span>
            {caseData.patient_nhs_number && (
              <>
                <span>·</span>
                <span>NHS: {caseData.patient_nhs_number}</span>
              </>
            )}
            {caseData.eligibility_category && (
              <>
                <span>·</span>
                <span>{caseData.eligibility_category}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Pencil className="w-3.5 h-3.5 mr-1" />
            Edit
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="summary"
        className="flex-1 overflow-hidden flex flex-col"
      >
        <TabsList className="mx-5 mt-4 mb-0 w-fit">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="careplans">
            <FileText className="w-3.5 h-3.5 mr-1" />
            Care Plans
          </TabsTrigger>
          <TabsTrigger value="budgets">
            <PoundSterling className="w-3.5 h-3.5 mr-1" />
            Budgets
          </TabsTrigger>
          <TabsTrigger value="packages">
            <Package className="w-3.5 h-3.5 mr-1" />
            Packages
          </TabsTrigger>
          <TabsTrigger value="reviews">
            <ClipboardCheck className="w-3.5 h-3.5 mr-1" />
            Reviews
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-5 pt-4">
          <TabsContent value="summary" className="mt-0">
            <CaseSummary
              caseData={caseData}
              onEdit={onEdit}
              onStatusChange={onStatusChange}
            />
          </TabsContent>
          <TabsContent value="careplans" className="mt-0">
            <CarePlansTab caseId={caseData.id} />
          </TabsContent>
          <TabsContent value="budgets" className="mt-0">
            <BudgetsTab caseId={caseData.id} />
          </TabsContent>
          <TabsContent value="packages" className="mt-0">
            <PackagesTab caseId={caseData.id} />
          </TabsContent>
          <TabsContent value="reviews" className="mt-0">
            <ReviewsTab caseId={caseData.id} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

import React, { useState } from "react";
// import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatusBadge from "@/components/shared/StatusBadge";
import BudgetItemsEditor from "./BudgetItemsEditor";
import { Pencil, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

function Field({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

export default function BudgetDetail({ budget, onEdit, onApprove }) {
  const [approvingEmail, setApprovingEmail] = useState("");
  const [showApproveInput, setShowApproveInput] = useState(false);

  const canApprove =
    budget.status === "Submitted" || budget.status === "Under Review";
  const pct = budget.approved_amount
    ? Math.min(
        100,
        Math.round(((budget.spent_amount || 0) / budget.approved_amount) * 100),
      )
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusBadge status={budget.status} />
          {budget.funding_type && (
            <span className="text-xs text-muted-foreground">
              {budget.funding_type}
            </span>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={onEdit}>
          <Pencil className="w-3.5 h-3.5 mr-1" />
          Edit
        </Button>
      </div>

      {/* Summary figures */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-muted/40 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Indicative</p>
          <p className="text-lg font-bold">
            £{(budget.indicative_amount || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-primary/5 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Approved</p>
          <p className="text-lg font-bold text-primary">
            £{(budget.approved_amount || 0).toLocaleString()}
          </p>
        </div>
        <div
          className={`rounded-lg p-3 ${(budget.remaining_amount || 0) < 0 ? "bg-red-50" : "bg-emerald-50"}`}
        >
          <p className="text-xs text-muted-foreground">Remaining</p>
          <p
            className={`text-lg font-bold ${(budget.remaining_amount || 0) < 0 ? "text-red-600" : "text-emerald-600"}`}
          >
            £{(budget.remaining_amount || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {budget.approved_amount > 0 && (
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>
              Budget utilisation — £
              {(budget.spent_amount || 0).toLocaleString()} spent
            </span>
            <span>{pct}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all ${pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Details</TabsTrigger>
          <TabsTrigger value="items">Line Items</TabsTrigger>
        </TabsList>
        <TabsContent value="info" className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Patient" value={budget.patient_name} />
            <Field
              label="Period Start"
              value={
                budget.budget_period_start
                  ? format(new Date(budget.budget_period_start), "dd/MM/yyyy")
                  : null
              }
            />
            <Field
              label="Period End"
              value={
                budget.budget_period_end
                  ? format(new Date(budget.budget_period_end), "dd/MM/yyyy")
                  : null
              }
            />
            {budget.approved_by && (
              <Field label="Approved By" value={budget.approved_by} />
            )}
            {budget.approval_date && (
              <Field
                label="Approval Date"
                value={format(new Date(budget.approval_date), "dd/MM/yyyy")}
              />
            )}
          </div>
          {budget.notes && (
            <div className="bg-muted/40 rounded-lg p-3 text-sm">
              {budget.notes}
            </div>
          )}
        </TabsContent>
        <TabsContent value="items" className="pt-2">
          <BudgetItemsEditor budgetId={budget.id} caseId={budget.case_id} />
        </TabsContent>
      </Tabs>

      {canApprove && (
        <div className="border border-emerald-200 bg-emerald-50 rounded-lg p-3 space-y-2">
          <p className="text-sm font-medium text-emerald-800">
            Approve this Budget
          </p>
          {!showApproveInput ? (
            <Button
              size="sm"
              variant="outline"
              className="border-emerald-300 text-emerald-700"
              onClick={() => setShowApproveInput(true)}
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
            </Button>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Your email address"
                value={approvingEmail}
                onChange={(e) => setApprovingEmail(e.target.value)}
                className="text-sm"
              />
              <Button
                size="sm"
                onClick={() => {
                  if (approvingEmail) onApprove(approvingEmail);
                }}
                disabled={!approvingEmail}
              >
                Confirm
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

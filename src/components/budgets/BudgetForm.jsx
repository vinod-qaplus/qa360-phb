import React, { useState } from "react";
// import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BudgetItemsEditor from "./BudgetItemsEditor";

const STATUSES = [
  "Draft",
  "Submitted",
  "Under Review",
  "Approved",
  "Active",
  "Overspent",
  "Closed",
];
const FUNDING_TYPES = ["NHS", "Local Authority", "Mixed", "Joint"];

export default function BudgetForm({ budget, cases, onSubmit, isLoading }) {
  const [form, setForm] = useState({
    status: "Draft",
    indicative_amount: 0,
    approved_amount: 0,
    spent_amount: 0,
    remaining_amount: 0,
    ...budget,
  });

  const set = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleCaseSelect = (caseId) => {
    const c = cases.find((x) => x.id === caseId);
    if (c)
      setForm((prev) => ({
        ...prev,
        case_id: c.id,
        patient_id: c.patient_id,
        patient_name: c.patient_name,
      }));
  };

  const handleNumberChange = (field, raw) => {
    const val = parseFloat(raw) || 0;
    setForm((prev) => {
      const updated = { ...prev, [field]: val };
      if (field === "approved_amount" || field === "spent_amount") {
        updated.remaining_amount =
          (updated.approved_amount || 0) - (updated.spent_amount || 0);
      }
      return updated;
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-4"
    >
      <Tabs defaultValue="details">
        <TabsList className="w-full">
          <TabsTrigger value="details" className="flex-1">
            Budget Details
          </TabsTrigger>
          {budget?.id && (
            <TabsTrigger value="items" className="flex-1">
              Line Items
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="details" className="space-y-4 pt-2">
          <div>
            <Label>PHB Case *</Label>
            <Select value={form.case_id || ""} onValueChange={handleCaseSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select case" />
              </SelectTrigger>
              <SelectContent>
                {cases.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.patient_name} — {c.case_reference || c.id.slice(0, 6)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {form.patient_name && (
            <div className="bg-muted/40 rounded-lg px-3 py-2 text-sm text-muted-foreground">
              Patient:{" "}
              <strong className="text-foreground">{form.patient_name}</strong>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Funding Type</Label>
              <Select
                value={form.funding_type || ""}
                onValueChange={(v) => set("funding_type", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {FUNDING_TYPES.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={form.status || "Draft"}
                onValueChange={(v) => set("status", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Indicative Amount (£) *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.indicative_amount || ""}
                onChange={(e) =>
                  handleNumberChange("indicative_amount", e.target.value)
                }
                required
              />
            </div>
            <div>
              <Label>Approved Amount (£)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.approved_amount || ""}
                onChange={(e) =>
                  handleNumberChange("approved_amount", e.target.value)
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Amount Spent (£)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.spent_amount || ""}
                onChange={(e) =>
                  handleNumberChange("spent_amount", e.target.value)
                }
              />
            </div>
            <div>
              <Label>Remaining (£)</Label>
              <Input
                readOnly
                value={form.remaining_amount?.toFixed(2) || "0.00"}
                className="bg-muted text-muted-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Period Start</Label>
              <Input
                type="date"
                value={form.budget_period_start || ""}
                onChange={(e) => set("budget_period_start", e.target.value)}
              />
            </div>
            <div>
              <Label>Period End</Label>
              <Input
                type="date"
                value={form.budget_period_end || ""}
                onChange={(e) => set("budget_period_end", e.target.value)}
              />
            </div>
          </div>

          {(form.status === "Approved" || form.status === "Active") && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Approved By</Label>
                <Input
                  placeholder="Approver email"
                  value={form.approved_by || ""}
                  onChange={(e) => set("approved_by", e.target.value)}
                />
              </div>
              <div>
                <Label>Approval Date</Label>
                <Input
                  type="date"
                  value={form.approval_date || ""}
                  onChange={(e) => set("approval_date", e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <Label>Notes</Label>
            <Textarea
              value={form.notes || ""}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
            />
          </div>
        </TabsContent>

        {budget?.id && (
          <TabsContent value="items" className="pt-2">
            <BudgetItemsEditor budgetId={budget.id} caseId={budget.case_id} />
          </TabsContent>
        )}
      </Tabs>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isLoading || !form.case_id}>
          {isLoading ? "Saving..." : budget ? "Save Changes" : "Create Budget"}
        </Button>
      </div>
    </form>
  );
}

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PAYMENT_TYPES = ["Direct Payment", "Notional Budget", "Third Party Managed"];
const PAYMENT_METHODS = ["Bank Transfer", "Prepaid Card", "Invoice Payment", "Cheque"];
const PAYEE_TYPES = ["Patient", "Provider", "Personal Assistant", "Third Party Organisation"];
const STATUSES = ["Pending", "Approved", "Processed", "Paid", "Failed", "Refunded", "On Hold"];

export default function PaymentForm({ payment, budgets, cases, onSubmit, isLoading }) {
  const [form, setForm] = useState({
    status: "Pending",
    payment_date: new Date().toISOString().split("T")[0],
    ...payment,
  });

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleBudgetSelect = (budgetId) => {
    const b = budgets.find(x => x.id === budgetId);
    if (b) setForm(prev => ({ ...prev, budget_id: b.id, case_id: b.case_id, patient_id: b.patient_id, patient_name: b.patient_name }));
  };

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <Label>Budget *</Label>
        <Select value={form.budget_id || ""} onValueChange={handleBudgetSelect}>
          <SelectTrigger><SelectValue placeholder="Select budget" /></SelectTrigger>
          <SelectContent>
            {budgets.map(b => (
              <SelectItem key={b.id} value={b.id}>
                {b.patient_name} — £{(b.approved_amount || b.indicative_amount || 0).toLocaleString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {form.patient_name && (
        <div className="bg-muted/40 rounded px-3 py-2 text-sm text-muted-foreground">
          Patient: <strong className="text-foreground">{form.patient_name}</strong>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div><Label>Amount (£) *</Label><Input type="number" min="0" step="0.01" value={form.amount || ""} onChange={e => set("amount", parseFloat(e.target.value) || 0)} required /></div>
        <div><Label>Payment Date</Label><Input type="date" value={form.payment_date || ""} onChange={e => set("payment_date", e.target.value)} /></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Payment Type *</Label>
          <Select value={form.payment_type || ""} onValueChange={v => set("payment_type", v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{PAYMENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Payment Method</Label>
          <Select value={form.payment_method || ""} onValueChange={v => set("payment_method", v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{PAYMENT_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div><Label>Payee Name</Label><Input value={form.payee_name || ""} onChange={e => set("payee_name", e.target.value)} /></div>
        <div>
          <Label>Payee Type</Label>
          <Select value={form.payee_type || ""} onValueChange={v => set("payee_type", v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{PAYEE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div><Label>Reference</Label><Input value={form.reference || ""} onChange={e => set("reference", e.target.value)} /></div>
        <div><Label>Invoice Number</Label><Input value={form.invoice_number || ""} onChange={e => set("invoice_number", e.target.value)} /></div>
      </div>

      {/* Period scheduling */}
      <div className="border rounded-lg p-3 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Payment Period (optional)</p>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Period Start</Label><Input type="date" value={form.period_start || ""} onChange={e => set("period_start", e.target.value)} /></div>
          <div><Label>Period End</Label><Input type="date" value={form.period_end || ""} onChange={e => set("period_end", e.target.value)} /></div>
        </div>
      </div>

      <div>
        <Label>Status</Label>
        <Select value={form.status || "Pending"} onValueChange={v => set("status", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div><Label>Notes</Label><Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={2} /></div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isLoading || !form.budget_id || !form.payment_type}>
          {isLoading ? "Saving..." : payment ? "Save Changes" : "Record Payment"}
        </Button>
      </div>
    </form>
  );
}
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUSES = ["Draft", "Proposed", "Approved", "Active", "Under Review", "Suspended", "Ended"];
const DELIVERY_METHODS = ["Direct Payment", "Notional Budget", "Third Party", "Mixed"];

export default function CarePackageForm({ pkg, cases, contracts, onSubmit, isLoading }) {
  const [form, setForm] = useState({
    status: "Draft",
    ...pkg,
  });

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleCaseSelect = (caseId) => {
    const c = cases.find(x => x.id === caseId);
    if (c) setForm(prev => ({ ...prev, case_id: c.id, patient_id: c.patient_id, patient_name: c.patient_name }));
  };

  const handleContractSelect = (contractId) => {
    const c = contracts.find(x => x.id === contractId);
    if (c) setForm(prev => ({
      ...prev,
      contract_id: c.id,
      contract_reference: c.contract_reference,
      provider_name: c.provider_name,
    }));
  };

  const handleNumberChange = (field, raw) => {
    const val = parseFloat(raw) || 0;
    setForm(prev => {
      const updated = { ...prev, [field]: val };
      // Auto-calc annual cost
      if (field === "weekly_cost" || field === "hours_per_week") {
        updated.annual_cost = (updated.weekly_cost || 0) * 52;
      }
      return updated;
    });
  };

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <Label>PHB Case *</Label>
        <Select value={form.case_id || ""} onValueChange={handleCaseSelect}>
          <SelectTrigger><SelectValue placeholder="Select case" /></SelectTrigger>
          <SelectContent>
            {cases.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.patient_name} — {c.case_reference || c.id.slice(0, 6)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Link to Contract (optional)</Label>
        <Select value={form.contract_id || ""} onValueChange={handleContractSelect}>
          <SelectTrigger><SelectValue placeholder="Select contract" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>None</SelectItem>
            {contracts.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.provider_name} — {c.contract_reference || "No ref"}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Provider Name *</Label>
        <Input value={form.provider_name || ""} onChange={e => set("provider_name", e.target.value)} required placeholder="Organisation providing care" />
      </div>

      <div>
        <Label>Services Description *</Label>
        <Textarea value={form.services || ""} onChange={e => set("services", e.target.value)} rows={3} required placeholder="Describe the services included in this package..." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Delivery Method</Label>
          <Select value={form.delivery_method || ""} onValueChange={v => set("delivery_method", v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{DELIVERY_METHODS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Status</Label>
          <Select value={form.status || "Draft"} onValueChange={v => set("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div><Label>Hours/Week</Label><Input type="number" min="0" step="0.5" value={form.hours_per_week || ""} onChange={e => handleNumberChange("hours_per_week", e.target.value)} /></div>
        <div><Label>Weekly Cost (£)</Label><Input type="number" min="0" step="0.01" value={form.weekly_cost || ""} onChange={e => handleNumberChange("weekly_cost", e.target.value)} /></div>
        <div>
          <Label>Annual Cost (£)</Label>
          <Input readOnly value={form.annual_cost ? form.annual_cost.toFixed(0) : ""} className="bg-muted text-muted-foreground" placeholder="Auto-calculated" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div><Label>Start Date</Label><Input type="date" value={form.start_date || ""} onChange={e => set("start_date", e.target.value)} /></div>
        <div><Label>End Date</Label><Input type="date" value={form.end_date || ""} onChange={e => set("end_date", e.target.value)} /></div>
      </div>

      <div><Label>Notes</Label><Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={2} /></div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isLoading || !form.case_id || !form.provider_name}>
          {isLoading ? "Saving..." : pkg ? "Save Changes" : "Create Package"}
        </Button>
      </div>
    </form>
  );
}
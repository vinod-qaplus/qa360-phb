import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const STATUSES = ["Draft", "Submitted", "Under Review", "Approved", "Active", "Superseded", "Archived"];

export default function CarePlanForm({ plan, cases, plans, onSubmit, isLoading }) {
  const [form, setForm] = useState({
    status: "Draft",
    version: 1,
    patient_consent: false,
    ...plan,
  });

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleCaseSelect = (caseId) => {
    const c = cases.find(x => x.id === caseId);
    if (!c) return;
    const existingVersions = plans.filter(p => p.case_id === caseId && p.id !== plan?.id).length;
    setForm(prev => ({
      ...prev,
      case_id: c.id,
      patient_id: c.patient_id,
      patient_name: c.patient_name,
      version: existingVersions + 1,
    }));
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

      {form.patient_name && (
        <div className="bg-muted/40 rounded-lg px-3 py-2 text-sm text-muted-foreground">
          Pre-populated from case: <strong className="text-foreground">{form.patient_name}</strong> · Version <strong className="text-foreground">v{form.version}</strong>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Status</Label>
          <Select value={form.status || "Draft"} onValueChange={v => set("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Version</Label>
          <Input type="number" min="1" value={form.version || 1} onChange={e => set("version", parseInt(e.target.value) || 1)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div><Label>Start Date</Label><Input type="date" value={form.start_date || ""} onChange={e => set("start_date", e.target.value)} /></div>
        <div><Label>End Date</Label><Input type="date" value={form.end_date || ""} onChange={e => set("end_date", e.target.value)} /></div>
      </div>

      <div><Label>Primary Needs *</Label><Textarea placeholder="Describe the patient's primary health and care needs..." value={form.primary_needs || ""} onChange={e => set("primary_needs", e.target.value)} rows={3} /></div>
      <div><Label>Desired Outcomes</Label><Textarea placeholder="What outcomes should this care plan achieve?" value={form.outcomes || ""} onChange={e => set("outcomes", e.target.value)} rows={3} /></div>
      <div><Label>Services Required</Label><Textarea placeholder="List services needed to meet identified needs..." value={form.services_required || ""} onChange={e => set("services_required", e.target.value)} rows={3} /></div>
      <div><Label>Risk Assessment</Label><Textarea placeholder="Key risks and mitigation strategies..." value={form.risk_assessment || ""} onChange={e => set("risk_assessment", e.target.value)} rows={2} /></div>
      <div><Label>Safeguarding Notes</Label><Textarea placeholder="Any safeguarding considerations..." value={form.safeguarding_notes || ""} onChange={e => set("safeguarding_notes", e.target.value)} rows={2} /></div>

      <div className="border rounded-lg p-3 space-y-3">
        <p className="text-sm font-medium">Consent & Approval</p>
        <div className="flex items-center gap-2">
          <Checkbox id="consent" checked={form.patient_consent || false} onCheckedChange={v => set("patient_consent", v)} />
          <Label htmlFor="consent" className="text-sm font-normal">Patient consent obtained</Label>
        </div>
        {form.patient_consent && (
          <div><Label>Consent Date</Label><Input type="date" value={form.consent_date || ""} onChange={e => set("consent_date", e.target.value)} /></div>
        )}
        {(form.status === "Approved" || form.status === "Active") && (
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Approved By</Label><Input placeholder="Approver email" value={form.approved_by || ""} onChange={e => set("approved_by", e.target.value)} /></div>
            <div><Label>Approval Date</Label><Input type="date" value={form.approval_date || ""} onChange={e => set("approval_date", e.target.value)} /></div>
          </div>
        )}
      </div>

      <div><Label>Notes</Label><Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={2} /></div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isLoading || !form.case_id}>
          {isLoading ? "Saving..." : plan ? "Save Changes" : "Create Care Plan"}
        </Button>
      </div>
    </form>
  );
}
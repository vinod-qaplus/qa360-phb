import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const CATEGORIES = ["Continuing Healthcare", "Section 117", "Personal Wheelchair Budget", "Maternity", "End of Life", "Mental Health", "Learning Disability", "Other"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
const STATUSES = ["Referral", "Assessment", "Care Planning", "Approval", "Active", "Under Review", "Suspended", "Closed"];

export default function CaseForm({ caseData, patients, onSubmit, isLoading }) {
  const [form, setForm] = useState({
    patient_id: caseData?.patient_id || "",
    patient_name: caseData?.patient_name || "",
    patient_nhs_number: caseData?.patient_nhs_number || "",
    case_reference: caseData?.case_reference || "",
    status: caseData?.status || "Referral",
    eligibility_category: caseData?.eligibility_category || "",
    priority: caseData?.priority || "Medium",
    referral_date: caseData?.referral_date || new Date().toISOString().split("T")[0],
    assessment_date: caseData?.assessment_date || "",
    next_review_date: caseData?.next_review_date || "",
    assigned_commissioner: caseData?.assigned_commissioner || "",
    assigned_clinician: caseData?.assigned_clinician || "",
    notes: caseData?.notes || "",
  });

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handlePatientSelect = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      set("patient_id", patient.id);
      set("patient_name", `${patient.first_name} ${patient.last_name}`);
      set("patient_nhs_number", patient.nhs_number);
      if (patient.eligibility_category) set("eligibility_category", patient.eligibility_category);
    }
  };

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Patient *</Label>
          <Select value={form.patient_id} onValueChange={handlePatientSelect}>
            <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
            <SelectContent>
              {patients.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.nhs_number})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div><Label>Case Reference</Label><Input value={form.case_reference} onChange={e => set("case_reference", e.target.value)} placeholder="Auto-generated if blank" /></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Eligibility Category *</Label>
          <Select value={form.eligibility_category} onValueChange={v => set("eligibility_category", v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Status</Label>
          <Select value={form.status} onValueChange={v => set("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Priority</Label>
          <Select value={form.priority} onValueChange={v => set("priority", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><Label>Referral Date *</Label><Input type="date" value={form.referral_date} onChange={e => set("referral_date", e.target.value)} required /></div>
        <div><Label>Assessment Date</Label><Input type="date" value={form.assessment_date} onChange={e => set("assessment_date", e.target.value)} /></div>
        <div><Label>Next Review Date</Label><Input type="date" value={form.next_review_date} onChange={e => set("next_review_date", e.target.value)} /></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><Label>Assigned Commissioner</Label><Input value={form.assigned_commissioner} onChange={e => set("assigned_commissioner", e.target.value)} placeholder="Email" /></div>
        <div><Label>Assigned Clinician</Label><Input value={form.assigned_clinician} onChange={e => set("assigned_clinician", e.target.value)} placeholder="Email" /></div>
      </div>

      <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={3} /></div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : caseData ? "Update Case" : "Create Case"}</Button>
      </div>
    </form>
  );
}
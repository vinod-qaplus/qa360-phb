import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PROVIDER_TYPES = ["Care Agency", "NHS Provider", "Private Provider", "Voluntary Sector", "Personal Assistant Agency", "Equipment Supplier", "Therapy Provider"];
const STATUSES = ["Draft", "Under Negotiation", "Active", "Expiring Soon", "Expired", "Terminated"];
const CQC_RATINGS = ["Outstanding", "Good", "Requires Improvement", "Inadequate", "Not Rated"];

export default function ContractForm({ contract, onSubmit, isLoading }) {
  const [form, setForm] = useState({ status: "Draft", ...contract });
  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div><Label>Provider Name *</Label><Input value={form.provider_name || ""} onChange={e => set("provider_name", e.target.value)} required /></div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Provider Type *</Label>
          <Select value={form.provider_type || ""} onValueChange={v => set("provider_type", v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{PROVIDER_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Contract Reference</Label><Input value={form.contract_reference || ""} onChange={e => set("contract_reference", e.target.value)} /></div>
      </div>

      <div><Label>Service Type</Label><Input value={form.service_type || ""} onChange={e => set("service_type", e.target.value)} placeholder="e.g. Domiciliary Care, Therapy" /></div>

      <div className="grid grid-cols-3 gap-4">
        <div><Label>Hourly Rate (£)</Label><Input type="number" min="0" step="0.01" value={form.hourly_rate || ""} onChange={e => set("hourly_rate", parseFloat(e.target.value) || 0)} /></div>
        <div><Label>Daily Rate (£)</Label><Input type="number" min="0" step="0.01" value={form.daily_rate || ""} onChange={e => set("daily_rate", parseFloat(e.target.value) || 0)} /></div>
        <div><Label>Annual Value (£)</Label><Input type="number" min="0" step="0.01" value={form.annual_value || ""} onChange={e => set("annual_value", parseFloat(e.target.value) || 0)} /></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div><Label>Start Date *</Label><Input type="date" value={form.start_date || ""} onChange={e => set("start_date", e.target.value)} required /></div>
        <div><Label>End Date</Label><Input type="date" value={form.end_date || ""} onChange={e => set("end_date", e.target.value)} /></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div><Label>Notice Period (days)</Label><Input type="number" min="0" value={form.notice_period_days || ""} onChange={e => set("notice_period_days", parseInt(e.target.value) || 0)} /></div>
        <div>
          <Label>CQC Rating</Label>
          <Select value={form.cqc_rating || ""} onValueChange={v => set("cqc_rating", v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{CQC_RATINGS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Status</Label>
        <Select value={form.status || "Draft"} onValueChange={v => set("status", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg p-3 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground">Contact Details</p>
        <div><Label>Contact Name</Label><Input value={form.contact_name || ""} onChange={e => set("contact_name", e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Email</Label><Input type="email" value={form.contact_email || ""} onChange={e => set("contact_email", e.target.value)} /></div>
          <div><Label>Phone</Label><Input value={form.contact_phone || ""} onChange={e => set("contact_phone", e.target.value)} /></div>
        </div>
      </div>

      <div><Label>Key Terms</Label><Textarea value={form.terms || ""} onChange={e => set("terms", e.target.value)} rows={3} placeholder="Key contract terms and conditions..." /></div>
      <div><Label>Notes</Label><Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={2} /></div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isLoading || !form.provider_name || !form.provider_type}>
          {isLoading ? "Saving..." : contract ? "Save Changes" : "Create Contract"}
        </Button>
      </div>
    </form>
  );
}
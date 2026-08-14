import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const ELIGIBILITY_CATEGORIES = [
  "Continuing Healthcare", "Section 117", "Personal Wheelchair Budget",
  "Maternity", "End of Life", "Mental Health", "Learning Disability", "Other"
];

export default function PatientForm({ patient, onSubmit, isLoading }) {
  const [form, setForm] = useState({
    nhs_number: patient?.nhs_number || "",
    title: patient?.title || "",
    first_name: patient?.first_name || "",
    last_name: patient?.last_name || "",
    date_of_birth: patient?.date_of_birth || "",
    gender: patient?.gender || "",
    address_line_1: patient?.address_line_1 || "",
    address_line_2: patient?.address_line_2 || "",
    city: patient?.city || "",
    postcode: patient?.postcode || "",
    phone: patient?.phone || "",
    email: patient?.email || "",
    gp_practice: patient?.gp_practice || "",
    gp_name: patient?.gp_name || "",
    ccg_area: patient?.ccg_area || "",
    eligibility_category: patient?.eligibility_category || "",
    next_of_kin_name: patient?.next_of_kin_name || "",
    next_of_kin_phone: patient?.next_of_kin_phone || "",
    next_of_kin_relationship: patient?.next_of_kin_relationship || "",
    notes: patient?.notes || "",
  });

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* NHS & Personal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>NHS Number *</Label>
          <Input value={form.nhs_number} onChange={e => set("nhs_number", e.target.value)} placeholder="000 000 0000" required />
        </div>
        <div>
          <Label>Title</Label>
          <Select value={form.title} onValueChange={v => set("title", v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {["Mr", "Mrs", "Ms", "Miss", "Dr", "Prof", "Mx"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Gender</Label>
          <Select value={form.gender} onValueChange={v => set("gender", v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {["Male", "Female", "Non-binary", "Prefer not to say"].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><Label>First Name *</Label><Input value={form.first_name} onChange={e => set("first_name", e.target.value)} required /></div>
        <div><Label>Last Name *</Label><Input value={form.last_name} onChange={e => set("last_name", e.target.value)} required /></div>
        <div><Label>Date of Birth *</Label><Input type="date" value={form.date_of_birth} onChange={e => set("date_of_birth", e.target.value)} required /></div>
      </div>

      {/* Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><Label>Phone</Label><Input value={form.phone} onChange={e => set("phone", e.target.value)} /></div>
        <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => set("email", e.target.value)} /></div>
      </div>

      {/* Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><Label>Address Line 1</Label><Input value={form.address_line_1} onChange={e => set("address_line_1", e.target.value)} /></div>
        <div><Label>Address Line 2</Label><Input value={form.address_line_2} onChange={e => set("address_line_2", e.target.value)} /></div>
        <div><Label>City</Label><Input value={form.city} onChange={e => set("city", e.target.value)} /></div>
        <div><Label>Postcode</Label><Input value={form.postcode} onChange={e => set("postcode", e.target.value)} /></div>
      </div>

      {/* Clinical */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><Label>GP Practice</Label><Input value={form.gp_practice} onChange={e => set("gp_practice", e.target.value)} /></div>
        <div><Label>GP Name</Label><Input value={form.gp_name} onChange={e => set("gp_name", e.target.value)} /></div>
        <div><Label>CCG/ICB Area</Label><Input value={form.ccg_area} onChange={e => set("ccg_area", e.target.value)} /></div>
      </div>

      <div>
        <Label>Eligibility Category</Label>
        <Select value={form.eligibility_category} onValueChange={v => set("eligibility_category", v)}>
          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
          <SelectContent>
            {ELIGIBILITY_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* NOK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><Label>Next of Kin</Label><Input value={form.next_of_kin_name} onChange={e => set("next_of_kin_name", e.target.value)} /></div>
        <div><Label>NOK Phone</Label><Input value={form.next_of_kin_phone} onChange={e => set("next_of_kin_phone", e.target.value)} /></div>
        <div><Label>NOK Relationship</Label><Input value={form.next_of_kin_relationship} onChange={e => set("next_of_kin_relationship", e.target.value)} /></div>
      </div>

      <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={3} /></div>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : patient ? "Update Patient" : "Create Patient"}
        </Button>
      </div>
    </form>
  );
}
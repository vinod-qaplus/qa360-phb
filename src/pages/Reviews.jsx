import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { format } from "date-fns";

const REVIEW_TYPES = ["Scheduled", "Unscheduled", "Annual", "Reassessment", "Safeguarding", "Financial"];
const OUTCOMES_MET = ["Fully Met", "Partially Met", "Not Met", "Exceeded"];
const SATISFACTION = ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"];
const ACTIONS = ["No Change", "Amend Care Plan", "Increase Budget", "Decrease Budget", "Change Provider", "Close Case", "Escalate"];
const STATUSES = ["Scheduled", "In Progress", "Completed", "Cancelled"];

export default function Reviews() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews"],
    queryFn: () => base44.entities.Review.list("-review_date", 200),
  });

  const { data: cases = [] } = useQuery({
    queryKey: ["cases"],
    queryFn: () => base44.entities.PHBCase.list("-created_date", 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Review.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["reviews"] }); setShowForm(false); },
  });

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleCaseSelect = (caseId) => {
    const c = cases.find(x => x.id === caseId);
    if (c) setForm(prev => ({ ...prev, case_id: c.id, patient_id: c.patient_id, patient_name: c.patient_name }));
  };

  const filtered = reviews.filter(r => !search || r.patient_name?.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { header: "Patient", cell: (row) => <span className="font-medium">{row.patient_name}</span> },
    { header: "Type", cell: (row) => <span className="text-xs">{row.review_type}</span> },
    { header: "Date", cell: (row) => row.review_date ? format(new Date(row.review_date), "dd/MM/yyyy") : "—" },
    { header: "Outcomes", cell: (row) => <StatusBadge status={row.outcomes_met} /> },
    { header: "Action", cell: (row) => <span className="text-xs">{row.action_required || "—"}</span> },
    { header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search reviews..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={() => { setForm({ status: "Scheduled", review_date: new Date().toISOString().split("T")[0] }); setShowForm(true); }} size="sm">
          <Plus className="w-4 h-4 mr-1.5" /> Schedule Review
        </Button>
      </div>

      <DataTable columns={columns} data={filtered} isLoading={isLoading} />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Schedule Review</DialogTitle></DialogHeader>
          <form onSubmit={e => { e.preventDefault(); createMutation.mutate(form); }} className="space-y-4">
            <div>
              <Label>PHB Case *</Label>
              <Select value={form.case_id || ""} onValueChange={handleCaseSelect}>
                <SelectTrigger><SelectValue placeholder="Select case" /></SelectTrigger>
                <SelectContent>{cases.map(c => <SelectItem key={c.id} value={c.id}>{c.patient_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Review Type *</Label>
                <Select value={form.review_type || ""} onValueChange={v => set("review_type", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{REVIEW_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Review Date *</Label><Input type="date" value={form.review_date || ""} onChange={e => set("review_date", e.target.value)} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Outcomes Met</Label>
                <Select value={form.outcomes_met || ""} onValueChange={v => set("outcomes_met", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{OUTCOMES_MET.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Patient Satisfaction</Label>
                <Select value={form.patient_satisfaction || ""} onValueChange={v => set("patient_satisfaction", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{SATISFACTION.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Clinical Notes</Label><Textarea value={form.clinical_notes || ""} onChange={e => set("clinical_notes", e.target.value)} rows={3} /></div>
            <div><Label>Recommendations</Label><Textarea value={form.recommendations || ""} onChange={e => set("recommendations", e.target.value)} rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Action Required</Label>
                <Select value={form.action_required || ""} onValueChange={v => set("action_required", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{ACTIONS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Next Review Date</Label><Input type="date" value={form.next_review_date || ""} onChange={e => set("next_review_date", e.target.value)} /></div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status || "Scheduled"} onValueChange={v => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex justify-end"><Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? "Saving..." : "Create Review"}</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
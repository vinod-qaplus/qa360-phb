import React, { useState } from "react";
// import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import CaseForm from "@/components/cases/CaseForm";
//import CaseDetailPanel from "@/components/cases/CaseDetailPanel";
import { format, isPast, parseISO } from "date-fns";

const STATUSES = [
  "All",
  "Referral",
  "Assessment",
  "Care Planning",
  "Approval",
  "Active",
  "Under Review",
  "Suspended",
  "Closed",
];

import {
  usePHBCases,
  useCreatePHBCase,
  useUpdatePHBCase,
} from "@/hooks/usePHBCases";

export default function Cases() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [editingCase, setEditingCase] = useState(null);
  //const queryClient = useQueryClient();

  // const { data: cases = [], isLoading } = useQuery({
  //   queryKey: ["cases"],
  //   queryFn: () => base44.entities.PHBCase.list("-created_date", 200),
  // });

  // const { data: patients = [] } = useQuery({
  //   queryKey: ["patients"],
  //   queryFn: () => base44.entities.Patient.list("-created_date", 200),
  // });

  // const createMutation = useMutation({
  //   mutationFn: (data) => base44.entities.PHBCase.create(data),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["cases"] });
  //     setShowForm(false);
  //   },
  // });

  // const updateMutation = useMutation({
  //   mutationFn: ({ id, data }) => base44.entities.PHBCase.update(id, data),
  //   onSuccess: (_, vars) => {
  //     queryClient.invalidateQueries({ queryKey: ["cases"] });
  //     setShowForm(false);
  //     setEditingCase(null);
  //     // Refresh selected case data
  //     if (selectedCase?.id === vars.id) {
  //       setSelectedCase((prev) => ({ ...prev, ...vars.data }));
  //     }
  //   },
  // });

  const query = usePHBCases();

  const createMutation = useCreatePHBCase();
  const updateMutation = useUpdatePHBCase();

  const { data: cases = [], isLoading, isFetching, status, error } = query;

  const filtered = cases.filter((c) => {
    const matchSearch =
      !search ||
      c.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.case_reference?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const overdueReviews = cases.filter(
    (c) =>
      c.next_review_date &&
      isPast(parseISO(c.next_review_date)) &&
      c.status === "Active",
  ).length;

  const columns = [
    {
      header: "Reference",
      cell: (row) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.case_reference || `PHB-${row.id?.slice(0, 6)}`}
        </span>
      ),
    },
    {
      header: "Patient",
      cell: (row) => <span className="font-medium">{row.patient_name}</span>,
    },
    {
      header: "Category",
      cell: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.eligibility_category}
        </span>
      ),
    },
    { header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: "Priority",
      cell: (row) => <StatusBadge status={row.priority} />,
    },
    {
      header: "Referral",
      cell: (row) =>
        row.referral_date
          ? format(new Date(row.referral_date), "dd/MM/yyyy")
          : "—",
    },
    {
      header: "Next Review",
      cell: (row) => {
        if (!row.next_review_date)
          return <span className="text-muted-foreground">—</span>;
        const overdue = isPast(parseISO(row.next_review_date));
        return (
          <span
            className={overdue ? "text-red-600 font-medium text-xs" : "text-xs"}
          >
            {overdue && <AlertTriangle className="w-3 h-3 inline mr-1" />}
            {format(new Date(row.next_review_date), "dd/MM/yyyy")}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {overdueReviews > 0 && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            <strong>
              {overdueReviews} case{overdueReviews > 1 ? "s" : ""}
            </strong>{" "}
            have overdue reviews and require attention.
          </span>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search cases..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44">
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
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{filtered.length} cases</Badge>
          <Button
            onClick={() => {
              setEditingCase(null);
              setShowForm(true);
            }}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1.5" /> New Case
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        onRowClick={setSelectedCase}
        emptyMessage="No cases match your filters"
      />

      {/* New / Edit Case Dialog */}
      {/* <Dialog
        open={showForm}
        onOpenChange={(v) => {
          setShowForm(v);
          if (!v) setEditingCase(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCase ? "Edit Case" : "New PHB Case"}
            </DialogTitle>
          </DialogHeader>
          <CaseForm
            caseData={editingCase}
            patients={patients}
            onSubmit={(data) =>
              editingCase
                ? updateMutation.mutate({ id: editingCase.id, data })
                : createMutation.mutate(data)
            }
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog> */}

      {/* Case Detail Side Panel (full-width dialog with tabs) */}
      {/* <Dialog
        open={!!selectedCase}
        onOpenChange={(v) => {
          if (!v) setSelectedCase(null);
        }}
      >
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0">
          {selectedCase && (
            <CaseDetailPanel
              caseData={selectedCase}
              onEdit={() => {
                setEditingCase(selectedCase);
                setSelectedCase(null);
                setShowForm(true);
              }}
              onStatusChange={(newStatus) =>
                updateMutation.mutate({
                  id: selectedCase.id,
                  data: { ...selectedCase, status: newStatus },
                })
              }
              onClose={() => setSelectedCase(null)}
            />
          )}
        </DialogContent>
      </Dialog> */}
    </div>
  );
}

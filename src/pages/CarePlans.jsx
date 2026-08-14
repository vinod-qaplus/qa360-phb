import React, { useState } from "react";
// import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, CheckCircle2, Clock } from "lucide-react";
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
import CarePlanForm from "@/components/careplans/CarePlanForm";
import CarePlanDetail from "@/components/careplans/CarePlanDetail";
import { format } from "date-fns";
import { useAudit } from "@/hooks/useAudit";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import RoleGuard from "@/components/shared/RoleGuard";

const STATUSES = [
  "All",
  "Draft",
  "Submitted",
  "Under Review",
  "Approved",
  "Active",
  "Superseded",
  "Archived",
];

export default function CarePlans() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const queryClient = useQueryClient();
  const { logAction } = useAudit();
  const { canEdit, canApprove } = useRoleGuard();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["carePlans"],
    queryFn: () => base44.entities.CarePlan.list("-created_date", 200),
  });

  const { data: cases = [] } = useQuery({
    queryKey: ["cases"],
    queryFn: () => base44.entities.PHBCase.list("-created_date", 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CarePlan.create(data),
    onSuccess: (created, data) => {
      queryClient.invalidateQueries({ queryKey: ["carePlans"] });
      setShowForm(false);
      logAction({
        action: "Create",
        entityType: "CarePlan",
        entityId: created?.id,
        entityReference: `${data.patient_name} v${data.version}`,
        description: `Created care plan for ${data.patient_name} (v${data.version})`,
        newValue: { status: data.status },
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CarePlan.update(id, data),
    onSuccess: (_, { id, data }) => {
      queryClient.invalidateQueries({ queryKey: ["carePlans"] });
      setShowForm(false);
      setEditingPlan(null);
      setSelectedPlan(null);
      const isApproval = data.status === "Approved";
      logAction({
        action: isApproval ? "Approve" : "Update",
        entityType: "CarePlan",
        entityId: id,
        entityReference: `${data.patient_name} v${data.version}`,
        description: isApproval
          ? `Approved care plan for ${data.patient_name}`
          : `Updated care plan for ${data.patient_name} (v${data.version})`,
        newValue: { status: data.status },
      });
    },
  });

  const filtered = plans.filter((p) => {
    const matchSearch =
      !search || p.patient_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pendingApproval = plans.filter(
    (p) => p.status === "Submitted" || p.status === "Under Review",
  ).length;

  const openNew = () => {
    setEditingPlan(null);
    setShowForm(true);
  };
  const openEdit = (plan) => {
    setEditingPlan(plan);
    setSelectedPlan(null);
    setShowForm(true);
  };

  const columns = [
    {
      header: "Patient",
      cell: (row) => <span className="font-medium">{row.patient_name}</span>,
    },
    {
      header: "Version",
      cell: (row) => (
        <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
          v{row.version}
        </span>
      ),
    },
    { header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: "Start",
      cell: (row) =>
        row.start_date ? format(new Date(row.start_date), "dd/MM/yyyy") : "—",
    },
    {
      header: "End",
      cell: (row) =>
        row.end_date ? format(new Date(row.end_date), "dd/MM/yyyy") : "—",
    },
    {
      header: "Consent",
      cell: (row) =>
        row.patient_consent ? (
          <span className="flex items-center gap-1 text-xs text-emerald-600">
            <CheckCircle2 className="w-3 h-3" /> Obtained
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-amber-600">
            <Clock className="w-3 h-3" /> Pending
          </span>
        ),
    },
    {
      header: "Approved By",
      cell: (row) =>
        row.approved_by ? (
          <span className="text-xs">{row.approved_by}</span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      {pendingApproval > 0 && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          <Clock className="w-4 h-4 shrink-0" />
          <span>
            <strong>
              {pendingApproval} care plan{pendingApproval > 1 ? "s" : ""}
            </strong>{" "}
            awaiting approval.
          </span>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search care plans..."
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
          <Badge variant="secondary">{filtered.length} plans</Badge>
          {canEdit && (
            <Button onClick={openNew} size="sm">
              <Plus className="w-4 h-4 mr-1.5" /> New Care Plan
            </Button>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        onRowClick={setSelectedPlan}
      />

      {/* Create / Edit Dialog */}
      <Dialog
        open={showForm}
        onOpenChange={(v) => {
          setShowForm(v);
          if (!v) setEditingPlan(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? "Edit Care Plan" : "New Care Plan"}
            </DialogTitle>
          </DialogHeader>
          <CarePlanForm
            plan={editingPlan}
            cases={cases}
            plans={plans}
            onSubmit={(data) =>
              editingPlan
                ? updateMutation.mutate({ id: editingPlan.id, data })
                : createMutation.mutate(data)
            }
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedPlan}
        onOpenChange={(v) => {
          if (!v) setSelectedPlan(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Care Plan Detail</DialogTitle>
          </DialogHeader>
          {selectedPlan && (
            <CarePlanDetail
              plan={selectedPlan}
              onEdit={() => openEdit(selectedPlan)}
              onApprove={(approvedBy) =>
                updateMutation.mutate({
                  id: selectedPlan.id,
                  data: {
                    ...selectedPlan,
                    status: "Approved",
                    approved_by: approvedBy,
                    approval_date: new Date().toISOString().slice(0, 10),
                  },
                })
              }
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

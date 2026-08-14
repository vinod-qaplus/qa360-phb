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
import { useAudit } from "@/hooks/useAudit";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import RoleGuard from "@/components/shared/RoleGuard";
import StatusBadge from "@/components/shared/StatusBadge";
import BudgetForm from "@/components/budgets/BudgetForm";
import BudgetDetail from "@/components/budgets/BudgetDetail";

const STATUSES = [
  "All",
  "Draft",
  "Submitted",
  "Under Review",
  "Approved",
  "Active",
  "Overspent",
  "Closed",
];

export default function Budgets() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const queryClient = useQueryClient();
  const { logAction } = useAudit();
  const { canEdit, canApprove, canViewFinancials } = useRoleGuard();

  function todoFunction() {}

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ["budgets"],
    queryFn: () => todoFunction(), //base44.entities.Budget.list("-created_date", 200),
  });

  const { data: cases = [] } = useQuery({
    queryKey: ["cases"],
    queryFn: () => todoFunction(), //base44.entities.PHBCase.list("-created_date", 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) => todoFunction(), //base44.entities.Budget.create(data),
    onSuccess: (created, data) => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      setShowForm(false);
      logAction({
        action: "Create",
        entityType: "Budget",
        entityId: created?.id,
        entityReference: data.patient_name,
        description: `Created budget for ${data.patient_name} — indicative £${(data.indicative_amount || 0).toLocaleString()}`,
        newValue: {
          indicative_amount: data.indicative_amount,
          status: data.status,
        },
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => todoFunction(), //base44.entities.Budget.update(id, data),
    onSuccess: (_, { id, data }) => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      setShowForm(false);
      setEditingBudget(null);
      setSelectedBudget(null);
      const isApproval = data.status === "Approved";
      logAction({
        action: isApproval ? "Approve" : "Update",
        entityType: "Budget",
        entityId: id,
        entityReference: data.patient_name,
        description: isApproval
          ? `Approved budget of £${(data.approved_amount || 0).toLocaleString()} for ${data.patient_name}`
          : `Updated budget for ${data.patient_name}`,
        newValue: {
          status: data.status,
          approved_amount: data.approved_amount,
        },
      });
    },
  });

  const filtered = budgets.filter((b) => {
    const matchSearch =
      !search || b.patient_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const overspent = budgets.filter(
    (b) =>
      b.status === "Overspent" ||
      (b.approved_amount > 0 && (b.spent_amount || 0) > b.approved_amount),
  ).length;
  const totalApproved = budgets
    .filter((b) => ["Approved", "Active"].includes(b.status))
    .reduce((s, b) => s + (b.approved_amount || 0), 0);

  const openEdit = (budget) => {
    setEditingBudget(budget);
    setSelectedBudget(null);
    setShowForm(true);
  };

  const columns = [
    {
      header: "Patient",
      cell: (row) => <span className="font-medium">{row.patient_name}</span>,
    },
    {
      header: "Indicative",
      cell: (row) => (
        <span className="font-mono text-xs">
          £{(row.indicative_amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Approved",
      cell: (row) => (
        <span className="font-mono text-xs font-semibold">
          £{(row.approved_amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Spent",
      cell: (row) => {
        const over =
          row.approved_amount > 0 &&
          (row.spent_amount || 0) > row.approved_amount;
        return (
          <span
            className={`font-mono text-xs ${over ? "text-red-600 font-semibold" : ""}`}
          >
            £{(row.spent_amount || 0).toLocaleString()}
          </span>
        );
      },
    },
    {
      header: "Utilisation",
      cell: (row) => {
        if (!row.approved_amount)
          return <span className="text-muted-foreground text-xs">—</span>;
        const pct = Math.min(
          100,
          Math.round(((row.spent_amount || 0) / row.approved_amount) * 100),
        );
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 bg-muted rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full ${pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs">{pct}%</span>
          </div>
        );
      },
    },
    {
      header: "Funding",
      cell: (row) => <span className="text-xs">{row.funding_type || "—"}</span>,
    },
    { header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-4">
      {overspent > 0 && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            <strong>
              {overspent} budget{overspent > 1 ? "s" : ""}
            </strong>{" "}
            have exceeded their approved amount.
          </span>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search budgets..."
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
          <Badge variant="secondary">
            Total approved: £{totalApproved.toLocaleString()}
          </Badge>
          {canEdit && (
            <Button
              onClick={() => {
                setEditingBudget(null);
                setShowForm(true);
              }}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1.5" /> New Budget
            </Button>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        onRowClick={setSelectedBudget}
      />

      {/* Create / Edit */}
      <Dialog
        open={showForm}
        onOpenChange={(v) => {
          setShowForm(v);
          if (!v) setEditingBudget(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBudget ? "Edit Budget" : "New Budget"}
            </DialogTitle>
          </DialogHeader>
          <BudgetForm
            budget={editingBudget}
            cases={cases}
            onSubmit={(data) =>
              editingBudget
                ? updateMutation.mutate({ id: editingBudget.id, data })
                : createMutation.mutate(data)
            }
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Detail */}
      <Dialog
        open={!!selectedBudget}
        onOpenChange={(v) => {
          if (!v) setSelectedBudget(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Budget Detail</DialogTitle>
          </DialogHeader>
          {selectedBudget && (
            <BudgetDetail
              budget={selectedBudget}
              onEdit={() => openEdit(selectedBudget)}
              onApprove={(approvedBy) =>
                updateMutation.mutate({
                  id: selectedBudget.id,
                  data: {
                    ...selectedBudget,
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

import React, { useState } from "react";
// import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
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
import CarePackageForm from "@/components/carepackages/CarePackageForm";
import CarePackageDetail from "@/components/carepackages/CarePackageDetail";
import { format } from "date-fns";

const STATUSES = [
  "All",
  "Draft",
  "Proposed",
  "Approved",
  "Active",
  "Under Review",
  "Suspended",
  "Ended",
];

export default function CarePackages() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const queryClient = useQueryClient();

  function functionToDo() {}

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ["carePackages"],
    queryFn: () => functionToDo(), //base44.entities.CarePackage.list("-created_date", 200),
  });

  const { data: cases = [] } = useQuery({
    queryKey: ["cases"],
    queryFn: () => functionToDo(), // base44.entities.PHBCase.list("-created_date", 200),
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ["contracts"],
    queryFn: () => functionToDo(), // base44.entities.Contract.list("-created_date", 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CarePackage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carePackages"] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CarePackage.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carePackages"] });
      setShowForm(false);
      setEditingPkg(null);
      setSelectedPkg(null);
    },
  });

  const filtered = packages.filter((p) => {
    const matchSearch =
      !search ||
      p.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.provider_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const activeCount = packages.filter((p) => p.status === "Active").length;
  const totalWeeklyCost = packages
    .filter((p) => p.status === "Active")
    .reduce((s, p) => s + (p.weekly_cost || 0), 0);

  const openEdit = (pkg) => {
    setEditingPkg(pkg);
    setSelectedPkg(null);
    setShowForm(true);
  };

  const columns = [
    {
      header: "Patient",
      cell: (row) => <span className="font-medium">{row.patient_name}</span>,
    },
    {
      header: "Provider",
      cell: (row) => <span className="text-sm">{row.provider_name}</span>,
    },
    {
      header: "Services",
      cell: (row) => (
        <span className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
          {row.services}
        </span>
      ),
    },
    {
      header: "Hrs/Wk",
      cell: (row) =>
        row.hours_per_week ? (
          <span className="text-xs">{row.hours_per_week}h</span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
    {
      header: "Weekly Cost",
      cell: (row) => (
        <span className="font-mono text-xs">
          £{(row.weekly_cost || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Delivery",
      cell: (row) => (
        <span className="text-xs">{row.delivery_method || "—"}</span>
      ),
    },
    { header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: "Start",
      cell: (row) =>
        row.start_date ? format(new Date(row.start_date), "dd/MM/yy") : "—",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search packages..."
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
            {activeCount} active · £{totalWeeklyCost.toLocaleString()}/wk
          </Badge>
          <Button
            onClick={() => {
              setEditingPkg(null);
              setShowForm(true);
            }}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1.5" /> New Package
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        onRowClick={setSelectedPkg}
      />

      <Dialog
        open={showForm}
        onOpenChange={(v) => {
          setShowForm(v);
          if (!v) setEditingPkg(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPkg ? "Edit Care Package" : "New Care Package"}
            </DialogTitle>
          </DialogHeader>
          <CarePackageForm
            pkg={editingPkg}
            cases={cases}
            contracts={contracts}
            onSubmit={(data) =>
              editingPkg
                ? updateMutation.mutate({ id: editingPkg.id, data })
                : createMutation.mutate(data)
            }
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedPkg}
        onOpenChange={(v) => {
          if (!v) setSelectedPkg(null);
        }}
      >
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Care Package Detail</DialogTitle>
          </DialogHeader>
          {selectedPkg && (
            <CarePackageDetail
              pkg={selectedPkg}
              onEdit={() => openEdit(selectedPkg)}
              contracts={contracts}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

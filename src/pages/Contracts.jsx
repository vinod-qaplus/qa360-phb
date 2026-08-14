import React, { useState } from "react";
// import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Download, AlertTriangle } from "lucide-react";
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
import ContractForm from "@/components/contracts/ContractForm";
import ContractDetail from "@/components/contracts/ContractDetail";
import { format, isPast, parseISO, addDays } from "date-fns";
import { exportToCSV } from "@/utils/csvExport";

const STATUSES = [
  "All",
  "Draft",
  "Under Negotiation",
  "Active",
  "Expiring Soon",
  "Expired",
  "Terminated",
];

export default function Contracts() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);
  const queryClient = useQueryClient();

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ["contracts"],
    queryFn: () => base44.entities.Contract.list("-created_date", 200),
  });

  const { data: packages = [] } = useQuery({
    queryKey: ["carePackages"],
    queryFn: () => base44.entities.CarePackage.list("-created_date", 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Contract.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Contract.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      setShowForm(false);
      setEditingContract(null);
      setSelectedContract(null);
    },
  });

  const expiringSoon = contracts.filter((c) => {
    if (!c.end_date || c.status !== "Active") return false;
    const endDate = parseISO(c.end_date);
    return !isPast(endDate) && isPast(addDays(new Date(), -90))
      ? false
      : endDate <= addDays(new Date(), 90);
  });

  const filtered = contracts.filter((c) => {
    const matchSearch =
      !search ||
      c.provider_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.contract_reference?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalContractValue = contracts
    .filter((c) => c.status === "Active")
    .reduce((s, c) => s + (c.annual_value || 0), 0);
  const openEdit = (contract) => {
    setEditingContract(contract);
    setSelectedContract(null);
    setShowForm(true);
  };

  const handleExport = () => {
    exportToCSV(
      filtered.map((c) => ({
        Reference: c.contract_reference || "",
        Provider: c.provider_name || "",
        Type: c.provider_type || "",
        "Service Type": c.service_type || "",
        "Hourly Rate": c.hourly_rate || "",
        "Annual Value": c.annual_value || "",
        "Start Date": c.start_date || "",
        "End Date": c.end_date || "",
        "CQC Rating": c.cqc_rating || "",
        Status: c.status || "",
        "Contact Name": c.contact_name || "",
        "Contact Email": c.contact_email || "",
      })),
      "contracts_export",
    );
  };

  const columns = [
    {
      header: "Provider",
      cell: (row) => <span className="font-medium">{row.provider_name}</span>,
    },
    {
      header: "Ref",
      cell: (row) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.contract_reference || "—"}
        </span>
      ),
    },
    {
      header: "Type",
      cell: (row) => <span className="text-xs">{row.provider_type}</span>,
    },
    {
      header: "Service",
      cell: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.service_type || "—"}
        </span>
      ),
    },
    {
      header: "Hourly",
      cell: (row) =>
        row.hourly_rate ? (
          <span className="font-mono text-xs">£{row.hourly_rate}/hr</span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
    {
      header: "Annual Value",
      cell: (row) =>
        row.annual_value ? (
          <span className="font-mono text-xs">
            £{row.annual_value.toLocaleString()}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
    {
      header: "CQC",
      cell: (row) =>
        row.cqc_rating ? (
          <StatusBadge status={row.cqc_rating} />
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
    { header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: "Expires",
      cell: (row) => {
        if (!row.end_date)
          return <span className="text-muted-foreground text-xs">—</span>;
        const soon =
          row.end_date && parseISO(row.end_date) <= addDays(new Date(), 90);
        return (
          <span
            className={`text-xs ${soon && row.status === "Active" ? "text-amber-600 font-medium" : ""}`}
          >
            {format(new Date(row.end_date), "dd/MM/yyyy")}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {expiringSoon.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            <strong>
              {expiringSoon.length} contract{expiringSoon.length > 1 ? "s" : ""}
            </strong>{" "}
            expiring within 90 days:{" "}
            {expiringSoon.map((c) => c.provider_name).join(", ")}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search providers..."
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
            Active value: £{totalContractValue.toLocaleString()}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-1.5" />
            Export
          </Button>
          <Button
            onClick={() => {
              setEditingContract(null);
              setShowForm(true);
            }}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1.5" /> New Contract
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        onRowClick={setSelectedContract}
      />

      <Dialog
        open={showForm}
        onOpenChange={(v) => {
          setShowForm(v);
          if (!v) setEditingContract(null);
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingContract ? "Edit Contract" : "New Contract"}
            </DialogTitle>
          </DialogHeader>
          <ContractForm
            contract={editingContract}
            onSubmit={(data) =>
              editingContract
                ? updateMutation.mutate({ id: editingContract.id, data })
                : createMutation.mutate(data)
            }
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedContract}
        onOpenChange={(v) => {
          if (!v) setSelectedContract(null);
        }}
      >
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contract Detail</DialogTitle>
          </DialogHeader>
          {selectedContract && (
            <ContractDetail
              contract={selectedContract}
              packages={packages}
              onEdit={() => openEdit(selectedContract)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

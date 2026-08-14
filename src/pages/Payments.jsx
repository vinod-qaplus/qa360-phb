import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Download, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import PaymentForm from "@/components/payments/PaymentForm";
import PaymentDetail from "@/components/payments/PaymentDetail";
import { format } from "date-fns";
import { exportToCSV } from "@/utils/csvExport";
import { useAudit } from "@/hooks/useAudit";
import { useRoleGuard } from "@/hooks/useRoleGuard";

const STATUSES = ["All", "Pending", "Approved", "Processed", "Paid", "Failed", "Refunded", "On Hold"];

export default function Payments() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const queryClient = useQueryClient();
  const { logAction } = useAudit();
  const { canEdit, canExport } = useRoleGuard();

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: () => base44.entities.Payment.list("-created_date", 500),
  });

  const { data: budgets = [] } = useQuery({
    queryKey: ["budgets"],
    queryFn: () => base44.entities.Budget.list("-created_date", 200),
  });

  const { data: cases = [] } = useQuery({
    queryKey: ["cases"],
    queryFn: () => base44.entities.PHBCase.list("-created_date", 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Payment.create(data),
    onSuccess: (created, data) => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      setShowForm(false);
      logAction({ action: "Create", entityType: "Payment", entityId: created?.id, entityReference: data.reference || data.patient_name, description: `Recorded payment of £${(data.amount || 0).toLocaleString()} for ${data.patient_name} (${data.payment_type})`, newValue: { amount: data.amount, status: data.status } });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Payment.update(id, data),
    onSuccess: (_, { id, data }) => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      setShowForm(false); setEditingPayment(null); setSelectedPayment(null);
      logAction({ action: data.status !== undefined ? "Status Change" : "Update", entityType: "Payment", entityId: id, entityReference: data.reference || data.patient_name, description: `Payment for ${data.patient_name} updated to ${data.status}`, newValue: { status: data.status, amount: data.amount } });
    },
  });

  const filtered = payments.filter(p => {
    const matchSearch = !search || p.patient_name?.toLowerCase().includes(search.toLowerCase()) || p.reference?.toLowerCase().includes(search.toLowerCase()) || p.payee_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPaid = payments.filter(p => p.status === "Paid").reduce((s, p) => s + (p.amount || 0), 0);
  const totalPending = payments.filter(p => p.status === "Pending" || p.status === "Approved").reduce((s, p) => s + (p.amount || 0), 0);
  const pendingCount = payments.filter(p => p.status === "Pending").length;
  const failedCount = payments.filter(p => p.status === "Failed").length;

  const openEdit = (payment) => { setEditingPayment(payment); setSelectedPayment(null); setShowForm(true); };

  const handleExport = () => {
    logAction({ action: "Export", entityType: "Payment", description: `Exported ${filtered.length} payment records` });
    exportToCSV(filtered.map(p => ({
      Reference: p.reference || "",
      Patient: p.patient_name || "",
      Amount: p.amount || 0,
      Type: p.payment_type || "",
      Method: p.payment_method || "",
      Payee: p.payee_name || "",
      "Payee Type": p.payee_type || "",
      Date: p.payment_date || "",
      Status: p.status || "",
      "Invoice No": p.invoice_number || "",
      Notes: p.notes || "",
    })), "payments_export");
  };

  const columns = [
    { header: "Reference", cell: (row) => <span className="font-mono text-xs">{row.reference || "—"}</span> },
    { header: "Patient", cell: (row) => <span className="font-medium">{row.patient_name}</span> },
    { header: "Amount", cell: (row) => <span className="font-mono text-sm font-semibold">£{(row.amount || 0).toLocaleString()}</span> },
    { header: "Type", cell: (row) => <span className="text-xs">{row.payment_type}</span> },
    { header: "Payee", cell: (row) => <span className="text-xs">{row.payee_name || "—"}</span> },
    { header: "Date", cell: (row) => row.payment_date ? format(new Date(row.payment_date), "dd/MM/yyyy") : "—" },
    { header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
  ];

  const scheduledColumns = [
    { header: "Patient", cell: (row) => <span className="font-medium">{row.patient_name}</span> },
    { header: "Amount", cell: (row) => <span className="font-mono text-sm font-semibold">£{(row.amount || 0).toLocaleString()}</span> },
    { header: "Type", cell: (row) => <span className="text-xs">{row.payment_type}</span> },
    { header: "Period", cell: (row) => row.period_start ? `${format(new Date(row.period_start), "dd/MM/yy")} – ${row.period_end ? format(new Date(row.period_end), "dd/MM/yy") : "?"}` : "—" },
    { header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
  ];

  const scheduledPayments = payments.filter(p => p.period_start);

  return (
    <div className="space-y-4">
      {(pendingCount > 0 || failedCount > 0) && (
        <div className="flex items-center gap-3 flex-wrap">
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
              <Clock className="w-4 h-4" /><span><strong>{pendingCount}</strong> payment{pendingCount > 1 ? "s" : ""} pending approval</span>
            </div>
          )}
          {failedCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertTriangle className="w-4 h-4" /><span><strong>{failedCount}</strong> failed payment{failedCount > 1 ? "s" : ""}</span>
            </div>
          )}
        </div>
      )}

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Total Paid</p>
          <p className="text-lg font-bold text-emerald-600">£{totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-card border rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Pending / Approved</p>
          <p className="text-lg font-bold text-amber-600">£{totalPending.toLocaleString()}</p>
        </div>
        <div className="bg-card border rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Total Transactions</p>
          <p className="text-lg font-bold">{payments.length}</p>
        </div>
      </div>

      <Tabs defaultValue="all">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <TabsList>
            <TabsTrigger value="all">All Payments</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-48" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            {canExport && <Button variant="outline" size="sm" onClick={handleExport}><Download className="w-4 h-4 mr-1.5" />Export</Button>}
            {canEdit && (
              <Button onClick={() => { setEditingPayment(null); setShowForm(true); }} size="sm">
                <Plus className="w-4 h-4 mr-1.5" /> Record Payment
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="all" className="mt-3">
          <DataTable columns={columns} data={filtered} isLoading={isLoading} onRowClick={setSelectedPayment} emptyMessage="No payments found" />
        </TabsContent>

        <TabsContent value="scheduled" className="mt-3">
          <DataTable columns={scheduledColumns} data={scheduledPayments} isLoading={isLoading} onRowClick={setSelectedPayment} emptyMessage="No scheduled payments" />
        </TabsContent>
      </Tabs>

      <Dialog open={showForm} onOpenChange={v => { setShowForm(v); if (!v) setEditingPayment(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingPayment ? "Edit Payment" : "Record Payment"}</DialogTitle></DialogHeader>
          <PaymentForm
            payment={editingPayment}
            budgets={budgets}
            cases={cases}
            onSubmit={(data) => editingPayment ? updateMutation.mutate({ id: editingPayment.id, data }) : createMutation.mutate(data)}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedPayment} onOpenChange={v => { if (!v) setSelectedPayment(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Payment Detail</DialogTitle></DialogHeader>
          {selectedPayment && <PaymentDetail payment={selectedPayment} onEdit={() => openEdit(selectedPayment)} onStatusChange={(status) => updateMutation.mutate({ id: selectedPayment.id, data: { ...selectedPayment, status } })} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
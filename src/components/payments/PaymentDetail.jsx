import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusBadge from "@/components/shared/StatusBadge";
import { Pencil } from "lucide-react";
import { format } from "date-fns";

const STATUSES = ["Pending", "Approved", "Processed", "Paid", "Failed", "Refunded", "On Hold"];

function Field({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

export default function PaymentDetail({ payment, onEdit, onStatusChange }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusBadge status={payment.status} />
          <span className="text-xl font-bold">£{(payment.amount || 0).toLocaleString()}</span>
        </div>
        <Button size="sm" variant="outline" onClick={onEdit}><Pencil className="w-3.5 h-3.5 mr-1" />Edit</Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Patient" value={payment.patient_name} />
        <Field label="Reference" value={payment.reference} />
        <Field label="Payment Type" value={payment.payment_type} />
        <Field label="Payment Method" value={payment.payment_method} />
        <Field label="Payee" value={payment.payee_name} />
        <Field label="Payee Type" value={payment.payee_type} />
        <Field label="Invoice Number" value={payment.invoice_number} />
        <Field label="Payment Date" value={payment.payment_date ? format(new Date(payment.payment_date), "dd/MM/yyyy") : null} />
        {payment.period_start && <Field label="Period Start" value={format(new Date(payment.period_start), "dd/MM/yyyy")} />}
        {payment.period_end && <Field label="Period End" value={format(new Date(payment.period_end), "dd/MM/yyyy")} />}
      </div>

      {payment.notes && <div className="bg-muted/40 rounded-lg p-3 text-sm">{payment.notes}</div>}

      {/* Status changer */}
      <div className="border rounded-lg p-3 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Update Status</p>
        <Select value={payment.status} onValueChange={onStatusChange}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>
    </div>
  );
}
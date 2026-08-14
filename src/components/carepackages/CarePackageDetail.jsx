import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/shared/StatusBadge";
import { Pencil } from "lucide-react";
import { format } from "date-fns";

function Field({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

export default function CarePackageDetail({ pkg, onEdit, contracts }) {
  const contract = contracts?.find(c => c.id === pkg.contract_id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusBadge status={pkg.status} />
          {pkg.delivery_method && <Badge variant="outline">{pkg.delivery_method}</Badge>}
        </div>
        <Button size="sm" variant="outline" onClick={onEdit}><Pencil className="w-3.5 h-3.5 mr-1" />Edit</Button>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-1">Provider</p>
        <p className="text-base font-semibold">{pkg.provider_name}</p>
        {contract && (
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span>Contract: {contract.contract_reference}</span>
            {contract.cqc_rating && <Badge variant="outline" className="text-xs">{contract.cqc_rating}</Badge>}
          </div>
        )}
      </div>

      <div className="bg-muted/40 rounded-lg p-3">
        <p className="text-xs font-semibold text-muted-foreground mb-1">Services</p>
        <p className="text-sm">{pkg.services}</p>
      </div>

      {/* Cost summary */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-muted/40 rounded-lg p-2">
          <p className="text-xs text-muted-foreground">Hours/Week</p>
          <p className="text-sm font-bold">{pkg.hours_per_week || "—"}h</p>
        </div>
        <div className="bg-muted/40 rounded-lg p-2">
          <p className="text-xs text-muted-foreground">Weekly Cost</p>
          <p className="text-sm font-bold">£{(pkg.weekly_cost || 0).toLocaleString()}</p>
        </div>
        <div className="bg-muted/40 rounded-lg p-2">
          <p className="text-xs text-muted-foreground">Annual Cost</p>
          <p className="text-sm font-bold">£{(pkg.annual_cost || 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Patient" value={pkg.patient_name} />
        <Field label="Start Date" value={pkg.start_date ? format(new Date(pkg.start_date), "dd/MM/yyyy") : null} />
        <Field label="End Date" value={pkg.end_date ? format(new Date(pkg.end_date), "dd/MM/yyyy") : null} />
        {pkg.contract_reference && <Field label="Contract Ref" value={pkg.contract_reference} />}
      </div>

      {pkg.notes && (
        <div className="bg-muted/40 rounded-lg p-3 text-sm text-muted-foreground">{pkg.notes}</div>
      )}
    </div>
  );
}
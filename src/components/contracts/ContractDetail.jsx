import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/shared/StatusBadge";
import { Pencil, Phone, Mail } from "lucide-react";
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

export default function ContractDetail({ contract, packages, onEdit }) {
  const linkedPackages = packages?.filter(p => p.contract_id === contract.id) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-base font-semibold">{contract.provider_name}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={contract.status} />
            {contract.cqc_rating && <StatusBadge status={contract.cqc_rating} />}
            {contract.provider_type && <Badge variant="outline" className="text-xs">{contract.provider_type}</Badge>}
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={onEdit}><Pencil className="w-3.5 h-3.5 mr-1" />Edit</Button>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-muted/40 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Hourly Rate</p>
          <p className="text-sm font-bold">{contract.hourly_rate ? `£${contract.hourly_rate}/hr` : "—"}</p>
        </div>
        <div className="bg-muted/40 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Daily Rate</p>
          <p className="text-sm font-bold">{contract.daily_rate ? `£${contract.daily_rate}/day` : "—"}</p>
        </div>
        <div className="bg-primary/5 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Annual Value</p>
          <p className="text-sm font-bold text-primary">{contract.annual_value ? `£${contract.annual_value.toLocaleString()}` : "—"}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Contract Reference" value={contract.contract_reference} />
        <Field label="Service Type" value={contract.service_type} />
        <Field label="Start Date" value={contract.start_date ? format(new Date(contract.start_date), "dd/MM/yyyy") : null} />
        <Field label="End Date" value={contract.end_date ? format(new Date(contract.end_date), "dd/MM/yyyy") : null} />
        {contract.notice_period_days && <Field label="Notice Period" value={`${contract.notice_period_days} days`} />}
      </div>

      {(contract.contact_name || contract.contact_email || contract.contact_phone) && (
        <div className="border rounded-lg p-3 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Contact</p>
          {contract.contact_name && <p className="text-sm font-medium">{contract.contact_name}</p>}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {contract.contact_email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{contract.contact_email}</span>}
            {contract.contact_phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{contract.contact_phone}</span>}
          </div>
        </div>
      )}

      {contract.terms && (
        <div className="bg-muted/40 rounded-lg p-3">
          <p className="text-xs font-semibold text-muted-foreground mb-1">Key Terms</p>
          <p className="text-sm">{contract.terms}</p>
        </div>
      )}

      {linkedPackages.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Linked Care Packages ({linkedPackages.length})</p>
          <div className="space-y-1">
            {linkedPackages.map(p => (
              <div key={p.id} className="flex items-center justify-between px-3 py-2 bg-muted/30 rounded text-sm">
                <span className="font-medium">{p.patient_name}</span>
                <div className="flex items-center gap-2">
                  {p.weekly_cost && <span className="text-xs font-mono">£{p.weekly_cost}/wk</span>}
                  <StatusBadge status={p.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
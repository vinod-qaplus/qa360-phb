import React from "react";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/shared/StatusBadge";
import { Pencil } from "lucide-react";
import { format } from "date-fns";

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium mt-0.5">{value || "—"}</p>
    </div>
  );
}

export default function PatientDetail({ patient, onEdit }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StatusBadge
            status={patient.eligibility_status || patient.status || "Active"}
          />
          <StatusBadge status={patient.eligibility_category} />
        </div>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Field label="NHS Number" value={patient.nhs_number} />
        <Field
          label="Name"
          value={`${patient.title || ""} ${patient.first_name} ${patient.last_name}`}
        />
        <Field
          label="Date of Birth"
          value={
            patient.date_of_birth
              ? format(new Date(patient.date_of_birth), "dd/MM/yyyy")
              : null
          }
        />
        <Field label="Gender" value={patient.gender} />
        <Field label="Phone" value={patient.phone} />
        <Field label="Email" value={patient.email} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Address"
          value={[
            patient.address_line_1,
            patient.address_line_2,
            patient.city,
            patient.postcode,
          ]
            .filter(Boolean)
            .join(", ")}
        />
        <Field
          label="GP"
          value={[patient.gp_name, patient.gp_practice]
            .filter(Boolean)
            .join(" — ")}
        />
        <Field label="CCG/ICB Area" value={patient.ccg_area} />
      </div>

      {patient.next_of_kin_name && (
        <div className="grid grid-cols-3 gap-4 pt-3 border-t">
          <Field label="Next of Kin" value={patient.next_of_kin_name} />
          <Field label="NOK Phone" value={patient.next_of_kin_phone} />
          <Field
            label="Relationship"
            value={patient.next_of_kin_relationship}
          />
        </div>
      )}

      {patient.notes && (
        <div className="pt-3 border-t">
          <Field label="Notes" value={patient.notes} />
        </div>
      )}
    </div>
  );
}

import React, { useState, useMemo } from "react";

import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import PatientForm from "@/components/patients/PatientForm";
import PatientDetail from "@/components/patients/PatientDetail";
import { format } from "date-fns";
/* added a hook here  */
import {
  usePatients,
  useCreatePatient,
  useUpdatePatient,
} from "@/hooks/usePatients";

// function PatientDetail({ patient, onEdit }) {
//   if (!patient) return null;
//   return (
//     <div className="space-y-4">
//       <div>
//         <div className="text-sm text-muted-foreground">NHS Number</div>
//         <div className="font-mono">{patient.nhs_number}</div>
//       </div>
//       <div>
//         <div className="text-sm text-muted-foreground">Name</div>
//         <div className="font-medium">
//           {patient.title ? `${patient.title} ` : ""}
//           {patient.first_name} {patient.last_name}
//         </div>
//       </div>
//       <div>
//         <div className="text-sm text-muted-foreground">Date of Birth</div>
//         <div>
//           {patient.date_of_birth
//             ? format(new Date(patient.date_of_birth), "dd/MM/yyyy")
//             : "—"}
//         </div>
//       </div>
//       <div>
//         <div className="text-sm text-muted-foreground">Postcode</div>
//         <div>{patient.postcode || "—"}</div>
//       </div>
//       <div className="pt-2">
//         <Button size="sm" onClick={onEdit}>
//           Edit
//         </Button>
//       </div>
//     </div>
//   );
// }

export default function Patients() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editingPatient, setEditingPatient] = useState(null);

  console.log("Patients component mounted");
  const query = usePatients();

  console.log(query);

  const { data: patients = [], isLoading, isFetching, status, error } = query;

  // const { data: patients = [], isLoading } = usePatients();
  const createMutation = useCreatePatient();
  const updateMutation = useUpdatePatient();

  const filtered = useMemo(() => {
    const term = search.toLowerCase();

    return patients.filter((p) => {
      return (
        !term ||
        p.first_name?.toLowerCase().includes(term) ||
        p.last_name?.toLowerCase().includes(term) ||
        p.nhs_number?.includes(term)
      );
    });
  }, [patients, search]);

  const columns = [
    {
      header: "NHS Number",
      accessorKey: "nhs_number",
      cell: (row) => (
        <span className="font-mono text-xs">{row.nhs_number}</span>
      ),
    },
    {
      header: "Name",
      cell: (row) => (
        <span className="font-medium">
          {row.title ? `${row.title} ` : ""}
          {row.first_name} {row.last_name}
        </span>
      ),
    },
    {
      header: "DOB",
      cell: (row) =>
        row.date_of_birth
          ? format(new Date(row.date_of_birth), "dd/MM/yyyy")
          : "—",
    },
    {
      header: "Eligibility",
      cell: (row) => (
        <span className="text-xs">{row.eligibility_category || "—"}</span>
      ),
    },
    {
      header: "Status",
      cell: (row) => (
        <StatusBadge status={row.eligibility_status || row.status} />
      ),
    },
    { header: "Postcode", accessorKey: "postcode" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or NHS number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          onClick={() => {
            setEditingPatient(null);
            setShowForm(true);
          }}
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add Patient
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        onRowClick={setSelectedPatient}
        emptyMessage="No patients found.."
      />

      {/* Create/Edit Dialog */}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPatient ? "Edit Patient" : "Add New Patient"}
            </DialogTitle>
          </DialogHeader>

          <PatientForm
            patient={editingPatient}
            onSubmit={(data) => {
              if (editingPatient) {
                updateMutation.mutate(
                  {
                    id: editingPatient.id,
                    data,
                  },
                  {
                    onSuccess: () => {
                      setShowForm(false);
                      setEditingPatient(null);
                      setSelectedPatient(null);
                    },
                  },
                );
              } else {
                createMutation.mutate(data, {
                  onSuccess: () => {
                    setShowForm(false);
                  },
                });
              }
            }}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
      {/* <<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */}
      {/* <<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */}
      {/* <<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */}
      {/* <<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */}
      {/* <<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */}
      {/* <<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */}
      {/* <<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */}

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedPatient}
        onOpenChange={() => setSelectedPatient(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <PatientDetail
              patient={selectedPatient}
              onEdit={() => {
                setEditingPatient(selectedPatient);
                setSelectedPatient(null);
                setShowForm(true);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

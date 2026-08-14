import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import { format, isValid } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PatientDetail from "@/components/patients/PatientDetail";
import PatientForm from "@/components/patients/PatientForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  usePatients,
  useUpdatePatient, // Implemented below
} from "@/hooks/usePatients";

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editingPatient, setEditingPatient] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const ref = useRef(null);

  const queryClient = useQueryClient();
  const { data: patients = [] } = usePatients();

  // Use your real custom hook if it exists, otherwise use the mutation below
  const updateMutation = useUpdatePatient
    ? useUpdatePatient()
    : useMutation({
        mutationFn: async ({ id, data }) => {
          // Replace this with your actual API PUT/PATCH call, e.g.,
          // return axios.put(`/api/v1/patients/${id}`, data);
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["patients"] });
          setShowForm(false);
          setEditingPatient(null);
          setSelectedPatient(null);
        },
      });

  // 1. Memoize filtered results to prevent heavy recalculations on unrelated renders
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (term.length < 1) return [];

    return patients
      .filter((p) => {
        const fullName =
          `${p.first_name || ""} ${p.last_name || ""}`.toLowerCase();

        // Safe Date Parsing
        let dobStr = "";
        if (p.date_of_birth) {
          const dateObj = new Date(p.date_of_birth);
          if (isValid(dateObj)) {
            dobStr = format(dateObj, "dd/MM/yyyy");
          }
        }

        const address = [p.address_line_1, p.address_line_2, p.city, p.postcode]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return (
          fullName.includes(term) ||
          (p.nhs_number || "").includes(term) ||
          dobStr.includes(term) ||
          address.includes(term)
        );
      })
      .slice(0, 8);
  }, [query, patients]);

  // 2. Control search dropdown visibility directly based on query/results instead of an effect
  const isDropdownVisible = open && results.length > 0;

  // Sync open state when the query changes (auto-open dropdown if we have query)
  useEffect(() => {
    if (query.trim().length > 0) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [query]);

  // Click outside to close handler
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (patient) => {
    setSelectedPatient(patient);
    setQuery("");
    setOpen(false);
  };

  return (
    <>
      <div ref={ref} className="relative">
        <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-white/60" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search and press ENTER"
          className="pl-6 pr-2 h-6 text-[11px] bg-white/90 border-0 rounded-sm w-44 focus:outline-none focus:ring-1 focus:ring-white/50 text-gray-800 placeholder:text-gray-500"
        />

        {isDropdownVisible && (
          <div className="absolute top-7 left-0 bg-white border border-gray-200 shadow-xl rounded-sm z-50 w-[560px]">
            {/* Header row */}
            <div className="grid grid-cols-[2fr_1fr_1fr_2fr] bg-[hsl(213,55%,72%)] text-white text-[11px] font-semibold px-2 py-1">
              <span>Name</span>
              <span>DOB</span>
              <span>NHS</span>
              <span>Address</span>
            </div>

            {results.map((p, i) => {
              const name = `${p.title ? p.title + " " : ""}${p.first_name} ${p.last_name}`;

              let dobStr = "—";
              if (p.date_of_birth) {
                const dateObj = new Date(p.date_of_birth);
                if (isValid(dateObj)) {
                  dobStr = format(dateObj, "dd/MM/yyyy");
                }
              }

              const address = [
                p.address_line_1,
                p.address_line_2,
                p.city,
                p.postcode,
              ]
                .filter(Boolean)
                .join(", ");

              return (
                <button
                  key={p.id}
                  onClick={() => handleSelect(p)}
                  className={`w-full text-left grid grid-cols-[2fr_1fr_1fr_2fr] px-2 py-1 text-[11px] text-gray-800 hover:bg-primary hover:text-white transition-colors border-b border-gray-100 last:border-0 ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <span className="truncate">{name}</span>
                  <span>{dobStr}</span>
                  <span className="font-mono">{p.nhs_number || "—"}</span>
                  <span className="truncate">{address || "—"}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Patient Detail Dialog */}
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

      {/* Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
          </DialogHeader>
          {editingPatient && (
            <PatientForm
              patient={editingPatient}
              onSubmit={(data) =>
                updateMutation.mutate({ id: editingPatient.id, data })
              }
              isLoading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

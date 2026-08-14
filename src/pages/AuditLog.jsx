import React, { useState } from "react";
//import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Shield,
  Download,
  ChevronDown,
  ChevronUp,
  Lock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import { format } from "date-fns";
import { exportToCSV } from "@/utils/csvExport";
import { useRoleGuard } from "@/hooks/useRoleGuard";

const ACTIONS = [
  "All",
  "Create",
  "Update",
  "Delete",
  "View",
  "Approve",
  "Reject",
  "Submit",
  "Export",
  "Login",
  "Status Change",
];
const ENTITY_TYPES = [
  "All",
  "Patient",
  "PHBCase",
  "CarePlan",
  "Budget",
  "BudgetItem",
  "Payment",
  "Contract",
  "CarePackage",
  "Review",
  "FundingSource",
  "User",
];

function DiffCell({ row }) {
  const [open, setOpen] = useState(false);
  const hasDiff = row.previous_value || row.new_value;
  if (!hasDiff)
    return (
      <span className="text-xs text-muted-foreground truncate block max-w-xs">
        {row.description}
      </span>
    );

  let prev = null,
    next = null;
  try {
    prev = row.previous_value ? JSON.parse(row.previous_value) : null;
  } catch {
    prev = row.previous_value;
  }
  try {
    next = row.new_value ? JSON.parse(row.new_value) : null;
  } catch {
    next = row.new_value;
  }

  return (
    <div>
      <div className="flex items-center gap-1">
        <span className="text-xs truncate max-w-[200px]">
          {row.description}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpen((o) => !o);
          }}
          className="text-muted-foreground hover:text-foreground ml-1"
        >
          {open ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>
      {open && (
        <div className="mt-1.5 flex gap-2 text-xs">
          {prev && (
            <div className="bg-red-50 border border-red-200 rounded px-2 py-1 max-w-[160px]">
              <p className="text-red-400 font-semibold mb-0.5">Before</p>
              <pre className="whitespace-pre-wrap text-red-700">
                {typeof prev === "object"
                  ? JSON.stringify(prev, null, 2)
                  : String(prev)}
              </pre>
            </div>
          )}
          {next && (
            <div className="bg-emerald-50 border border-emerald-200 rounded px-2 py-1 max-w-[160px]">
              <p className="text-emerald-400 font-semibold mb-0.5">After</p>
              <pre className="whitespace-pre-wrap text-emerald-700">
                {typeof next === "object"
                  ? JSON.stringify(next, null, 2)
                  : String(next)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AuditLog() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All");
  const [entityFilter, setEntityFilter] = useState("All");
  const { canViewAudit } = useRoleGuard();

  function todoFunction() {}

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["auditLogs"],
    queryFn: () => todoFunction(), // base44.entities.AuditLog.list("-created_date", 1000),
  });

  const filtered = logs.filter((l) => {
    const matchSearch =
      !search ||
      l.user_email?.toLowerCase().includes(search.toLowerCase()) ||
      l.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.description?.toLowerCase().includes(search.toLowerCase()) ||
      l.entity_reference?.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === "All" || l.action === actionFilter;
    const matchEntity =
      entityFilter === "All" || l.entity_type === entityFilter;
    return matchSearch && matchAction && matchEntity;
  });

  const handleExport = () => {
    exportToCSV(
      filtered.map((l) => ({
        Timestamp: l.created_date
          ? format(new Date(l.created_date), "dd/MM/yyyy HH:mm:ss")
          : "",
        User: l.user_name || l.user_email || "",
        Role: l.user_role || "",
        Action: l.action || "",
        "Entity Type": l.entity_type || "",
        Reference: l.entity_reference || "",
        Description: l.description || "",
        "IP Address": l.ip_address || "",
      })),
      "audit_report",
    );
  };

  const columns = [
    {
      header: "Timestamp",
      cell: (row) => (
        <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
          {row.created_date
            ? format(new Date(row.created_date), "dd/MM/yy HH:mm:ss")
            : "—"}
        </span>
      ),
    },
    {
      header: "User",
      cell: (row) => (
        <div>
          <p className="text-sm font-medium">
            {row.user_name || row.user_email}
          </p>
          <p className="text-xs text-muted-foreground">{row.user_role}</p>
        </div>
      ),
    },
    { header: "Action", cell: (row) => <StatusBadge status={row.action} /> },
    {
      header: "Entity",
      cell: (row) => (
        <span className="text-xs font-medium">{row.entity_type || "—"}</span>
      ),
    },
    {
      header: "Reference",
      cell: (row) => (
        <span className="text-xs font-mono text-muted-foreground">
          {row.entity_reference || "—"}
        </span>
      ),
    },
    { header: "Details", cell: (row) => <DiffCell row={row} /> },
  ];

  if (!canViewAudit) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <Lock className="w-10 h-10 text-muted-foreground opacity-40" />
        <h3 className="font-semibold text-lg">Access Restricted</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          The audit log is only accessible to administrators. Contact your
          system administrator if you need access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header stats */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {["Create", "Update", "Approve", "Delete", "Export"].map((action) => {
          const count = logs.filter((l) => l.action === action).length;
          return (
            <div
              key={action}
              className="bg-card border rounded-lg p-3 text-center cursor-pointer hover:border-primary/40 transition-colors"
              onClick={() =>
                setActionFilter(actionFilter === action ? "All" : action)
              }
            >
              <p className="text-xs text-muted-foreground">{action}</p>
              <p className="text-lg font-bold">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Filters & Export */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users, descriptions, references..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACTIONS.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Entity type" />
          </SelectTrigger>
          <SelectContent>
            {ENTITY_TYPES.map((e) => (
              <SelectItem key={e} value={e}>
                {e}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 ml-auto">
          <Badge variant="secondary">{filtered.length} entries</Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={filtered.length === 0}
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export Report
          </Button>
        </div>
      </div>

      {!isLoading && filtered.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No audit entries"
          description="Audit log entries will appear here as actions are performed."
        />
      ) : (
        <DataTable columns={columns} data={filtered} isLoading={isLoading} />
      )}
    </div>
  );
}

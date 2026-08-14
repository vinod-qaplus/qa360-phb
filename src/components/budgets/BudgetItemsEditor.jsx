import React, { useState } from "react";
// import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StatusBadge from "@/components/shared/StatusBadge";

const CATEGORIES = [
  "Personal Assistant",
  "Care Agency",
  "Equipment",
  "Therapy",
  "Transport",
  "Respite",
  "Training",
  "Accommodation",
  "Other",
];
const FREQUENCIES = [
  "One-off",
  "Daily",
  "Weekly",
  "Fortnightly",
  "Monthly",
  "Quarterly",
  "Annual",
];
const ITEM_STATUSES = ["Proposed", "Approved", "Active", "Paused", "Ended"];

const emptyItem = {
  category: "Personal Assistant",
  description: "",
  unit_cost: 0,
  units: 1,
  frequency: "Weekly",
  total_cost: 0,
  status: "Proposed",
};

export default function BudgetItemsEditor({ budgetId, caseId }) {
  const [newItem, setNewItem] = useState({ ...emptyItem });
  const queryClient = useQueryClient();

  const { data: items = [] } = useQuery({
    queryKey: ["budgetItems", budgetId],
    queryFn: () => base44.entities.BudgetItem.filter({ budget_id: budgetId }),
  });

  const createMutation = useMutation({
    mutationFn: (data) =>
      base44.entities.BudgetItem.create({
        ...data,
        budget_id: budgetId,
        case_id: caseId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgetItems", budgetId] });
      setNewItem({ ...emptyItem });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BudgetItem.delete(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["budgetItems", budgetId] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BudgetItem.update(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["budgetItems", budgetId] }),
  });

  const setNew = (field, value) => {
    setNewItem((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "unit_cost" || field === "units") {
        updated.total_cost =
          (parseFloat(field === "unit_cost" ? value : prev.unit_cost) || 0) *
          (parseFloat(field === "units" ? value : prev.units) || 0);
      }
      return updated;
    });
  };

  const totalBudgeted = items.reduce((s, i) => s + (i.total_cost || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Budget Line Items</p>
        <span className="text-xs text-muted-foreground">
          Total: <strong>£{totalBudgeted.toLocaleString()}</strong>
        </span>
      </div>

      {/* Existing items */}
      {items.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          {items.map((item, i) => (
            <div
              key={item.id}
              className={`flex items-center gap-2 px-3 py-2 text-sm ${i % 2 === 0 ? "bg-muted/20" : ""}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">
                    {item.description}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({item.category})
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span>
                    {item.units} × £{item.unit_cost} {item.frequency}
                  </span>
                </div>
              </div>
              <StatusBadge status={item.status} />
              <span className="font-mono text-xs font-semibold">
                £{(item.total_cost || 0).toLocaleString()}
              </span>
              <button
                onClick={() => deleteMutation.mutate(item.id)}
                className="text-muted-foreground hover:text-red-500 transition-colors p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new item */}
      <div className="border border-dashed rounded-lg p-3 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground">
          Add Line Item
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Select
              value={newItem.category}
              onValueChange={(v) => setNew("category", v)}
            >
              <SelectTrigger className="text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select
              value={newItem.status}
              onValueChange={(v) => setNew("status", v)}
            >
              <SelectTrigger className="text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ITEM_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Input
          placeholder="Description *"
          value={newItem.description}
          onChange={(e) => setNew("description", e.target.value)}
          className="text-sm h-8"
        />
        <div className="grid grid-cols-4 gap-2">
          <Input
            type="number"
            placeholder="Units"
            min="0"
            value={newItem.units || ""}
            onChange={(e) => setNew("units", parseFloat(e.target.value) || 0)}
            className="text-xs h-8"
          />
          <Input
            type="number"
            placeholder="Unit cost"
            min="0"
            step="0.01"
            value={newItem.unit_cost || ""}
            onChange={(e) =>
              setNew("unit_cost", parseFloat(e.target.value) || 0)
            }
            className="text-xs h-8"
          />
          <div>
            <Select
              value={newItem.frequency}
              onValueChange={(v) => setNew("frequency", v)}
            >
              <SelectTrigger className="text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCIES.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center">
            <span className="text-xs font-mono font-semibold">
              £{(newItem.total_cost || 0).toFixed(2)}
            </span>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            if (newItem.description) createMutation.mutate(newItem);
          }}
          disabled={!newItem.description || createMutation.isPending}
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Item
        </Button>
      </div>
    </div>
  );
}

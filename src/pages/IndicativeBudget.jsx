import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Calculator, Plus, Trash2, Download, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { exportToCSV } from "@/utils/csvExport";

const CARE_RATE_PRESETS = [
  { label: "Personal Assistant (Standard)", category: "Personal Assistant", hourly_rate: 12.5, vat: false },
  { label: "Personal Assistant (Enhanced)", category: "Personal Assistant", hourly_rate: 15.0, vat: false },
  { label: "Domiciliary Care Agency", category: "Care Agency", hourly_rate: 22.5, vat: false },
  { label: "Specialist Care Agency", category: "Care Agency", hourly_rate: 28.0, vat: false },
  { label: "Community Nursing (NHS)", category: "Therapy", hourly_rate: 45.0, vat: false },
  { label: "Physiotherapy", category: "Therapy", hourly_rate: 55.0, vat: false },
  { label: "Occupational Therapy", category: "Therapy", hourly_rate: 50.0, vat: false },
  { label: "Respite Care (daily)", category: "Respite", daily_rate: 180, vat: false },
  { label: "Equipment / Assistive Tech", category: "Equipment", one_off: true, vat: true },
  { label: "Transport", category: "Transport", hourly_rate: 18.0, vat: false },
];

const FREQUENCIES = [
  { label: "per hour", key: "hourly", multiplier: 1 },
  { label: "per day", key: "daily", multiplier: 8 },
  { label: "per week", key: "weekly", multiplier: 40 },
  { label: "one-off", key: "oneoff", multiplier: 0 },
];

const PERIODS = [
  { label: "52 weeks (annual)", weeks: 52 },
  { label: "26 weeks (6 months)", weeks: 26 },
  { label: "12 weeks (3 months)", weeks: 12 },
  { label: "4 weeks (1 month)", weeks: 4 },
];

let nextId = 1;

export default function IndicativeBudget() {
  const [patientName, setPatientName] = useState("");
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [period, setPeriod] = useState(52);
  const [contingency, setContingency] = useState(5);
  const [items, setItems] = useState([]);

  const { data: cases = [] } = useQuery({
    queryKey: ["cases"],
    queryFn: () => base44.entities.PHBCase.list("-created_date", 200),
  });

  const addPreset = (preset) => {
    const rate = preset.hourly_rate || preset.daily_rate || 0;
    setItems(prev => [...prev, {
      id: nextId++,
      description: preset.label,
      category: preset.category,
      rate,
      hours_per_week: preset.one_off ? 0 : (preset.daily_rate ? 5 : 10),
      frequency: preset.daily_rate ? "daily" : preset.one_off ? "oneoff" : "hourly",
      one_off_amount: preset.one_off ? 500 : 0,
      manual_total: null,
    }]);
  };

  const addBlank = () => {
    setItems(prev => [...prev, {
      id: nextId++,
      description: "New item",
      category: "Other",
      rate: 0,
      hours_per_week: 0,
      frequency: "hourly",
      one_off_amount: 0,
      manual_total: null,
    }]);
  };

  const updateItem = (id, field, value) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (id) => setItems(prev => prev.filter(item => item.id !== id));

  const calcItemAnnual = (item) => {
    if (item.manual_total !== null) return item.manual_total;
    if (item.frequency === "oneoff") return item.one_off_amount || 0;
    const hoursPerWeek = item.hours_per_week || 0;
    const rate = item.rate || 0;
    const freqObj = FREQUENCIES.find(f => f.key === item.frequency);
    const weeklyHours = freqObj?.key === "daily" ? hoursPerWeek * 5 : freqObj?.key === "weekly" ? hoursPerWeek : hoursPerWeek;
    const weeklyAmount = freqObj?.key === "daily" ? hoursPerWeek * rate / 8 * 5 : rate * hoursPerWeek;
    return weeklyAmount * period;
  };

  const subtotal = items.reduce((s, i) => s + calcItemAnnual(i), 0);
  const contingencyAmount = subtotal * (contingency / 100);
  const total = subtotal + contingencyAmount;

  const handleCaseSelect = (caseId) => {
    setSelectedCaseId(caseId);
    const c = cases.find(x => x.id === caseId);
    if (c) setPatientName(c.patient_name);
  };

  const handleExport = () => {
    exportToCSV([
      ...items.map(item => ({
        Description: item.description,
        Category: item.category,
        "Rate (£)": item.rate,
        "Hrs/Wk or Units": item.hours_per_week,
        Frequency: item.frequency,
        "Annual Cost (£)": calcItemAnnual(item).toFixed(2),
      })),
      { Description: "Subtotal", Category: "", "Rate (£)": "", "Hrs/Wk or Units": "", Frequency: "", "Annual Cost (£)": subtotal.toFixed(2) },
      { Description: `Contingency (${contingency}%)`, Category: "", "Rate (£)": "", "Hrs/Wk or Units": "", Frequency: "", "Annual Cost (£)": contingencyAmount.toFixed(2) },
      { Description: "TOTAL INDICATIVE BUDGET", Category: "", "Rate (£)": "", "Hrs/Wk or Units": "", Frequency: "", "Annual Cost (£)": total.toFixed(2) },
    ], `indicative_budget_${patientName.replace(/\s+/g, "_") || "new"}`);
  };

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">Indicative Budget Calculator</h2>
            <p className="text-xs text-muted-foreground">Estimate care costs using NHS-standard rates</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={items.length === 0}><Download className="w-4 h-4 mr-1.5" />Export</Button>
        </div>
      </div>

      {/* Config */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <Label>PHB Case (optional)</Label>
              <Select value={selectedCaseId} onValueChange={handleCaseSelect}>
                <SelectTrigger><SelectValue placeholder="Select case" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>None</SelectItem>
                  {cases.map(c => <SelectItem key={c.id} value={c.id}>{c.patient_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Patient Name</Label>
              <Input value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Enter name" />
            </div>
            <div>
              <Label>Budget Period</Label>
              <Select value={String(period)} onValueChange={v => setPeriod(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PERIODS.map(p => <SelectItem key={p.weeks} value={String(p.weeks)}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Contingency %</Label>
              <Input type="number" min="0" max="30" step="1" value={contingency} onChange={e => setContingency(Number(e.target.value) || 0)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preset buttons */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2">Quick Add (NHS Rate Presets)</p>
        <div className="flex flex-wrap gap-2">
          {CARE_RATE_PRESETS.map(preset => (
            <Button key={preset.label} variant="outline" size="sm" onClick={() => addPreset(preset)} className="text-xs h-7">
              <Plus className="w-3 h-3 mr-1" />{preset.label}
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={addBlank} className="text-xs h-7 border-dashed">
            <Plus className="w-3 h-3 mr-1" />Custom Item
          </Button>
        </div>
      </div>

      {/* Line items */}
      {items.length > 0 && (
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm">Care Cost Items</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            {items.map(item => {
              const annual = calcItemAnnual(item);
              return (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center py-2 border-b last:border-0">
                  <div className="col-span-3">
                    <Input value={item.description} onChange={e => updateItem(item.id, "description", e.target.value)} className="text-xs h-8" />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" min="0" step="0.5" placeholder="£/rate" value={item.rate || ""} onChange={e => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)} className="text-xs h-8" />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" min="0" step="0.5" placeholder={item.frequency === "oneoff" ? "total £" : "hrs/wk"} value={item.frequency === "oneoff" ? (item.one_off_amount || "") : (item.hours_per_week || "")} onChange={e => updateItem(item.id, item.frequency === "oneoff" ? "one_off_amount" : "hours_per_week", parseFloat(e.target.value) || 0)} className="text-xs h-8" />
                  </div>
                  <div className="col-span-2">
                    <Select value={item.frequency} onValueChange={v => updateItem(item.id, "frequency", v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{FREQUENCIES.map(f => <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 flex items-center gap-1">
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      title="Override total — leave blank for auto-calculation"
                      placeholder={`£${Math.round(annual).toLocaleString()}`}
                      value={item.manual_total !== null ? item.manual_total : ""}
                      onChange={e => updateItem(item.id, "manual_total", e.target.value === "" ? null : parseFloat(e.target.value) || 0)}
                      className="text-xs h-8 font-mono"
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-red-500 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
            <div className="text-xs text-muted-foreground pt-1">
              Columns: Description · Rate (£) · Hrs/wk or units · Frequency · Annual total (override)
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {items.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">{patientName || "Patient"} — Indicative Budget</p>
                <p className="text-xs text-muted-foreground">{PERIODS.find(p => p.weeks === period)?.label} · {items.length} line items</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Subtotal</p>
                  <p className="text-lg font-bold">£{Math.round(subtotal).toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Contingency ({contingency}%)</p>
                  <p className="text-sm font-semibold text-amber-600">+£{Math.round(contingencyAmount).toLocaleString()}</p>
                </div>
                <div className="text-center bg-primary rounded-lg px-4 py-2">
                  <p className="text-xs text-primary-foreground/70">Total Indicative</p>
                  <p className="text-xl font-bold text-primary-foreground">£{Math.round(total).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Per-category breakdown */}
            {items.length > 1 && (
              <div className="mt-4 pt-3 border-t border-primary/10">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Breakdown by Category</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(items.reduce((acc, item) => {
                    acc[item.category] = (acc[item.category] || 0) + calcItemAnnual(item);
                    return acc;
                  }, {})).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
                    <Badge key={cat} variant="secondary" className="text-xs">
                      {cat}: £{Math.round(amt).toLocaleString()} ({Math.round(amt / subtotal * 100)}%)
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {items.length === 0 && (
        <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-xl">
          <Calculator className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Add care items using the presets above or create a custom item</p>
        </div>
      )}
    </div>
  );
}
import React, { useState } from "react";
// import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Download,
  BarChart2,
  PoundSterling,
  ClipboardCheck,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import StatusBadge from "@/components/shared/StatusBadge";
import { exportToCSV } from "@/utils/csvExport";

const CHART_COLORS = [
  "#2563eb",
  "#16a34a",
  "#d97706",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#be185d",
  "#65a30d",
];

export default function Reports() {
  const { data: cases = [] } = useQuery({
    queryKey: ["cases"],
    queryFn: () => base44.entities.PHBCase.list("-created_date", 500),
  });
  const { data: budgets = [] } = useQuery({
    queryKey: ["budgets"],
    queryFn: () => base44.entities.Budget.list("-created_date", 500),
  });
  const { data: payments = [] } = useQuery({
    queryKey: ["payments"],
    queryFn: () => base44.entities.Payment.list("-created_date", 500),
  });
  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews"],
    queryFn: () => base44.entities.Review.list("-created_date", 500),
  });
  const { data: patients = [] } = useQuery({
    queryKey: ["patients"],
    queryFn: () => base44.entities.Patient.list("-created_date", 500),
  });

  // ── Report 1: Active PHBs by Category ────────────────────────────────────
  const activeCases = cases.filter((c) => c.status !== "Closed");
  const byCategory = Object.entries(
    activeCases.reduce((acc, c) => {
      acc[c.eligibility_category || "Unknown"] =
        (acc[c.eligibility_category || "Unknown"] || 0) + 1;
      return acc;
    }, {}),
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const exportCategoryReport = () =>
    exportToCSV(
      byCategory.map((r) => ({
        "Eligibility Category": r.name,
        "Active Cases": r.value,
      })),
      "report_active_phbs_by_category",
    );

  // ── Report 2: Budget vs Spend ─────────────────────────────────────────────
  const budgetVsSpend = budgets
    .filter((b) => b.approved_amount > 0)
    .map((b) => ({
      patient: b.patient_name || "Unknown",
      approved: b.approved_amount || 0,
      spent: b.spent_amount || 0,
      remaining: b.remaining_amount || 0,
      utilisation: b.approved_amount
        ? Math.round(((b.spent_amount || 0) / b.approved_amount) * 100)
        : 0,
      status: b.status,
    }))
    .sort((a, b) => b.utilisation - a.utilisation);

  const exportBudgetReport = () =>
    exportToCSV(
      budgetVsSpend.map((r) => ({
        Patient: r.patient,
        "Approved (£)": r.approved,
        "Spent (£)": r.spent,
        "Remaining (£)": r.remaining,
        "Utilisation %": r.utilisation,
        Status: r.status,
      })),
      "report_budget_vs_spend",
    );

  // ── Report 3: Outcomes ────────────────────────────────────────────────────
  const completedReviews = reviews.filter(
    (r) => r.status === "Completed" && r.outcomes_met,
  );
  const outcomesCounts = completedReviews.reduce((acc, r) => {
    acc[r.outcomes_met] = (acc[r.outcomes_met] || 0) + 1;
    return acc;
  }, {});
  const outcomesData = Object.entries(outcomesCounts).map(([name, value]) => ({
    name,
    value,
  }));
  const satisfactionCounts = completedReviews.reduce((acc, r) => {
    if (r.patient_satisfaction)
      acc[r.patient_satisfaction] = (acc[r.patient_satisfaction] || 0) + 1;
    return acc;
  }, {});
  const satisfactionData = Object.entries(satisfactionCounts).map(
    ([name, value]) => ({ name, value }),
  );

  const exportOutcomesReport = () =>
    exportToCSV(
      completedReviews.map((r) => ({
        Patient: r.patient_name,
        "Review Type": r.review_type,
        "Review Date": r.review_date,
        "Outcomes Met": r.outcomes_met,
        "Patient Satisfaction": r.patient_satisfaction || "",
        "Action Required": r.action_required || "",
        Recommendations: r.recommendations || "",
      })),
      "report_outcomes",
    );

  // ── Report 4: Cost Efficiency ─────────────────────────────────────────────
  const highCostThreshold = 60000;
  const costEfficiency = budgets
    .filter((b) => b.approved_amount > 0)
    .map((b) => {
      const caseData = cases.find((c) => c.id === b.case_id);
      const caseReviews = reviews.filter(
        (r) => r.case_id === b.case_id && r.status === "Completed",
      );
      const metCount = caseReviews.filter(
        (r) => r.outcomes_met === "Fully Met" || r.outcomes_met === "Exceeded",
      ).length;
      const outcomeScore = caseReviews.length
        ? Math.round((metCount / caseReviews.length) * 100)
        : null;
      return {
        patient: b.patient_name,
        approved: b.approved_amount,
        spent: b.spent_amount || 0,
        utilisation: Math.round(
          ((b.spent_amount || 0) / b.approved_amount) * 100,
        ),
        outcomeScore,
        reviews: caseReviews.length,
        highCost: b.approved_amount > highCostThreshold,
        category: caseData?.eligibility_category || "Unknown",
        status: b.status,
      };
    })
    .sort((a, b) => b.approved - a.approved);

  const exportEfficiencyReport = () =>
    exportToCSV(
      costEfficiency.map((r) => ({
        Patient: r.patient,
        Category: r.category,
        "Approved (£)": r.approved,
        "Spent (£)": r.spent,
        "Utilisation %": r.utilisation,
        "Outcome Score %": r.outcomeScore ?? "N/A",
        "Reviews Completed": r.reviews,
        "High Cost": r.highCost ? "Yes" : "No",
        Status: r.status,
      })),
      "report_cost_efficiency",
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Reports</h2>
          <p className="text-sm text-muted-foreground">
            NHS PHB management reporting suite
          </p>
        </div>
        <Badge variant="secondary">
          Data as of {new Date().toLocaleDateString("en-GB")}
        </Badge>
      </div>

      <Tabs defaultValue="category">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="category">
            <BarChart2 className="w-3.5 h-3.5 mr-1" />
            PHBs by Category
          </TabsTrigger>
          <TabsTrigger value="budget">
            <PoundSterling className="w-3.5 h-3.5 mr-1" />
            Budget vs Spend
          </TabsTrigger>
          <TabsTrigger value="outcomes">
            <ClipboardCheck className="w-3.5 h-3.5 mr-1" />
            Outcomes
          </TabsTrigger>
          <TabsTrigger value="efficiency">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            Cost Efficiency
          </TabsTrigger>
        </TabsList>

        {/* ── Report 1: PHBs by Category ── */}
        <TabsContent value="category" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">
                Active PHBs by Eligibility Category
              </h3>
              <p className="text-xs text-muted-foreground">
                {activeCases.length} active cases across {byCategory.length}{" "}
                categories
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={exportCategoryReport}>
              <Download className="w-4 h-4 mr-1.5" />
              Export CSV
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-4">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={byCategory}
                    margin={{ top: 0, right: 10, left: -10, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      angle={-30}
                      textAnchor="end"
                    />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#2563eb" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  {byCategory.map((row, i) => (
                    <div
                      key={row.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-sm"
                          style={{
                            backgroundColor:
                              CHART_COLORS[i % CHART_COLORS.length],
                          }}
                        />
                        <span className="text-sm">{row.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-muted rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-primary"
                            style={{
                              width: `${Math.round((row.value / activeCases.length) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold w-6 text-right">
                          {row.value}
                        </span>
                        <span className="text-xs text-muted-foreground w-10 text-right">
                          {Math.round((row.value / activeCases.length) * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Breakdown by status */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm">Case Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {[
                  "Referral",
                  "Assessment",
                  "Care Planning",
                  "Approval",
                  "Active",
                  "Under Review",
                  "Suspended",
                  "Closed",
                ].map((s) => {
                  const count = cases.filter((c) => c.status === s).length;
                  return (
                    <div
                      key={s}
                      className="text-center p-2 bg-muted/30 rounded-lg"
                    >
                      <StatusBadge status={s} />
                      <p className="text-lg font-bold mt-1">{count}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Report 2: Budget vs Spend ── */}
        <TabsContent value="budget" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Budget vs Spend</h3>
              <p className="text-xs text-muted-foreground">
                {budgetVsSpend.length} budgets with approved amounts
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={exportBudgetReport}>
              <Download className="w-4 h-4 mr-1.5" />
              Export CSV
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Card className="text-center p-4">
              <p className="text-xs text-muted-foreground">Total Approved</p>
              <p className="text-xl font-bold text-primary">
                £
                {budgetVsSpend
                  .reduce((s, r) => s + r.approved, 0)
                  .toLocaleString()}
              </p>
            </Card>
            <Card className="text-center p-4">
              <p className="text-xs text-muted-foreground">Total Spent</p>
              <p className="text-xl font-bold">
                £
                {budgetVsSpend
                  .reduce((s, r) => s + r.spent, 0)
                  .toLocaleString()}
              </p>
            </Card>
            <Card className="text-center p-4">
              <p className="text-xs text-muted-foreground">Total Remaining</p>
              <p className="text-xl font-bold text-emerald-600">
                £
                {budgetVsSpend
                  .reduce((s, r) => s + r.remaining, 0)
                  .toLocaleString()}
              </p>
            </Card>
          </div>

          {budgetVsSpend.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={budgetVsSpend.slice(0, 10)}
                    margin={{ top: 0, right: 10, left: -10, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="patient"
                      tick={{ fontSize: 10 }}
                      angle={-30}
                      textAnchor="end"
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip formatter={(v) => `£${v.toLocaleString()}`} />
                    <Bar
                      dataKey="approved"
                      name="Approved"
                      fill="#93c5fd"
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar
                      dataKey="spent"
                      name="Spent"
                      fill="#2563eb"
                      radius={[2, 2, 0, 0]}
                    />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="text-left pb-2">Patient</th>
                    <th className="text-right pb-2">Approved</th>
                    <th className="text-right pb-2">Spent</th>
                    <th className="text-right pb-2">Remaining</th>
                    <th className="text-center pb-2">Utilisation</th>
                    <th className="text-center pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetVsSpend.map((row, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 font-medium">{row.patient}</td>
                      <td className="py-2 text-right font-mono text-xs">
                        £{row.approved.toLocaleString()}
                      </td>
                      <td className="py-2 text-right font-mono text-xs">
                        £{row.spent.toLocaleString()}
                      </td>
                      <td
                        className={`py-2 text-right font-mono text-xs ${row.remaining < 0 ? "text-red-600 font-semibold" : "text-emerald-600"}`}
                      >
                        £{row.remaining.toLocaleString()}
                      </td>
                      <td className="py-2 text-center">
                        <div className="flex items-center gap-1 justify-center">
                          <div className="w-16 bg-muted rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${row.utilisation >= 90 ? "bg-red-500" : row.utilisation >= 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                              style={{
                                width: `${Math.min(100, row.utilisation)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs">{row.utilisation}%</span>
                        </div>
                      </td>
                      <td className="py-2 text-center">
                        <StatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Report 3: Outcomes ── */}
        <TabsContent value="outcomes" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Outcomes Tracking</h3>
              <p className="text-xs text-muted-foreground">
                {completedReviews.length} completed reviews
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={exportOutcomesReport}>
              <Download className="w-4 h-4 mr-1.5" />
              Export CSV
            </Button>
          </div>

          {completedReviews.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground text-sm">
                No completed reviews with outcomes data yet.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm">Outcomes Met</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  {outcomesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={outcomesData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={75}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          labelLine={false}
                        >
                          {outcomesData.map((_, i) => (
                            <Cell
                              key={i}
                              fill={CHART_COLORS[i % CHART_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4">
                      No outcomes data
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm">
                    Patient Satisfaction
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  {satisfactionData.length > 0 ? (
                    <div className="space-y-2 pt-2">
                      {satisfactionData.map((item, i) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm">{item.name}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-muted rounded-full h-2">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${(item.value / completedReviews.length) * 100}%`,
                                  backgroundColor:
                                    CHART_COLORS[i % CHART_COLORS.length],
                                }}
                              />
                            </div>
                            <span className="text-sm font-semibold w-5">
                              {item.value}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4">
                      No satisfaction data
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm">Review Detail</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="text-left pb-2">Patient</th>
                    <th className="text-left pb-2">Type</th>
                    <th className="text-left pb-2">Outcomes</th>
                    <th className="text-left pb-2">Satisfaction</th>
                    <th className="text-left pb-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {completedReviews.map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 font-medium">{r.patient_name}</td>
                      <td className="py-2 text-xs text-muted-foreground">
                        {r.review_type}
                      </td>
                      <td className="py-2">
                        <StatusBadge status={r.outcomes_met} />
                      </td>
                      <td className="py-2 text-xs">
                        {r.patient_satisfaction || "—"}
                      </td>
                      <td className="py-2 text-xs">
                        {r.action_required || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Report 4: Cost Efficiency ── */}
        <TabsContent value="efficiency" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Cost Efficiency</h3>
              <p className="text-xs text-muted-foreground">
                Spend vs outcomes — high cost threshold: £
                {highCostThreshold.toLocaleString()}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={exportEfficiencyReport}
            >
              <Download className="w-4 h-4 mr-1.5" />
              Export CSV
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Card className="text-center p-4">
              <p className="text-xs text-muted-foreground">High Cost Cases</p>
              <p className="text-xl font-bold text-red-600">
                {costEfficiency.filter((r) => r.highCost).length}
              </p>
            </Card>
            <Card className="text-center p-4">
              <p className="text-xs text-muted-foreground">Avg. Budget</p>
              <p className="text-xl font-bold">
                £
                {costEfficiency.length
                  ? Math.round(
                      costEfficiency.reduce((s, r) => s + r.approved, 0) /
                        costEfficiency.length,
                    ).toLocaleString()
                  : 0}
              </p>
            </Card>
            <Card className="text-center p-4">
              <p className="text-xs text-muted-foreground">Avg. Utilisation</p>
              <p className="text-xl font-bold">
                {costEfficiency.length
                  ? Math.round(
                      costEfficiency.reduce((s, r) => s + r.utilisation, 0) /
                        costEfficiency.length,
                    )
                  : 0}
                %
              </p>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="text-left pb-2">Patient</th>
                    <th className="text-left pb-2">Category</th>
                    <th className="text-right pb-2">Approved</th>
                    <th className="text-right pb-2">Spent</th>
                    <th className="text-center pb-2">Utilisation</th>
                    <th className="text-center pb-2">Outcome Score</th>
                    <th className="text-center pb-2">Flag</th>
                  </tr>
                </thead>
                <tbody>
                  {costEfficiency.map((row, i) => (
                    <tr
                      key={i}
                      className={`border-b last:border-0 ${row.highCost ? "bg-red-50/50" : ""}`}
                    >
                      <td className="py-2 font-medium">{row.patient}</td>
                      <td className="py-2 text-xs text-muted-foreground">
                        {row.category}
                      </td>
                      <td className="py-2 text-right font-mono text-xs">
                        £{row.approved.toLocaleString()}
                      </td>
                      <td className="py-2 text-right font-mono text-xs">
                        £{row.spent.toLocaleString()}
                      </td>
                      <td className="py-2 text-center">
                        <div className="flex items-center gap-1 justify-center">
                          <div className="w-12 bg-muted rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${row.utilisation >= 90 ? "bg-red-500" : row.utilisation >= 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                              style={{
                                width: `${Math.min(100, row.utilisation)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs">{row.utilisation}%</span>
                        </div>
                      </td>
                      <td className="py-2 text-center text-xs">
                        {row.outcomeScore !== null ? (
                          <span
                            className={`font-semibold ${row.outcomeScore >= 75 ? "text-emerald-600" : row.outcomeScore >= 50 ? "text-amber-600" : "text-red-600"}`}
                          >
                            {row.outcomeScore}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            No reviews
                          </span>
                        )}
                      </td>
                      <td className="py-2 text-center">
                        {row.highCost && (
                          <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-medium">
                            High Cost
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

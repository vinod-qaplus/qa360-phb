import React, { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  Users,
  Home,
  PoundSterling,
  BarChart2,
  Settings,
} from "lucide-react";
import GlobalSearch from "./GlobalSearch";
import { useQuery } from "@tanstack/react-query";
import { isPast, parseISO } from "date-fns";
import { useAuth } from "@/lib/AuthContext";

const routes = [
  { path: "/", label: "Dashboard", parent: null },
  { path: "/patients", label: "Patients", parent: "Clinical" },
  { path: "/cases", label: "PHB Cases", parent: "Clinical" },
  { path: "/care-plans", label: "Care Plans", parent: "Clinical" },
  { path: "/reviews", label: "Reviews", parent: "Clinical" },
  { path: "/budgets", label: "Budgets", parent: "Finance" },
  { path: "/payments", label: "Payments", parent: "Finance" },
  { path: "/care-packages", label: "Care Packages", parent: "Finance" },
  { path: "/contracts", label: "Contracts", parent: "Finance" },
  { path: "/indicative-budget", label: "Budget Calculator", parent: "Finance" },
  { path: "/reports", label: "Reports", parent: "Admin" },
  { path: "/audit-log", label: "Audit Log", parent: "Admin" },
];

const dropdownMenus = [
  {
    label: "Patients",
    color: "bg-blue-800 hover:bg-blue-700",
    icon: Users,
    items: [
      { label: "PHB Cases", path: "/cases" },
      { label: "Patients", path: "/patients" },
      { label: "Care Plans", path: "/care-plans" },
      { label: "Reviews", path: "/reviews" },
    ],
  },
  {
    label: "Provider",
    color: "bg-blue-700 hover:bg-blue-600",
    icon: Home,
    items: [
      { label: "Care Packages", path: "/care-packages" },
      { label: "Contracts", path: "/contracts" },
    ],
  },
  {
    label: "Finance",
    color: "bg-blue-600 hover:bg-blue-500",
    icon: PoundSterling,
    items: [
      { label: "Budgets", path: "/budgets" },
      { label: "Payments", path: "/payments" },
      { label: "Budget Calculator", path: "/indicative-budget" },
    ],
  },
  {
    label: "Reports",
    color: "bg-blue-500 hover:bg-blue-400",
    icon: BarChart2,
    items: [
      { label: "Dashboard", path: "/dashboard" },
      { label: "Reports", path: "/reports" },
    ],
  },
  {
    label: "System",
    color: "bg-blue-300 hover:bg-blue-200",
    icon: Settings,
    items: [{ label: "Audit Log", path: "/audit-log" }],
  },
];

function NavDropdown({ label, color, icon: Icon, items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`${color} text-white text-[11px] font-semibold px-3 h-9 rounded-sm transition-colors flex items-center gap-2 shadow-sm`}
      >
        {Icon && <Icon className="w-4.5 h-4.5 shrink-0" />}
        {label}
        <ChevronDown className="w-4.5 h-4.5 opacity-80" />
      </button>
      {open && (
        <div className="absolute top-7 left-0 bg-white border border-gray-200 shadow-lg rounded-sm z-50 min-w-[160px]">
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className="block px-3 py-1.5 text-[12px] text-gray-800 hover:bg-primary hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function UserMenu({ user }) {
  const [open, setOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleChangePassword = async () => {
    setPwError("");
    if (!newPassword || newPassword.length < 6) {
      setPwError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }
    try {
      // await base44.auth.changePassword(oldPassword, newPassword);
      setShowChangePassword(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      setPwError(e.message || "Failed to change password.");
    }
  };

  const displayName = user?.full_name || user?.email || "User";

  return (
    <>
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 bg-black/20 hover:bg-black/30 rounded-sm px-2 h-6 transition-colors"
        >
          <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-[9px] font-bold text-white shrink-0">
            {displayName[0].toUpperCase()}
          </div>
          <span className="text-[11px] text-white font-medium hidden sm:block">
            {displayName}
          </span>
          <ChevronDown className="w-3 h-3 text-white/80" />
        </button>
        {open && (
          <div className="absolute top-7 right-0 bg-white border border-gray-200 shadow-lg rounded-sm z-50 min-w-[160px]">
            <div className="px-3 py-2 border-b border-gray-100 text-[11px] text-gray-500 font-medium truncate">
              {displayName}
            </div>
            <button
              onClick={() => {
                setOpen(false);
                setShowChangePassword(true);
              }}
              className="w-full text-left px-3 py-1.5 text-[12px] text-gray-800 hover:bg-primary hover:text-white transition-colors"
            >
              Change Password
            </button>
            <button className="w-full text-left px-3 py-1.5 text-[12px] text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100">
              Log Out
            </button>
          </div>
        )}
      </div>

      {showChangePassword && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center">
          <div className="bg-white rounded-sm shadow-xl w-80 p-5">
            <h3 className="text-[13px] font-semibold text-gray-800 mb-4">
              Change Password
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-gray-600 block mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-sm px-2 h-7 text-[12px] focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-600 block mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-sm px-2 h-7 text-[12px] focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-600 block mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-sm px-2 h-7 text-[12px] focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              {pwError && <p className="text-[11px] text-red-600">{pwError}</p>}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowChangePassword(false);
                  setPwError("");
                }}
                className="px-3 h-7 text-[12px] border border-gray-300 rounded-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                className="px-3 h-7 text-[12px] bg-primary text-white rounded-sm hover:bg-primary/90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function TopBar() {
  const location = useLocation();
  //const { user } = useAuth();

  const route = routes.find((r) =>
    r.path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(r.path),
  ) || { label: "QA360 PHB", parent: null };

  // const { data: cases = [] } = useQuery({
  //   queryKey: ["cases"],
  //   queryFn: () => base44.entities.PHBCase.list("-created_date", 100),
  // });
  // const { data: budgets = [] } = useQuery({
  //   queryKey: ["budgets"],
  //   queryFn: () => base44.entities.Budget.list("-created_date", 100),
  // });
  // const { data: plans = [] } = useQuery({
  //   queryKey: ["carePlans"],
  //   queryFn: () => base44.entities.CarePlan.list("-created_date", 50),
  // });

  async function fetchCases() {
    // TODO: Replace with your actual endpoint
    // const response = await fetch(`${API_BASE_URL}/cases?sort=-created_date&limit=100`);
    // if (!response.ok) throw new Error("Failed to fetch cases");
    // return response.json();

    // Temporary mock data to keep the UI populated
    return [
      {
        id: "1",
        name: "Mock Case A",
        status: "Active",
        created_date: "2026-01-01",
      },
      {
        id: "2",
        name: "Mock Case B",
        status: "Pending",
        created_date: "2026-01-02",
      },
    ];
  }

  async function fetchBudgets() {
    // TODO: Replace with your actual endpoint
    // const response = await fetch(`${API_BASE_URL}/budgets?sort=-created_date&limit=100`);
    // if (!response.ok) throw new Error("Failed to fetch budgets");
    // return response.json();

    return [];
  }

  async function fetchCarePlans() {
    // TODO: Replace with your actual endpoint
    // const response = await fetch(`${API_BASE_URL}/care-plans?sort=-created_date&limit=50`);
    // if (!response.ok) throw new Error("Failed to fetch care plans");
    // return response.json();

    return [];
  }

  // 1. Fetch Cases
  const { data: cases = [], isLoading: isLoadingCases } = useQuery({
    queryKey: ["cases"],
    queryFn: fetchCases,
  });

  // 2. Fetch Budgets
  const { data: budgets = [], isLoading: isLoadingBudgets } = useQuery({
    queryKey: ["budgets"],
    queryFn: fetchBudgets,
  });

  // 3. Fetch Care Plans
  const { data: plans = [], isLoading: isLoadingPlans } = useQuery({
    queryKey: ["carePlans"],
    queryFn: fetchCarePlans,
  });

  const alertCount =
    cases.filter(
      (c) =>
        c.next_review_date &&
        isPast(parseISO(c.next_review_date)) &&
        c.status === "Active",
    ).length +
    budgets.filter(
      (b) => b.approved_amount > 0 && (b.spent_amount || 0) > b.approved_amount,
    ).length +
    plans.filter((p) => p.status === "Submitted" || p.status === "Under Review")
      .length +
    budgets.filter(
      (b) => b.status === "Submitted" || b.status === "Under Review",
    ).length;

  return (
    <header className="h-10 border-b border-black/20 flex items-center justify-between px-3 shrink-0 sticky top-0 z-30 bg-topnav text-topnav-foreground">
      {/* Left: search */}
      <div className="flex items-center gap-2">
        <GlobalSearch />
      </div>

      {/* Centre: dropdown nav buttons */}
      <div className="flex items-center gap-1">
        {dropdownMenus.map((menu) => (
          <NavDropdown
            key={menu.label}
            label={menu.label}
            color={menu.color}
            icon={menu.icon}
            items={menu.items}
          />
        ))}
      </div>

      {/* Right: alerts + user */}
      <div className="flex items-center gap-2">
        {alertCount > 0 && (
          <Link to="/">
            <div className="relative">
              <Bell className="w-4 h-4 text-white/80" />
              <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                {alertCount > 9 ? "9+" : alertCount}
              </span>
            </div>
          </Link>
        )}
        {/* <UserMenu user={user} /> */}
      </div>
    </header>
  );
}

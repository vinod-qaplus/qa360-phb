import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// import PageNotFound from "./lib/PageNotFound";
// import { AuthProvider, useAuth } from "@/lib/AuthContext";
// import UserNotRegisteredError from "@/components/UserNotRegisteredError";

import { AuthProvider, useAuth } from "@/lib/AuthContext"; // Import Auth Context
import { ProtectedRoute } from "./components/ProtectedRoute"; // Import Protected Wrapper

import AppLayout from "./components/layout/AppLayout";
// import Dashboard from "./pages/Dashboard.jsx";
import Patients from "./pages/Patients";
import Cases from "./pages/Cases";

import { useNavigate } from "react-router-dom";
import { setNavigate } from "./utils/navigationRef";
import ErrorPage from "./components/ErrorPage";

import { Login } from "./pages/login";

import { useEffect } from "react";

function AppRoutes() {
  //This pattern is used to make React Router's navigate() function available outside React components, such as in your Axios interceptor.
  //This stores React Router's navigation function in your global variable.
  //1. Component renders
  const navigate = useNavigate(); // its a function
  //run after render
  //run only when navigate changes
  //avoids unnecessary assignments
  useEffect(() => {
    console.log("navigate trigered!");
    setNavigate(navigate);
  }, [navigate]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/error" element={<ErrorPage />} />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/Patients" element={<Patients />} />
        <Route path="/cases" element={<Cases />} />

        {/* Your other authenticated routes go here */}
      </Route>
    </Routes>
  );
}

{
  ("");
  ("");
  ("");
  ("");
  ("");
}

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;

{
  ("");
  ("");
  ("");
  ("");
  ("");
}
/* 


2. Create a client instance outside of the component
const queryClient = new QueryClient();

import Cases from "./pages/Cases.jsx";
import CarePlans from "./pages/CarePlans.jsx";
import Budgets from "./pages/Budgets.jsx";
import Payments from "./pages/Payments.jsx";
import CarePackages from "./pages/CarePackages.jsx";
import Reports from "./pages/Reports.jsx";
import IndicativeBudget from "./pages/IndicativeBudget.jsx";
import Contracts from "./pages/Contracts.jsx";
import Reviews from "./pages/Reviews";
import AuditLog from "./pages/AuditLog";



<Router>
        <Routes>
          <Route element={<AppLayout />}></Route>
          <Route>
            <Route path="/" element={<Patients />} />

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/cases" element={<Cases />} />
            <Route path="/care-plans" element={<CarePlans />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/care-packages" element={<CarePackages />} />
            <Route path="/contracts" element={<Contracts />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/audit-log" element={<AuditLog />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/indicative-budget" element={<IndicativeBudget />} />

            <Route path="/error" element={<ErrorPage />} />
          </Route>

          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Router> */

/*

React Component
    │
    ▼
useNavigate()
    │
    ▼
navigate function
    │
    ▼
setNavigate(navigate)
    │
    ▼
global variable navigateFn
    │
    ▼
Axios interceptor
    │
    ▼
navigateTo("/error")
    │
    ▼
navigateFn("/error")
    │
    ▼
React Router navigates
*/

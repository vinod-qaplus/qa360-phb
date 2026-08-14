import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

export default function ErrorPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const error = location.state;

  console.log("error");

  console.log(error);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="max-w-md">
        {/* Visual Anchor / Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 mb-6">
          <AlertTriangle size={40} />
        </div>

        {/* Text Content */}
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {error?.message || "Our servers encountered a temporary issue."}
        </h1>
        <p className="mt-4 text-base text-gray-500">
          {error?.message || "Our servers encountered a temporary issue."}
        </p>

        {error?.status && (
          <p className="mt-2 text-sm text-red-600">
            Error Code: {error.status}
          </p>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition"
          >
            <RotateCcw size={16} />
            Try Again
          </button>

          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition"
          >
            <Home size={16} />
            Go to Homepage
          </button>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./hooks/useAuth";
import { ToastProvider } from "./hooks/useToast";
import { LanguageProvider } from "./hooks/useLanguage";
import Layout from "./layouts/Layout";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Applications from "./pages/Applications";
import ApplicationDetail from "./pages/ApplicationDetail";
import OfficerDetail from "./pages/OfficerDetail";
import { Documents, Reports, Analytics, Audit, Helpdesk } from "./pages/Lists";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route element={<Layout />}>
                <Route path="/workspace" element={<Dashboard />} />
                <Route path="/portal" element={<Home />} />
                <Route path="/applications" element={<Applications title="Application Management" />} />
                <Route path="/scrutiny" element={<Applications title="EoA Scrutiny" scrutiny />} />
                <Route path="/applications/:id" element={<ApplicationDetail />} />
                <Route path="/officers/:id" element={<OfficerDetail />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/audit" element={<Audit />} />
                <Route path="/helpdesk" element={<Helpdesk />} />
              </Route>
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);

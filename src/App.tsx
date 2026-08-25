import { Routes, Route } from "react-router-dom";
import AppShell from "./components/Layout/AppShell";
import DashboardPage from "./pages/DashboardPage";
import PropertyListingPage from "./pages/PropertyListingPage";
import LeadCapturePage from "./pages/LeadCapturePage";
import UserProfilePage from "./pages/UserProfilePage";
import OfficeBranchPage from "./pages/OfficeBranchPage";
import SiteVisitPage from "./pages/SiteVisitPage";
import InvoicePage from "./pages/InvoicePage";
import AdminMasterPage from "./pages/admin/AdminMasterPage";
import AdminPendingPage from "./pages/admin/AdminPendingPage";
import AdminMergePage from "./pages/admin/AdminMergePage";
import AdminAuditLogPage from "./pages/admin/AdminAuditLogPage";
import AdminSearchPage from "./pages/admin/AdminSearchPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/entry/property-listing" element={<PropertyListingPage />} />
        <Route path="/entry/lead" element={<LeadCapturePage />} />
        <Route path="/entry/profile" element={<UserProfilePage />} />
        <Route path="/entry/branch" element={<OfficeBranchPage />} />
        <Route path="/entry/site-visit" element={<SiteVisitPage />} />
        <Route path="/entry/invoice" element={<InvoicePage />} />
        <Route path="/admin/master" element={<AdminMasterPage />} />
        <Route path="/admin/pending" element={<AdminPendingPage />} />
        <Route path="/admin/merge" element={<AdminMergePage />} />
        <Route path="/admin/audit-log" element={<AdminAuditLogPage />} />
        <Route path="/admin/search" element={<AdminSearchPage />} />
      </Route>
    </Routes>
  );
}

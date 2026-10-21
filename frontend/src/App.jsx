import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicOnlyRoute from "./components/auth/PublicOnlyRoute";
import AppShell from "./layouts/AppShell";
import AutomationPage from "./pages/AutomationPage";
import ContactsPage from "./pages/ContactsPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import NotificationsPage from "./pages/NotificationsPage";
import EmailPage from "./pages/EmailPage";
import PipelinePage from "./pages/PipelinePage";
import ReportsPage from "./pages/ReportsPage";
import SearchPage from "./pages/SearchPage";
import TasksPage from "./pages/TasksPage";
import UsersPage from "./pages/UsersPage";
import DocumentsPage from "./pages/DocumentsPage";

const App = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/emails" element={<EmailPage />} />
          <Route path="/pipeline" element={<PipelinePage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route element={<ProtectedRoute allowedRoles={["admin", "manager"]} />}>
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/automation" element={<AutomationPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/users" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Navigate to="/login" replace />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;

import { Routes, Route, Navigate } from "react-router-dom";
import { api } from "./lib/api";
import { AppShell } from "./components/AppShell";
import { LoginPage } from "./routes/Login";
import { AdminIndex } from "./routes/admin/Index";
import { AdminUsers } from "./routes/admin/Users";
import { AdminRegisterTrainer } from "./routes/admin/RegisterTrainer";
import { AdminPreview } from "./routes/admin/Preview";
import { AdminSettings } from "./routes/admin/Settings";
import { CoachIndex } from "./routes/coach/Index";
import { CoachSwimmers } from "./routes/coach/Swimmers";
import { PublicLayout } from "./components/PublicLayout";
import { Home } from "./routes/Home";
import { Features } from "./routes/Features";
import { Roles } from "./routes/Roles";
import { Register } from "./routes/Register";

function PrivateRoute({ children, role }: { children: React.ReactNode; role: "admin" | "director" | "coach" | "swimmer" }) {
  if (!api.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <AppShell role={role}>{children}</AppShell>;
}

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route path="/roles" element={<Roles />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />

      <Route path="/app/admin" element={
        <PrivateRoute role="admin">
          <AdminIndex />
        </PrivateRoute>
      } />
      <Route path="/app/admin/users" element={
        <PrivateRoute role="admin">
          <AdminUsers />
        </PrivateRoute>
      } />
      <Route path="/app/admin/register-trainer" element={
        <PrivateRoute role="admin">
          <AdminRegisterTrainer />
        </PrivateRoute>
      } />
      <Route path="/app/admin/preview" element={
        <PrivateRoute role="admin">
          <AdminPreview />
        </PrivateRoute>
      } />
      <Route path="/app/admin/settings" element={
        <PrivateRoute role="admin">
          <AdminSettings />
        </PrivateRoute>
      } />

      <Route path="/app/coach" element={
        <PrivateRoute role="coach">
          <CoachIndex />
        </PrivateRoute>
      } />
      <Route path="/app/coach/swimmers" element={
        <PrivateRoute role="coach">
          <CoachSwimmers />
        </PrivateRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

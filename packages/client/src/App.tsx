import { Routes, Route, Navigate } from "react-router-dom";
import { RootLayout } from "@/components/layout/root-layout";
import { ProtectedRoute } from "@/components/protected-route";
import { LoginPage } from "@/pages/login-page";
import { RegisterPage } from "@/pages/register-page";
import { DashboardPage } from "@/pages/dashboard-page";

function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        {/* Redirect root to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Route>
    </Routes>
  );
}

export default App;

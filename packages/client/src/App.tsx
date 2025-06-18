import { LocationProvider, Router, Route, useLocation } from "preact-iso";
import { RootLayout } from "@/components/layout/root-layout";
import { ProtectedRoute } from "@/components/protected-route";
import { LoginPage } from "@/pages/login-page";
import { RegisterPage } from "@/pages/register-page";
import { DashboardPage } from "@/pages/dashboard-page";

// Component to handle the root redirect
// Component to handle the root redirect
function HomeRedirect() {
  const location = useLocation();
  if (location.path === "/") {
    location.route("/dashboard", true);
  }
  return null; // Or a loading spinner, etc.
}

function App() {
  return (
    <LocationProvider>
      <RootLayout>
        <Router>
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <ProtectedRoute path="/dashboard" component={DashboardPage} />
          {/* Handles "/" and other unmatched routes initially redirecting to dashboard or a 404 */}
          <Route default component={HomeRedirect} /> 
        </Router>
      </RootLayout>
    </LocationProvider>
  );
}

export default App;

import { render } from "preact";
import { QueryClient, QueryClientProvider } from "@preact-signals/query";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "@/context/auth-context";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "sonner";

const queryClient = new QueryClient();

render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <App />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>,
  document.getElementById("root")!
);

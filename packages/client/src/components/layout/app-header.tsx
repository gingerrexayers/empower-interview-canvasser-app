import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import logo from "@/assets/EmpowerProject_Logo.png";
import favicon from "@/assets/favicon.png";

export function AppHeader() {
  const { logout } = useAuth();

  return (
    <header className="relative flex items-center justify-between bg-primary p-4 px-4 md:px-8">
      {/* Logo on the left */}
      <div className="flex items-center">
        <img
          src={logo}
          alt="Empower Project Logo"
          className="mr-3 hidden h-10 w-auto md:block"
        />
        <img
          src={favicon}
          alt="Empower Project Logo Small"
          className="mr-3 block h-8 w-8 md:hidden"
        />
        {/* Mobile CANVASSER text (left-aligned with logo) */}
        <span className="text-3xl font-extrabold uppercase text-primary-foreground md:hidden">
          CANVASSER
        </span>
      </div>

      {/* Desktop CANVASSER text (centered absolutely) */}
      <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="text-3xl font-extrabold uppercase text-primary-foreground">
          CANVASSER
        </span>
      </div>

      {/* Logout button on the right */}
      <Button
        onClick={logout}
        variant="secondary"
        className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
      >
        Logout
      </Button>
    </header>
  );
}

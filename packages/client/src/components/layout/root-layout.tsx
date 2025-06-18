import type { ComponentChildren } from "preact";
import { Toaster } from "@/components/ui/sonner";

interface RootLayoutProps {
  children: ComponentChildren;
}

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {children}
      <Toaster />
    </main>
  );
}

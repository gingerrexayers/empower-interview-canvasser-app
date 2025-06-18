import { useState, useEffect } from "preact/hooks";
import type { ChangeEvent } from "preact/compat";
import { useVoters } from "@/hooks/use-voters";
import { useDebounce } from "@/hooks/use-debounce";
import api from "@/api";
import { toast } from "sonner";
import { Download, Search } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { VoterList } from "@/components/voters/voter-list";
import { CreateVoterDialog } from "@/components/voters/create-voter-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardPage() {
  useEffect(() => {
    const handleClickCapture = (event: MouseEvent) => {
      const targetElement = event.target as HTMLElement;
      const anchorElement = targetElement.closest(
        'a[data-download-link="true"]'
      );

      if (
        anchorElement &&
        anchorElement.getAttribute("href")?.startsWith("blob:")
      ) {
        event.stopPropagation();
        // We specifically DO NOT call event.preventDefault() here,
        // as we want the default browser action (downloading the blob) to proceed.
      }
    };

    document.addEventListener("click", handleClickCapture, { capture: true });

    return () => {
      document.removeEventListener("click", handleClickCapture, {
        capture: true,
      });
    };
  }, []); // Empty dependency array ensures this runs only once on mount/unmount

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { data: voters, isLoading, isError } = useVoters(debouncedSearchTerm);

  const handleExportCsv = async () => {
    try {
      const response = await api.get("/voters/export/csv", {
        responseType: "blob", // Important to handle binary data
      });
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "voters.csv");
      link.setAttribute("target", "_blank"); // Prevent router interference
      link.setAttribute("rel", "external"); // Further hint for router to ignore this link
      link.setAttribute("native", ""); // Tell preact-iso/router to ignore this link
      link.setAttribute("data-download-link", "true"); // Custom attribute for our capture listener
      document.body.appendChild(link);

      setTimeout(() => {
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 0);
      toast.success("Voter data exported successfully!");
    } catch (error) {
      console.error("Failed to export CSV:", error);
      toast.error("Failed to export voter data.");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <AppHeader className="flex-shrink-0" />
      <div className="flex-grow overflow-y-auto container mx-auto p-4 md:p-8">
        <Card className="flex flex-col h-full">
          <CardHeader className="grid grid-cols-[1fr_auto] lg:grid-cols-[auto_1fr_auto] gap-x-4 gap-y-3 p-4 items-center flex-shrink-0">
            <CardTitle data-cy="dashboard-title">Your Voters</CardTitle>

            <div className="w-full col-span-2 lg:col-span-1 lg:col-start-2 lg:row-start-1">
              <div className="relative w-full lg:max-w-md lg:mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search voters..."
                  value={searchTerm}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setSearchTerm((e.target as HTMLInputElement).value)
                  }
                  className="pl-10 w-full"
                  data-cy="search-voters-input"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 justify-self-end row-start-1 col-start-2 lg:col-start-3 lg:w-auto">
              <Button
                variant="outline"
                onClick={() => {
                  void handleExportCsv();
                }}
                data-cy="export-csv-button"
              >
                <Download className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">Export</span>
              </Button>
              <CreateVoterDialog />
            </div>
          </CardHeader>

          <CardContent className="flex flex-col flex-grow overflow-y-auto pt-0">
            {isLoading && (
              <div className="space-y-6 p-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            )}
            {!isLoading && isError && (
              <p className="p-4 text-center text-red-500">
                Failed to load voters.
              </p>
            )}
            {!isLoading && !isError && voters && voters.length > 0 && (
              <VoterList voters={voters} />
            )}
            {!isLoading && !isError && (!voters || voters.length === 0) && (
              <p className="p-4 text-center text-muted-foreground">
                No voters found. Add one to get started!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

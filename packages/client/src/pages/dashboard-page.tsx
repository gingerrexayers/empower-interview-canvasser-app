import { useState } from "react";
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

export function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms delay
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
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
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
          <CardHeader className="flex flex-row items-center justify-between gap-4 flex-shrink-0">
            <CardTitle>Your Voters</CardTitle>

            {/* Search input for large screens (lg+) */}
            <div className="hidden lg:flex flex-1 justify-center items-center px-4">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search voters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={void handleExportCsv}>
                <Download className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">Export</span>
              </Button>
              <CreateVoterDialog />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col flex-grow overflow-y-auto">
            {/* Search input for small to medium screens */}
            <div className="mb-4 lg:hidden flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search voters by name or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>
            {isLoading && <p>Loading...</p>} {/* Or use a Skeleton loader */}
            {isError && <p>Failed to load voters.</p>}
            {voters && <VoterList voters={voters} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import api from "@/api";
import { type Voter } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import logo from "@/assets/EmpowerProject_Logo.png";

export function DashboardPage() {
  const { user, logout } = useAuth();
  const [voters, setVoters] = useState<Voter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  console.log(user);

  useEffect(() => {
    const fetchVoters = async () => {
      try {
        const response = await api.get<Voter[]>("/voters");
        setVoters(response.data);
      } catch (error) {
        console.error("Failed to fetch voters", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVoters();
  }, []);

  return (
    <div> {/* Outer div is now full-width */}
      <header className="flex items-center justify-between bg-primary p-4 px-4 md:px-8"> {/* Removed mb-8, rounded-lg, added horizontal padding */}
        <div className="flex items-center">
          <img src={logo} alt="Empower Project Logo" className="h-10 w-auto mr-3" />
          <span className="text-3xl font-extrabold text-primary-foreground uppercase">CANVASSER</span>
        </div>
        <Button onClick={logout} variant="ghost" className="text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground">
          Logout
        </Button>
      </header>

      {/* New container for the rest of the content */}
      <div className="container mx-auto p-4 md:p-8">
        <Card>
        <CardHeader>
          <CardTitle>Your Voters</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading voters...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {voters.length > 0 ? (
                  voters.map((voter) => (
                    <TableRow key={voter.id}>
                      <TableCell className="font-medium">
                        {voter.name}
                      </TableCell>
                      <TableCell>{voter.email}</TableCell>
                      <TableCell>{voter.notes}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      No voters found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      </div> {/* Closing the new container div */}
    </div>
  );
}

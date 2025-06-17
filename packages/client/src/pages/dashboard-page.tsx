import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import api from "@/api";
import { type Voter } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Pencil, PlusCircle, Save, Trash2, XCircle } from "lucide-react";
import logo from "@/assets/EmpowerProject_Logo.png";
import favicon from "@/assets/favicon.png";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DashboardPage() {
  const { logout } = useAuth();
  const [voters, setVoters] = useState<Voter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingVoterId, setEditingVoterId] = useState<number | null>(null);
  const [editingNotes, setEditingNotes] = useState("");
  const [isCreateVoterDialogOpen, setIsCreateVoterDialogOpen] = useState(false);
  const [newVoterName, setNewVoterName] = useState("");
  const [newVoterEmail, setNewVoterEmail] = useState("");
  const [newVoterNotes, setNewVoterNotes] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const fetchVoters = async () => {
      try {
        const response = await api.get<Voter[]>("/voters");
        setVoters(response.data);
      } catch (error) {
        console.error("Failed to fetch voters", error);
        toast.error("Failed to fetch voters.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVoters();
  }, []);

  const handleEditClick = (voter: Voter) => {
    setEditingVoterId(voter.id);
    setEditingNotes(voter.notes || "");
  };

  const handleCancelClick = () => {
    setEditingVoterId(null);
    setEditingNotes("");
  };

  const handleSaveClick = async (voterId: number) => {
    try {
      const response = await api.patch<Voter>(`/voters/${voterId}`, {
        notes: editingNotes,
      });
      setVoters(voters.map((v) => (v.id === voterId ? response.data : v)));
      toast.success("Voter notes saved successfully!");
      handleCancelClick();
    } catch (error) {
      console.error("Failed to save notes", error);
      toast.error("Failed to save notes. Please try again.");
    }
  };

  const handleDeleteNotesClick = async (voterId: number) => {
    if (
      !window.confirm(
        "Are you sure you want to delete the notes for this voter?"
      )
    ) {
      return;
    }
    try {
      const response = await api.patch<Voter>(`/voters/${voterId}`, {
        notes: "",
      });
      setVoters(voters.map((v) => (v.id === voterId ? response.data : v)));
      toast.success("Voter notes deleted successfully!");
    } catch (error) {
      console.error("Failed to delete notes", error);
      toast.error("Failed to delete notes. Please try again.");
    }
  };

  const handleOpenCreateDialog = () => {
    setNewVoterName("");
    setNewVoterEmail("");
    setNewVoterNotes("");
    setFormError("");
    setIsCreateVoterDialogOpen(true);
  };

  const validateEmail = (email: string) => {
    // Basic email validation regex
    return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
  };

  const handleCreateVoterSubmit = async () => {
    if (!newVoterName.trim()) {
      setFormError("Name is required.");
      return;
    }
    if (newVoterEmail.trim() && !validateEmail(newVoterEmail.trim())) {
      setFormError("Please enter a valid email address.");
      return;
    }
    setFormError(""); // Clear previous errors

    try {
      const response = await api.post<Voter>("/voters", {
        name: newVoterName.trim(),
        email: newVoterEmail.trim() || null, // Send null if email is empty
        notes: newVoterNotes.trim(),
      });
      setVoters((prevVoters) => [...prevVoters, response.data]);
      toast.success("Voter created successfully!");
      setIsCreateVoterDialogOpen(false);
    } catch (error: unknown) {
      console.error("Failed to create voter", error);
      let errorMessage = "Failed to create voter. Please try again.";
      if (typeof error === "object" && error !== null && "response" in error) {
        const responseError = error as {
          response?: { data?: { message?: string } };
        };
        if (responseError.response?.data?.message) {
          errorMessage = responseError.response.data.message;
        }
      }
      setFormError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div>
      {/* Header */}
      <header className="flex items-center justify-between bg-primary p-4 px-4 md:px-8">
        <div className="flex items-center">
          <img
            src={logo}
            alt="Empower Project Logo"
            className="h-10 w-auto mr-3 hidden sm:block"
          />
          <img
            src={favicon}
            alt="Empower Project Logo Small"
            className="h-8 w-8 mr-3 block sm:hidden"
          />
          <span className="text-3xl font-extrabold text-primary-foreground uppercase">
            CANVASSER
          </span>
        </div>
        <Button
          onClick={logout}
          variant="secondary"
          className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
        >
          Logout
        </Button>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-4 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Voters</CardTitle>
            <Dialog
              open={isCreateVoterDialogOpen}
              onOpenChange={setIsCreateVoterDialogOpen}
            >
              <DialogTrigger asChild>
                <Button onClick={handleOpenCreateDialog}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Voter</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to add a new voter.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newVoterName}
                      onChange={(e) => setNewVoterName(e.target.value)}
                      className="col-span-3"
                      placeholder="Voter's full name"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={newVoterEmail}
                      onChange={(e) => setNewVoterEmail(e.target.value)}
                      className="col-span-3"
                      placeholder="(Optional) voter@example.com"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="text-right">
                      Notes
                    </Label>
                    <Textarea
                      id="notes"
                      value={newVoterNotes}
                      onChange={(e) => setNewVoterNotes(e.target.value)}
                      className="col-span-3"
                      placeholder="(Optional) Any relevant notes"
                      rows={3}
                    />
                  </div>
                  {formError && (
                    <p className="col-span-4 text-sm text-red-500 text-center">
                      {formError}
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateVoterDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateVoterSubmit}>Save Voter</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading voters...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hidden sm:table-row">
                    <TableHead className="w-[250px]">Voter</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {voters.length > 0 ? (
                    voters.map((voter) => (
                      <TableRow key={voter.id}>
                        <TableCell className="block sm:table-cell sm:w-[250px]">
                          <div className="font-medium sm:mb-0 mb-1">
                            {voter.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {voter.email}
                          </div>
                        </TableCell>
                        <TableCell className="block sm:table-cell">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                            <div className="flex-grow whitespace-normal break-all">
                              {editingVoterId === voter.id ? (
                                <Textarea
                                  value={editingNotes}
                                  onChange={(
                                    e: React.ChangeEvent<HTMLTextAreaElement>
                                  ) => setEditingNotes(e.target.value)}
                                  className="w-full break-all"
                                  rows={3}
                                />
                              ) : (
                                voter.notes || (
                                  <span className="text-muted-foreground">
                                    No notes
                                  </span>
                                )
                              )}
                            </div>

                            <div className="block sm:hidden mt-2">
                              <div className="flex flex-row gap-2">
                                {editingVoterId === voter.id ? (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handleSaveClick(voter.id)}
                                    >
                                      <Save className="h-4 w-4 mr-1" />
                                      Save
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={handleCancelClick}
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Cancel
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditClick(voter)}
                                    >
                                      <Pencil className="h-4 w-4 mr-1" />
                                      Edit
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() =>
                                        handleDeleteNotesClick(voter.id)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4 mr-1" />
                                      Delete
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Action buttons for medium screens and up - hidden on small screens */}
                            <div className="hidden sm:flex sm:flex-col gap-2">
                              {editingVoterId === voter.id ? (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveClick(voter.id)}
                                  >
                                    <Save className="h-4 w-4 mr-1" />
                                    Save
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCancelClick}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditClick(voter)}
                                  >
                                    <Pencil className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() =>
                                      handleDeleteNotesClick(voter.id)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="h-24 text-center">
                        No voters found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

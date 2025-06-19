import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import type { Voter } from "@/types";
import { useUpdateVoterNotes } from "@/hooks/use-voters";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Save, XCircle } from "lucide-react";

interface VoterListProps {
  voters: Voter[];
}

export function VoterList({ voters }: VoterListProps) {
  const [editingVoterId, setEditingVoterId] = useState<number | null>(null);
  const [editingNotes, setEditingNotes] = useState("");
  const { logout } = useAuth();
  const updateNotesMutation = useUpdateVoterNotes({ onAuthError: logout });

  const handleEditClick = (voter: Voter) => {
    setEditingVoterId(voter.id);
    setEditingNotes(voter.notes || "");
  };

  const handleCancelClick = () => {
    setEditingVoterId(null);
    setEditingNotes("");
  };

  const handleSaveClick = (voterId: number) => {
    updateNotesMutation.mutate(
      { id: voterId, notes: editingNotes },
      {
        onSuccess: () => {
          handleCancelClick(); // Reset editing state on success
        },
      }
    );
  };

  if (voters.length === 0) {
    return (
      <div className="h-24 text-center flex items-center justify-center">
        No voters found. Add one to get started!
      </div>
    );
  }

  return (
    <Table className="w-full" data-cy="voters-table">
      <TableHeader className="sm:sticky sm:top-0 sm:z-10 sm:bg-card">
        <TableRow className="hidden sm:table-row">
          <TableHead className="w-[250px]">Voter</TableHead>
          <TableHead>Notes</TableHead>
          <TableHead className="w-[120px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {voters.map((voter) => {
          const isEditing = editingVoterId === voter.id;
          return (
            <TableRow
              key={voter.id}
              className="flex flex-wrap items-start sm:table-row border-b sm:border-b-0 last:border-b-0"
              data-cy={`voter-row-${voter.id}`}
            >
              {/* Voter Info Cell */}
              <TableCell className="w-full xs:w-auto xs:pr-2 sm:w-[250px] sm:pr-4 sm:table-cell font-medium py-2 px-4 sm:py-4">
                <div data-cy={`voter-name-${voter.id}`}>{voter.name}</div>
                <div
                  className="text-sm text-muted-foreground"
                  data-cy={`voter-email-${voter.id}`}
                >
                  {voter.email}
                </div>
              </TableCell>

              {/* Notes Cell */}
              <TableCell className="w-full xs:flex-grow sm:table-cell py-2 px-4 sm:py-4">
                {isEditing ? (
                  <Textarea
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    className="w-full break-all"
                    rows={3}
                    disabled={updateNotesMutation.isPending}
                    data-cy={`voter-notes-input-${voter.id}`}
                  />
                ) : (
                  <p
                    className="whitespace-normal break-words"
                    data-cy={`voter-notes-text-${voter.id}`}
                  >
                    {voter.notes || (
                      <span className="text-muted-foreground">No notes</span>
                    )}
                  </p>
                )}
              </TableCell>

              {/* Actions Cell */}
              <TableCell className="w-full sm:w-[120px] sm:table-cell sm:text-right py-2 px-4 sm:py-4">
                <div className="flex flex-col xs:flex-row xs:flex-wrap w-full items-stretch xs:justify-start sm:justify-end gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleSaveClick(voter.id)}
                        data-cy={`voter-save-notes-button-${voter.id}`}
                        disabled={updateNotesMutation.isPending}
                        className="w-full xs:w-auto"
                      >
                        <Save className="h-4 w-4" />
                        <span className="ml-1">Save</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelClick}
                        data-cy={`voter-cancel-edit-button-${voter.id}`}
                        disabled={updateNotesMutation.isPending}
                        className="w-full xs:w-auto"
                      >
                        <XCircle className="h-4 w-4" />
                        <span className="ml-1">Cancel</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(voter)}
                        data-cy={`voter-edit-notes-button-${voter.id}`}
                        className="w-full xs:w-auto"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="ml-1">Edit</span>
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

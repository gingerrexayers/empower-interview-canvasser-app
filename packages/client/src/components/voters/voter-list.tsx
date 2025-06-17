import { useState } from "react";
import type { Voter } from "@/types";
import { useUpdateVoterNotes } from "@/hooks/use-voters"; // Assuming this hook is created
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
  const updateNotesMutation = useUpdateVoterNotes();

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
    <Table>
      <TableHeader>
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
            <TableRow key={voter.id} className="block sm:table-row">
              {/* Voter Info Cell */}
              <TableCell className="block sm:table-cell sm:w-[250px] font-medium">
                <div>{voter.name}</div>
                <div className="text-sm text-muted-foreground">
                  {voter.email}
                </div>
              </TableCell>

              {/* Notes Cell */}
              <TableCell className="block sm:table-cell">
                {isEditing ? (
                  <Textarea
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    className="w-full break-all"
                    rows={3}
                    disabled={updateNotesMutation.isPending}
                  />
                ) : (
                  <p className="whitespace-normal break-words">
                    {voter.notes || (
                      <span className="text-muted-foreground">No notes</span>
                    )}
                  </p>
                )}
              </TableCell>

              {/* Actions Cell */}
              <TableCell className="block sm:table-cell sm:w-[120px]">
                <div className="flex sm:justify-end gap-2 mt-2 sm:mt-0">
                  {isEditing ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleSaveClick(voter.id)}
                        disabled={updateNotesMutation.isPending}
                      >
                        <Save className="h-4 w-4" />
                        <span className="ml-1">Save</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelClick}
                        disabled={updateNotesMutation.isPending}
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

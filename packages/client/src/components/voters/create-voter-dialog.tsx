import { useSignal } from "@preact/signals";
import { useAuth } from "@/context/auth-context";
import * as v from "valibot";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateVoter } from "@/hooks/use-voters";
import { toast } from "sonner";
import { useForm, useFormContext } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";

const voterFormSchema = v.object({
  name: v.pipe(
    v.string("Name must be a string."),
    v.minLength(1, "Name is required.")
  ),
  email: v.union(
    [
      v.literal(""),
      v.pipe(
        v.string("Email must be a string."),
        v.email("Please enter a valid email.")
      ),
    ],
    "Please enter a valid email or leave empty."
  ),
  notes: v.optional(v.string(), ""),
});

type VoterFormSchemaInput = v.InferInput<typeof voterFormSchema>;

function SaveButton() {
  const { formState } = useFormContext<VoterFormSchemaInput>();
  const { isSubmitting, isValid } = formState;

  return (
    <Button
      type="submit"
      form="create-voter-form"
      disabled={isSubmitting || !isValid}
      data-cy="create-voter-save-button"
    >
      {isSubmitting ? "Saving..." : "Save Voter"}
    </Button>
  );
}

export function CreateVoterDialog() {
  const open = useSignal(false);
  const auth = useAuth();
  const createVoterMutation = useCreateVoter({ onAuthError: auth?.logout });

  const form = useForm<VoterFormSchemaInput>({
    resolver: valibotResolver(voterFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      notes: "",
    },
  });

  const onSubmit = (values: VoterFormSchemaInput) => {
    createVoterMutation.mutate(
      {
        name: values.name,
        email: values.email?.trim() || null,
        notes: values.notes?.trim() || null,
      },
      {
        onSuccess: () => {
          open.value = false;
          form.reset();
          toast.success("Voter created successfully!");
        },
        onError: (error: unknown) => {
          console.error("Failed to create voter:", error);
          const errorResponseData = (
            error as { response?: { data?: { message?: string | string[] } } }
          )?.response?.data;

          const errorMessage =
            (Array.isArray(errorResponseData?.message)
              ? errorResponseData.message.join("; \n")
              : errorResponseData?.message) ||
            "An unexpected error occurred. Please try again.";

          toast.error("Failed to create voter", { description: errorMessage });
        },
      }
    );
  };

  return (
    <Dialog
      open={open.value}
      onOpenChange={(o: boolean) => {
        open.value = o;
        if (!o) {
          form.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button data-cy="add-voter-button">
          <PlusCircle className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Add Voter</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle data-cy="create-voter-dialog-title">
              Create New Voter
            </DialogTitle>
            <DialogDescription>
              Fill in the details to add a new voter. Click save when you're
              done.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              id="create-voter-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 py-4"
              noValidate
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Voter's full name"
                        aria-invalid={!!fieldState.error}
                        data-cy="create-voter-name-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="voter@example.com"
                        aria-invalid={!!fieldState.error}
                        data-cy="create-voter-email-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Any relevant notes..."
                        aria-invalid={!!fieldState.error}
                        data-cy="create-voter-notes-textarea"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  open.value = false;
                  form.reset();
                }}
                data-cy="create-voter-cancel-button"
              >
                Cancel
              </Button>
              <SaveButton />
            </DialogFooter>
          </Form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
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
import { useCreateVoter } from "@/hooks/use-voters"; // Assuming this hook is created
import { toast } from "sonner";

// Define the validation schema using Zod
const voterFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  email: z
    .string()
    .refine(
      (value) => value === "" || z.string().email().safeParse(value).success,
      {
        message: "Please enter a valid email or leave empty.",
      }
    )
    .optional(),
  notes: z.string().optional(),
});

type VoterFormValues = z.infer<typeof voterFormSchema>;

export function CreateVoterDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const createVoterMutation = useCreateVoter();

  const form = useForm<VoterFormValues>({
    resolver: zodResolver(voterFormSchema),
    defaultValues: {
      name: "",
      email: "",
      notes: "",
    },
    mode: 'onChange', // Add mode for immediate validation
  });

  const onSubmit = (values: VoterFormValues) => {
    createVoterMutation.mutate(
      {
        name: values.name,
        email: values.email ? values.email : null, // API expects null for empty email
        notes: values.notes ? values.notes : null, // API expects null for empty notes
      },
      {
        onSuccess: () => {
          setIsOpen(false); // Close dialog on success
          form.reset(); // Reset form for next use
          toast.success("Voter created successfully!");
        },
        onError: (error: unknown) => {
          console.error("Failed to create voter:", error);
          let errorMessage = "An unexpected error occurred. Please try again.";
          const errorResponseData = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data;

          if (errorResponseData && errorResponseData.message) {
            if (Array.isArray(errorResponseData.message)) {
              errorMessage = errorResponseData.message.join("; \n");
            } else {
              errorMessage = errorResponseData.message;
            }
          }
          toast.error("Failed to create voter", { description: errorMessage });
          // Dialog remains open for correction
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Add Voter</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Voter</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new voter. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Voter's full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="voter@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any relevant notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createVoterMutation.isPending || !form.formState.isValid}>
                {createVoterMutation.isPending ? "Saving..." : "Save Voter"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

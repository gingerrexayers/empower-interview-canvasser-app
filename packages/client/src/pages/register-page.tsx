import * as v from "valibot";
import { useLocation } from "preact-iso";
import { toast } from "sonner";
import api from "@/api";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"; // Updated import
import { Input } from "@/components/ui/input";
import { useForm, useFormContext } from "react-hook-form"; // Added import
import { valibotResolver } from "@hookform/resolvers/valibot"; // Added import

const formSchema = v.object({
  name: v.pipe(
    v.string("Name must be a string."),
    v.minLength(2, "Name must be at least 2 characters.")
  ),
  email: v.pipe(
    v.string("Email must be a string."),
    v.email("Invalid email address.")
  ),
  password: v.pipe(
    v.string("Password must be a string."),
    v.minLength(8, "Password must be at least 8 characters.")
  ),
});

// Type for our form values, inferred from formSchema
type FormValues = v.InferOutput<typeof formSchema>;

function SubmitButton() {
  const { formState } = useFormContext<FormValues>(); // Use useFormContext
  const { isSubmitting, isValid } = formState;

  return (
    <Button
      data-cy="register-submit-button"
      type="submit"
      className="w-full"
      disabled={isSubmitting || !isValid} // Access .value is not needed for RHF state
    >
      {isSubmitting ? "Creating Account..." : "Create Account"}
    </Button>
  );
}

export function RegisterPage() {
  const location = useLocation();

  const form = useForm<FormValues>({
    resolver: valibotResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  async function onSubmit(values: FormValues) {
    try {
      await api.post("/auth/register", values);

      void toast.success("Registration Successful", {
        description: "You can now log in with your credentials.",
      });
      location.route("/login", true);
    } catch (error: unknown) {
      void console.error(error);
      let errorMessage = "An unexpected error occurred. Please try again.";
      const errorResponseData = (
        error as { response?: { data?: { message?: string | string[] } } }
      )?.response?.data;

      if (errorResponseData && errorResponseData.message) {
        if (Array.isArray(errorResponseData.message)) {
          errorMessage = errorResponseData.message.join("; \n");
        } else {
          errorMessage = errorResponseData.message;
        }
      }

      void toast.error("Registration Failed", {
        description: errorMessage,
      });
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <AppHeader showLogoutButton={false} className="flex-shrink-0" />
      <div className="flex flex-grow items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl" data-cy="register-title">
              Sign Up
            </CardTitle>
            <CardDescription>Create an account to get started.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              {" "}
              {/* Spread form methods here */}
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
                noValidate // Prevent browser validation, RHF handles it
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field} // Spread field props (value, onChange, onBlur, ref)
                          placeholder="Your full name"
                          aria-invalid={!!fieldState.error}
                          data-cy="register-name-input"
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="name@example.com"
                          aria-invalid={!!fieldState.error}
                          data-cy="register-email-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          aria-invalid={!!fieldState.error}
                          data-cy="register-password-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SubmitButton />
              </form>
            </Form>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <a href="/login" className="underline">
                Sign in
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

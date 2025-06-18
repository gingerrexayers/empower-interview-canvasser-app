import { useLocation } from "preact-iso";
import { toast } from "sonner";
import api from "@/api";
import { useAuth } from "@/context/auth-context";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm, useFormContext } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import * as v from "valibot";

const formSchema = v.object({
  email: v.pipe(
    v.string("Email must be a string."),
    v.email("Invalid email address.")
  ),
  password: v.pipe(
    v.string("Password must be a string."),
    v.minLength(1, "Password is required.") // Keep this for login, 8 chars for register
  ),
});

// Type for our form values, inferred from formSchema
type FormValues = v.InferOutput<typeof formSchema>;

function LoginButton() {
  const { formState } = useFormContext<FormValues>();
  const { isSubmitting, isValid } = formState;

  return (
    <Button
      data-cy="login-submit-button"
      type="submit"
      className="w-full"
      disabled={isSubmitting || !isValid}
    >
      {isSubmitting ? "Logging in..." : "Login"}
    </Button>
  );
}

export function LoginPage() {
  const location = useLocation();
  const { login } = useAuth();

  const form = useForm<FormValues>({
    resolver: valibotResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  async function onSubmit(values: FormValues) {
    try {
      const response = await api.post<{ access_token: string }>(
        "/auth/login",
        values
      );
      login(response.data.access_token);
      location.route("/dashboard", true);
      toast.success("Login Successful");
    } catch (error) {
      console.error(error);
      toast.error("Login Failed", {
        description:
          (error as any)?.response?.data?.message ||
          "Invalid email or password. Please try again.",
      });
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <AppHeader showLogoutButton={false} className="flex-shrink-0" />
      <div className="flex flex-grow items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl" data-cy="login-title">
              Login
            </CardTitle>
            <CardDescription>
              Enter your email below to login to your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
                noValidate // Prevent browser validation, RHF handles it
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field} // Spread field props
                          type="email"
                          placeholder="name@example.com"
                          aria-invalid={!!fieldState.error}
                          data-cy="login-email-input"
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
                          {...field} // Spread field props
                          type="password"
                          aria-invalid={!!fieldState.error}
                          data-cy="login-password-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <LoginButton />
              </form>
            </Form>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <a href="/register" className="underline">
                Sign up
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

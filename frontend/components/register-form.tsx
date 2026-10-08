import { useState, type FormEvent } from "react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/src/hooks/use-auth";
import type { RegisterDetails } from "@/src/lib/auth";

type RegisterFormProps = React.ComponentProps<"div"> & {
  onAuthenticated: () => void;
};

export function RegisterForm({
  className,
  onAuthenticated,
  ...props
}: RegisterFormProps) {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] =
    useState<RegisterDetails["accountType"]>("individual");
  const [isEmployee, setIsEmployee] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    setIsSubmitting(true);
    const result = await register({
      username: username.trim(),
      password,
      accountType,
      isEmployee,
    });
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.message ?? "Registration failed.");
      return;
    }

    onAuthenticated();
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Join CoastLink online</CardTitle>
          <CardDescription>
            Register to book CoastLink Council rooms, facilities and equipment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="register-username">Username</FieldLabel>
                <Input
                  id="register-username"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="account-type">Account type</FieldLabel>
                <select
                  id="account-type"
                  value={accountType}
                  onChange={(event) =>
                    setAccountType(
                      event.target.value as RegisterDetails["accountType"],
                    )
                  }
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
                >
                  <option value="individual">Individual</option>
                  <option value="business">Business</option>
                </select>
              </Field>
              <Field>
                <FieldLabel htmlFor="register-password">Password</FieldLabel>
                <Input
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </Field>
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={isEmployee}
                  onChange={(event) => setIsEmployee(event.target.checked)}
                  className="mt-0.5 size-4 accent-primary"
                />
                <span>
                  I am a CoastLink Council employee
                  <span className="block text-muted-foreground">
                    Employee access enables Council operations tools.
                  </span>
                </span>
              </label>
              {error ? (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating account…" : "Create account"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

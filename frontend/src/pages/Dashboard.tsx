import { Navigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/src/hooks/use-auth";

export default function Dashboard() {
  const { isLoggedIn, user } = useAuth();

  if (!isLoggedIn || !user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Welcome back</p>
        <h1 className="font-heading text-4xl font-semibold tracking-tight">
          {user.username}&apos;s dashboard
        </h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your bookings</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Your upcoming room, facility, and equipment bookings will appear
            here.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Find a resource</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Browse council venues and equipment available to the community.
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

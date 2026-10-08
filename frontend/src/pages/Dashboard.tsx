import { CalendarBlank, MapPin, Plus } from "@phosphor-icons/react";
import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";

import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/src/hooks/use-auth";
import { apiRequest, formatDateTime, type BookingRecord } from "@/src/lib/api";

export default function Dashboard() {
  const { isLoggedIn, user } = useAuth();
  const location = useLocation();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(
    (location.state as { message?: string } | null)?.message ?? null,
  );

  const loadBookings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      setBookings(await apiRequest<BookingRecord[]>(`/booking/user/${user.id}`));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load bookings");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    void apiRequest<BookingRecord[]>(`/booking/user/${user.id}`)
      .then((data) => {
        if (active) setBookings(data);
      })
      .catch((error: unknown) => {
        if (active) {
          setMessage(error instanceof Error ? error.message : "Unable to load bookings");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  if (!isLoggedIn || !user) {
    return <Navigate to="/auth" replace />;
  }
  const userId = user.id;

  async function cancel(id: number) {
    try {
      await apiRequest(`/booking/requests/${id}/cancel`, {
        method: "PATCH",
        body: JSON.stringify({ userId }),
      });
      setMessage("Booking cancelled.");
      await loadBookings();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to cancel booking");
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Welcome back</p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {user.username}&apos;s bookings
          </h1>
        </div>
        <Button render={<Link to="/resources" />}>
          <Plus /> Find a resource
        </Button>
      </div>

      {message ? (
        <div className="rounded-md border bg-muted px-4 py-3 text-sm" role="status">
          {message}
        </div>
      ) : null}

      {loading ? (
        <p className="text-muted-foreground">Loading your bookings…</p>
      ) : bookings.length === 0 ? (
        <Card className="border-dashed text-center">
          <CardContent className="py-10">
            <CalendarBlank className="mx-auto mb-3 size-9 text-muted-foreground" />
            <h2 className="font-heading text-lg font-semibold">No bookings yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse Council resources to make your first request.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {bookings.map((booking) => (
            <Card key={booking.id} className="gap-4 py-5">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle>{booking.booking_name}</CardTitle>
                  <StatusBadge status={booking.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <CalendarBlank /> {formatDateTime(booking.from_date)} –{" "}
                    {formatDateTime(booking.to_date)}
                  </p>
                  {booking.location ? (
                    <p className="flex items-center gap-2">
                      <MapPin /> {booking.location}
                    </p>
                  ) : null}
                  {booking.purpose ? <p>Purpose: {booking.purpose}</p> : null}
                </div>
                {["pending", "approved"].includes(booking.status) ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => void cancel(booking.id)}
                  >
                    Cancel booking
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

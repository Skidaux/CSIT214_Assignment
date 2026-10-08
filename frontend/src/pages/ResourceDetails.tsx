import { ArrowLeft, CalendarCheck, MapPin, Warning } from "@phosphor-icons/react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/src/hooks/use-auth";
import { apiRequest, type BookingResource } from "@/src/lib/api";

type Availability = {
  available: boolean;
  remaining?: number;
  message?: string;
};

export default function ResourceDetails() {
  const { name = "" } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [resource, setResource] = useState<BookingResource | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [purpose, setPurpose] = useState("");
  const [amount, setAmount] = useState(1);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [maintenanceDescription, setMaintenanceDescription] = useState("");
  const [maintenanceMessage, setMaintenanceMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void apiRequest<BookingResource>(`/booking/resources/${encodeURIComponent(name)}`)
      .then((data) => {
        if (active) setResource(data);
      })
      .catch((error: unknown) => {
        if (active) {
          setMessage(error instanceof Error ? error.message : "Unable to load resource");
        }
      });
    return () => {
      active = false;
    };
  }, [name]);

  async function checkDates() {
    if (!resource || !fromDate || !toDate) {
      setMessage("Choose a start and end time first.");
      return;
    }
    setMessage(null);
    try {
      const query = new URLSearchParams({
        name: resource.name,
        from: fromDate,
        to: toDate,
        quantity: String(amount),
      });
      setAvailability(
        await apiRequest<Availability>(`/booking/availability?${query}`),
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Availability check failed");
    }
  }

  async function submitBooking(event: FormEvent) {
    event.preventDefault();
    if (!resource || !user) return;
    setSubmitting(true);
    setMessage(null);
    try {
      await apiRequest("/booking/request", {
        method: "POST",
        body: JSON.stringify({
          userId: user.id,
          bookingName: resource.name,
          fromDate,
          toDate,
          purpose,
          attendees: resource.type.toLowerCase() === "equipment" ? 1 : amount,
          quantity: resource.type.toLowerCase() === "equipment" ? amount : 1,
        }),
      });
      navigate("/dashboard", { state: { message: "Booking request submitted." } });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to request booking");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitMaintenance(event: FormEvent) {
    event.preventDefault();
    if (!resource || !user || !maintenanceDescription.trim()) return;
    setMaintenanceMessage(null);
    try {
      await apiRequest("/maintenance/report", {
        method: "POST",
        body: JSON.stringify({
          bookingName: resource.name,
          reportedBy: user.id,
          description: maintenanceDescription,
          priority: "medium",
        }),
      });
      setMaintenanceDescription("");
      setMaintenanceMessage("Maintenance issue reported to Council.");
    } catch (error) {
      setMaintenanceMessage(
        error instanceof Error ? error.message : "Unable to submit report",
      );
    }
  }

  if (!resource) {
    return (
      <section className="mx-auto w-full max-w-5xl">
        <p className={message ? "text-destructive" : "text-muted-foreground"}>
          {message ?? "Loading resource…"}
        </p>
      </section>
    );
  }

  const isEquipment = resource.type.toLowerCase() === "equipment";

  return (
    <section className="mx-auto w-full max-w-5xl space-y-4">
      <Button render={<Link to="/resources" />} variant="ghost" className="-ml-3">
        <ArrowLeft /> Back to resources
      </Button>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Card className="gap-4 py-5">
            <CardHeader>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-medium uppercase tracking-wide text-primary">
                  {resource.type}
                </p>
                <StatusBadge status={resource.status} />
              </div>
              <CardTitle className="text-2xl">{resource.name}</CardTitle>
              <CardDescription className="text-base">
                {resource.description || "Council community resource"}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="border-l-2 border-primary pl-3">
                <MapPin className="mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{resource.location}</p>
              </div>
              <div className="border-l-2 border-primary pl-3">
                <CalendarCheck className="mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">
                  {isEquipment ? "Available stock" : "Capacity"}
                </p>
                <p className="font-medium">
                  {resource.size} {isEquipment ? "items" : "people"}
                </p>
              </div>
            </CardContent>
          </Card>

          {isLoggedIn ? (
            <Card className="gap-4 py-5">
              <CardHeader>
                <CardTitle className="text-lg">Report a maintenance issue</CardTitle>
                <CardDescription>
                  Tell Council staff about damage or a problem with this resource.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitMaintenance} className="space-y-3">
                  <textarea
                    value={maintenanceDescription}
                    onChange={(event) => setMaintenanceDescription(event.target.value)}
                    placeholder="Describe the issue"
                    required
                    className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  {maintenanceMessage ? (
                    <p className="text-sm text-muted-foreground">{maintenanceMessage}</p>
                  ) : null}
                  <Button type="submit" variant="outline">
                    <Warning /> Submit maintenance report
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <Card className="h-fit gap-4 py-5">
          <CardHeader>
            <CardTitle>Request a booking</CardTitle>
            <CardDescription>
              Select a time and confirm that the resource is available.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isLoggedIn ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Log in or register before requesting this resource.
                </p>
                <Button render={<Link to="/auth" />} className="w-full">
                  Login to continue
                </Button>
              </div>
            ) : (
              <form onSubmit={submitBooking}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="from-date">Start</FieldLabel>
                    <Input
                      id="from-date"
                      type="datetime-local"
                      value={fromDate}
                      onChange={(event) => {
                        setFromDate(event.target.value);
                        setAvailability(null);
                      }}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="to-date">End</FieldLabel>
                    <Input
                      id="to-date"
                      type="datetime-local"
                      value={toDate}
                      onChange={(event) => {
                        setToDate(event.target.value);
                        setAvailability(null);
                      }}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="amount">
                      {isEquipment ? "Quantity" : "Attendees"}
                    </FieldLabel>
                    <Input
                      id="amount"
                      type="number"
                      min={1}
                      max={resource.size}
                      value={amount}
                      onChange={(event) => {
                        setAmount(Number(event.target.value));
                        setAvailability(null);
                      }}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="purpose">Purpose</FieldLabel>
                    <Input
                      id="purpose"
                      value={purpose}
                      onChange={(event) => setPurpose(event.target.value)}
                      placeholder="Community meeting"
                    />
                  </Field>
                  <Button type="button" variant="outline" onClick={checkDates}>
                    Check availability
                  </Button>
                  {availability ? (
                    <p
                      className={`text-sm ${availability.available ? "text-emerald-600" : "text-destructive"}`}
                      role="status"
                    >
                      {availability.available
                        ? isEquipment
                          ? `Available — ${availability.remaining} currently remaining.`
                          : "Available for the selected time."
                        : availability.message}
                    </p>
                  ) : null}
                  {message ? (
                    <p className="text-sm text-destructive" role="alert">
                      {message}
                    </p>
                  ) : null}
                  <Button
                    type="submit"
                    disabled={
                      submitting ||
                      resource.status !== "available" ||
                      !availability?.available
                    }
                  >
                    {submitting ? "Submitting…" : "Submit booking request"}
                  </Button>
                </FieldGroup>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

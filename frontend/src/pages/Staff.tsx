import { Buildings, ClipboardText, Plus, Wrench } from "@phosphor-icons/react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/src/hooks/use-auth";
import {
  apiRequest,
  formatDateTime,
  type BookingRecord,
  type BookingResource,
  type MaintenanceRecord,
  type ResourceStatus,
} from "@/src/lib/api";

export default function Staff() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<BookingRecord[]>([]);
  const [resources, setResources] = useState<BookingResource[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("facility");
  const [size, setSize] = useState(1);
  const [description, setDescription] = useState("");

  const loadStaffData = useCallback(async () => {
    if (!user?.isEmployee) return;
    try {
      const [bookingData, resourceData, maintenanceData] = await Promise.all([
        apiRequest<BookingRecord[]>(`/booking/requests?employeeId=${user.id}`),
        apiRequest<BookingResource[]>("/booking/resources"),
        apiRequest<MaintenanceRecord[]>(`/maintenance?employeeId=${user.id}`),
      ]);
      setRequests(bookingData);
      setResources(resourceData);
      setMaintenance(maintenanceData);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load staff data");
    }
  }, [user]);

  useEffect(() => {
    if (!user?.isEmployee) return;
    let active = true;
    void Promise.all([
      apiRequest<BookingRecord[]>(`/booking/requests?employeeId=${user.id}`),
      apiRequest<BookingResource[]>("/booking/resources"),
      apiRequest<MaintenanceRecord[]>(`/maintenance?employeeId=${user.id}`),
    ])
      .then(([bookingData, resourceData, maintenanceData]) => {
        if (!active) return;
        setRequests(bookingData);
        setResources(resourceData);
        setMaintenance(maintenanceData);
      })
      .catch((error: unknown) => {
        if (active) {
          setMessage(error instanceof Error ? error.message : "Unable to load staff data");
        }
      });
    return () => {
      active = false;
    };
  }, [user]);

  if (!user?.isEmployee) return <Navigate to="/dashboard" replace />;
  const employeeId = user.id;

  async function reviewBooking(id: number, status: "approved" | "rejected") {
    try {
      await apiRequest(`/booking/requests/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ employeeId, status }),
      });
      setMessage(`Booking ${status}.`);
      await loadStaffData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to review booking");
    }
  }

  async function createResource(event: FormEvent) {
    event.preventDefault();
    try {
      await apiRequest("/booking/create-room", {
        method: "POST",
        body: JSON.stringify({
          employeeId,
          name,
          location,
          type,
          size,
          description,
        }),
      });
      setName("");
      setLocation("");
      setSize(1);
      setDescription("");
      setMessage("Resource added.");
      await loadStaffData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to add resource");
    }
  }

  async function changeResourceStatus(
    resourceName: string,
    status: ResourceStatus,
  ) {
    try {
      const result = await apiRequest<{ affectedBookings: BookingRecord[] }>(
        `/booking/resources/${encodeURIComponent(resourceName)}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ employeeId, status }),
        },
      );
      const affected = result.affectedBookings?.length ?? 0;
      setMessage(
        affected > 0
          ? `Status updated. ${affected} future booking${affected === 1 ? " is" : "s are"} affected.`
          : "Resource status updated.",
      );
      await loadStaffData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update resource");
    }
  }

  async function progressMaintenance(report: MaintenanceRecord) {
    try {
      if (report.status === "reported") {
        await apiRequest(`/maintenance/${report.id}/assign`, {
          method: "PATCH",
          body: JSON.stringify({ employeeId, assignedTo: employeeId }),
        });
        setMessage("Maintenance task assigned to you.");
      } else {
        const nextStatus = report.status === "assigned" ? "in_progress" : "completed";
        await apiRequest(`/maintenance/${report.id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ employeeId, status: nextStatus }),
        });
        setMessage(
          nextStatus === "completed"
            ? "Maintenance task completed."
            : "Maintenance work started.",
        );
      }
      await loadStaffData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update maintenance");
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Council operations</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Staff workspace
        </h1>
      </div>

      {message ? (
        <div className="rounded-md border bg-muted px-4 py-3 text-sm" role="status">
          {message}
        </div>
      ) : null}

      <Tabs defaultValue="bookings" className="gap-6">
        <TabsList className="grid h-auto w-full grid-cols-3">
          <TabsTrigger value="bookings" className="py-3">
            <ClipboardText /> Bookings
          </TabsTrigger>
          <TabsTrigger value="resources" className="py-3">
            <Buildings /> Resources
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="py-3">
            <Wrench /> Maintenance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
          {requests.length === 0 ? (
            <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              No booking requests have been submitted.
            </p>
          ) : (
            requests.map((request) => (
              <Card key={request.id} className="gap-4 py-5">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle>{request.booking_name}</CardTitle>
                      <CardDescription>
                        Requested by {request.username} · {formatDateTime(request.from_date)}
                      </CardDescription>
                    </div>
                    <StatusBadge status={request.status} />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    {request.purpose || "No purpose supplied"} ·{" "}
                    {request.type === "equipment"
                      ? `${request.quantity} items`
                      : `${request.attendees} attendees`}
                  </p>
                  {request.status === "pending" ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => void reviewBooking(request.id, "approved")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => void reviewBooking(request.id, "rejected")}
                      >
                        Reject
                      </Button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="resources" className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Add a resource</CardTitle>
              <CardDescription>Add a room, facility or equipment item.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createResource}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="resource-name">Name</FieldLabel>
                    <Input
                      id="resource-name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="resource-location">Location</FieldLabel>
                    <Input
                      id="resource-location"
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                      required
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field>
                      <FieldLabel htmlFor="resource-type">Type</FieldLabel>
                      <select
                        id="resource-type"
                        value={type}
                        onChange={(event) => setType(event.target.value)}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="facility">Facility</option>
                        <option value="room">Room</option>
                        <option value="equipment">Equipment</option>
                      </select>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="resource-size">Capacity/stock</FieldLabel>
                      <Input
                        id="resource-size"
                        type="number"
                        min={1}
                        value={size}
                        onChange={(event) => setSize(Number(event.target.value))}
                        required
                      />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel htmlFor="resource-description">Description</FieldLabel>
                    <Input
                      id="resource-description"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                    />
                  </Field>
                  <Button type="submit">
                    <Plus /> Add resource
                  </Button>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {resources.map((resource) => (
              <div
                key={resource.name}
                className="flex flex-col justify-between gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-semibold">{resource.name}</h3>
                    <StatusBadge status={resource.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {resource.type} · {resource.location}
                  </p>
                </div>
                <select
                  value={resource.status}
                  onChange={(event) =>
                    void changeResourceStatus(
                      resource.name,
                      event.target.value as ResourceStatus,
                    )
                  }
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  aria-label={`Status for ${resource.name}`}
                >
                  <option value="available">Available</option>
                  <option value="closed">Closed</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          {maintenance.length === 0 ? (
            <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              No maintenance issues have been reported.
            </p>
          ) : (
            maintenance.map((report) => (
              <Card key={report.id} className="gap-4 py-5">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle>{report.booking_name}</CardTitle>
                      <CardDescription>
                        Reported by {report.reporter_name} · Priority {report.priority}
                      </CardDescription>
                    </div>
                    <StatusBadge status={report.status} />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                  {!["completed", "cancelled"].includes(report.status) ? (
                    <Button size="sm" onClick={() => void progressMaintenance(report)}>
                      {report.status === "reported"
                        ? "Assign to me"
                        : report.status === "assigned"
                          ? "Start work"
                          : "Mark completed"}
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
}

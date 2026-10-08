import { Buildings, MagnifyingGlass, MapPin, Users } from "@phosphor-icons/react";
import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiRequest, type BookingResource } from "@/src/lib/api";

export default function Resources() {
  const [resources, setResources] = useState<BookingResource[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadResources(searchValue = search, typeValue = type) {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (searchValue) query.set("search", searchValue);
      if (typeValue) query.set("type", typeValue);
      setResources(
        await apiRequest<BookingResource[]>(`/booking/resources?${query}`),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load resources",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    void apiRequest<BookingResource[]>("/booking/resources")
      .then((data) => {
        if (active) setResources(data);
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load resources",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    void loadResources();
  }

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <div className="space-y-3">
        <p className="text-sm font-medium text-primary">Community resources</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Find a space or equipment
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Search Council rooms, facilities and equipment, then check availability
          before requesting a booking.
        </p>
      </div>

      <form
        onSubmit={handleSearch}
        className="grid w-full items-center gap-3 rounded-lg border bg-card p-3 sm:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_minmax(190px,220px)_auto]"
      >
        <label htmlFor="resource-search" className="sr-only">
          Search resources
        </label>
        <div className="relative min-w-0">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
            <MagnifyingGlass className="size-4" aria-hidden="true" />
          </span>
          <Input
            id="resource-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, location or description"
            className="h-10 pl-9 pr-3"
          />
        </div>
        <label htmlFor="resource-type" className="sr-only">
          Resource type
        </label>
        <select
          id="resource-type"
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 sm:col-span-1 lg:col-span-1"
        >
          <option value="">All resource types</option>
          <option value="facility">Facilities</option>
          <option value="room">Rooms</option>
          <option value="equipment">Equipment</option>
        </select>
        <Button
          type="submit"
          size="lg"
          className="w-full px-5 sm:col-span-2 sm:w-auto sm:justify-self-end lg:col-span-1"
        >
          <MagnifyingGlass /> Search
        </Button>
      </form>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {loading ? (
        <p className="text-muted-foreground">Loading Council resources…</p>
      ) : resources.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <Buildings className="mx-auto mb-3 size-8 text-muted-foreground" />
          <h2 className="font-heading text-lg font-semibold">No resources found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Try changing your search or resource type.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {resources.map((resource) => (
            <Card key={resource.name} className="justify-between gap-4 py-5">
              <CardHeader>
                <div className="mb-2 flex items-start justify-between gap-3">
                  <span className="text-xs font-medium uppercase tracking-wide text-primary">
                    {resource.type}
                  </span>
                  <StatusBadge status={resource.status} />
                </div>
                <CardTitle>{resource.name}</CardTitle>
                <CardDescription>
                  {resource.description || "Council community resource"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <MapPin /> {resource.location}
                  </p>
                  <p className="flex items-center gap-2">
                    <Users />
                    {resource.type.toLowerCase() === "equipment"
                      ? `${resource.size} items`
                      : `Capacity ${resource.size}`}
                  </p>
                </div>
                <Button
                  render={
                    <Link to={`/resources/${encodeURIComponent(resource.name)}`} />
                  }
                  variant={resource.status === "available" ? "default" : "outline"}
                  className="w-full"
                >
                  View details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

export default function About() {
  return (
    <section className="mx-auto w-full max-w-5xl space-y-5">
      <div className="space-y-3">
        <p className="text-sm font-medium text-primary">About CoastLink Council</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Connected services for a growing coastal region
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
          CoastLink Council supports residents, businesses and visitors through
          accessible community facilities, environmental services and local
          assistance. This portal brings facility bookings and maintenance
          reporting into one convenient place.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="font-heading text-xl font-semibold">
          Community facilities, made simpler
        </h2>
        <p className="mt-2 text-muted-foreground">
          Search Council rooms, venues and equipment, check availability, submit
          booking requests and keep track of every request from your dashboard.
        </p>
      </div>
    </section>
  );
}

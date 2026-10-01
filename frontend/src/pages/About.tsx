export default function About() {
  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <div className="space-y-3">
        <p className="text-sm font-medium text-primary">About the project</p>
        <h1 className="font-heading text-4xl font-semibold tracking-tight">
          About
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
          This app provides a simple, responsive dashboard experience with
          persistent navigation. The sidebar stays in place while each route
          renders in the main content area.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-heading text-xl font-semibold">
          Built for easy navigation
        </h2>
        <p className="mt-2 text-muted-foreground">
          Choose About from the sidebar or visit <code>/about</code> directly.
        </p>
      </div>
    </section>
  );
}

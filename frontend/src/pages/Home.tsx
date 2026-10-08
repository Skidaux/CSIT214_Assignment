import {
  ArrowRight,

} from "@phosphor-icons/react";
import { Link } from "react-router-dom";

import { useAuth } from "@/src/hooks/use-auth";


export default function Home() {
  const { isLoggedIn } = useAuth();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 py-2 md:py-6">
      <section className="grid items-center gap-8 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">

          <h1 className="max-w-3xl font-heading text-3xl font-semibold tracking-tight md:text-4xl">
            CoastLink Council community services
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
            Find and book CoastLink Council rooms, facilities and equipment for
            residents, community groups and businesses.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to={isLoggedIn ? "/dashboard" : "/auth"}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-80"
            >
              {isLoggedIn ? "Open dashboard" : "Get started"}
              <ArrowRight />
            </Link>
            <Link
              to="/resources"
              className="inline-flex h-10 items-center rounded-md border border-border px-5 text-sm font-medium hover:bg-muted"
            >
              Browse resources
            </Link>
          </div>
        </div>
        {/* <div className="w-full border-l border-border p-6 lg:max-w-xs">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Waves size={23} weight="bold" />
            </span>
            <div>
              <p className="font-heading text-lg font-semibold">CoastLink Council</p>
            </div>
          </div>
          <p className="mt-6 border-t pt-5 text-sm leading-6 text-muted-foreground">
            Connecting residents, community groups and local businesses with
            Council spaces and equipment.
          </p>
        </div> */}
      </section>

      {/* <section className="grid gap-4 md:grid-cols-3">
        {services.map(({ title, description, icon: Icon }) => (
          <article key={title} className="border-t border-border py-5">
            <div className="mb-4 text-primary">
              <Icon size={22} weight="duotone" />
            </div>
            <h2 className="font-heading text-lg font-semibold">{title}</h2>
            <p className="mt-2 leading-6 text-muted-foreground">{description}</p>
          </article>
        ))}
      </section> */}
    </div>
  );
}

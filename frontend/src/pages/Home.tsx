import { ArrowRight, Buildings, CalendarCheck, Toolbox } from "@phosphor-icons/react";
import { Link } from "react-router-dom";

import heroImage from "@/src/assets/hero.png";
import { useAuth } from "@/src/hooks/use-auth";

const services = [
  {
    title: "Rooms and facilities",
    description: "Find community halls, meeting rooms, and council facilities.",
    icon: Buildings,
  },
  {
    title: "Equipment loans",
    description: "Borrow council equipment for community activities and events.",
    icon: Toolbox,
  },
  {
    title: "Manage bookings",
    description: "Keep track of your upcoming reservations in one place.",
    icon: CalendarCheck,
  },
];

export default function Home() {
  const { isLoggedIn } = useAuth();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-14 py-4 md:py-8">
      <section className="grid items-center gap-10 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <p className="text-sm font-medium text-primary">
            Council community bookings
          </p>
          <h1 className="max-w-3xl font-heading text-4xl font-semibold tracking-tight md:text-5xl">
            Local spaces and equipment, made easier to book.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
            Browse council rooms, facilities, and equipment available to
            individuals, community groups, and local businesses.
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
              to="/about"
              className="inline-flex h-10 items-center rounded-md border border-border px-5 text-sm font-medium hover:bg-muted"
            >
              Learn more
            </Link>
          </div>
        </div>
        <div className="mx-auto flex aspect-square w-full max-w-sm items-center justify-center border-l border-border p-8">
          <img
            src={heroImage}
            alt="Community booking illustration"
            className="max-h-full max-w-full object-contain"
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {services.map(({ title, description, icon: Icon }) => (
          <article key={title} className="border-t border-border py-6">
            <div className="mb-4 text-primary">
              <Icon size={22} weight="duotone" />
            </div>
            <h2 className="font-heading text-lg font-semibold">{title}</h2>
            <p className="mt-2 leading-6 text-muted-foreground">{description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

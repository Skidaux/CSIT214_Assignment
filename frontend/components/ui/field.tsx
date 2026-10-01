import type { ComponentProps } from "react";
import { cn } from "cn";

function FieldGroup({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-5", className)} {...props} />;
}

function Field({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-2", className)} {...props} />;
}

function FieldLabel({ className, ...props }: ComponentProps<"label">) {
  return (
    <label className={cn("text-sm font-medium", className)} {...props} />
  );
}

function FieldDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
}

export { Field, FieldDescription, FieldGroup, FieldLabel };

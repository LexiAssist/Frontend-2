import * as React from "react";
import { cn } from "./utils";

type CardProps = React.ComponentProps<"div">;

function Card({ className, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-white text-slate-900 flex flex-col gap-6 rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

interface CardHeaderProps extends React.ComponentProps<"div"> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

function CardHeader({ className, title, description, action, children, ...props }: CardHeaderProps) {
  // If title/description are provided, use the legacy layout
  if (title || description || action) {
    return (
      <div
        data-slot="card-header"
        className={cn(
          "flex items-start justify-between",
          className,
        )}
        {...props}
      >
        <div className="flex-1">
          {title && (
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-slate-500 mt-1">{description}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
        {children}
      </div>
    );
  }

  // Otherwise use the simple layout
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <h4
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-slate-500 text-sm", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

interface CardContentProps extends React.ComponentProps<"div"> {
  padding?: "none" | "sm" | "md" | "lg";
}

function CardContent({ className, padding = "md", ...props }: CardContentProps) {
  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "",
    lg: "p-2",
  };

  return (
    <div
      data-slot="card-content"
      className={cn(paddingClasses[padding], className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
export default Card;

"use client";

import * as React from "react";

// Placeholder Calendar component
// react-day-picker is not installed, this is a stub for build compatibility
function Calendar({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} {...props}>
      <p>Calendar component requires react-day-picker package</p>
    </div>
  );
}

export { Calendar };

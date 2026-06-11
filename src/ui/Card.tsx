import type { HTMLAttributes, ReactNode } from "react";

/** Surface level-1 container (DESIGN.md §2.3). Borders carry elevation. */
export function Card({
  children,
  className = "",
  ...rest
}: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-lg2 border border-line bg-surface-1 p-5 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

/** The ONE uppercase micro-label style (DESIGN.md §3). */
export function Caption({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`text-caption uppercase text-ink-subtle ${className}`}>
      {children}
    </div>
  );
}

export function SectionTitle({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <h2 className={`text-title-2 text-ink ${className}`}>{children}</h2>;
}

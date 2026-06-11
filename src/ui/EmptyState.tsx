import type { ComponentType, ReactNode } from "react";

/** Icon + headline + body + single CTA (DESIGN.md §5). */
export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  body: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-lg2 border border-dashed border-line-strong p-8 text-center">
      <div className="mx-auto h-12 w-12 rounded-md2 bg-accent-soft text-accent flex items-center justify-center">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-headline text-ink mt-4">{title}</h3>
      <p className="text-footnote text-ink-muted mt-1.5 max-w-xs mx-auto leading-relaxed">
        {body}
      </p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

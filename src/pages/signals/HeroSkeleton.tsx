export function HeroSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-line/70 bg-bg-card/40 p-5 animate-pulse">
        <div className="h-3 w-40 rounded bg-bg-elev/60" />
        <div className="h-12 w-56 rounded bg-bg-elev/60 mt-3" />
        <div className="h-3 w-64 rounded bg-bg-elev/60 mt-3" />
        <div className="h-20 w-full rounded bg-bg-elev/40 mt-4" />
        <div className="grid grid-cols-4 gap-2 mt-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-12 rounded-lg bg-bg-elev/40" />
          ))}
        </div>
      </div>
    </div>
  );
}

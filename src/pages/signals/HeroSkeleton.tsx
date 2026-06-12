export function HeroSkeleton() {
  return (
    <div className="space-y-6">
      {/* ── Cumulative Return Card Skeleton ── */}
      <div className="rounded-2xl border border-line/70 bg-bg-card/45 p-5 space-y-4">
        <div className="h-3.5 w-48 skeleton" />
        <div className="h-11 w-44 skeleton mt-2" />
        <div className="h-3 w-64 skeleton" />
        {/* Curved Area Skeleton */}
        <div className="h-[84px] w-full skeleton border border-line/30" />
        {/* 4 Stats Grid Skeleton */}
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-12 skeleton flex flex-col items-center justify-center space-y-1.5" >
              <div className="h-2 w-8 skeleton" />
              <div className="h-3.5 w-10 skeleton" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Year Track Record Skeleton ── */}
      <div className="rounded-2xl border border-line/60 bg-bg-card/30 p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div className="space-y-1.5">
            <div className="h-3 w-24 skeleton" />
            <div className="h-2.5 w-32 skeleton" />
          </div>
          <div className="h-3 w-16 skeleton" />
        </div>
        {/* 4 Simulated horizontal bars */}
        <div className="space-y-2 pt-1">
          {[2026, 2025, 2024, 2023].map((y) => (
            <div key={y} className="flex items-center gap-3">
              <div className="w-8 h-3 skeleton" />
              <div className="flex-1 h-3 skeleton" />
              <div className="w-10 h-3 skeleton" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Live Calls List Skeleton ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="space-y-1.5">
            <div className="h-3.5 w-20 skeleton" />
            <div className="h-2.5 w-48 skeleton" />
          </div>
          <div className="h-5 w-24 skeleton" />
        </div>

        {/* 5 Row skeletons */}
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="h-14 rounded-xl border border-line/50 bg-bg-card/25 p-3 flex items-center justify-between" >
              <div className="flex items-center gap-3">
                {/* Initial Box */}
                <div className="h-8 w-8 skeleton" />
                <div className="space-y-1">
                  <div className="h-3 w-16 skeleton" />
                  <div className="h-2 w-24 skeleton" />
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="h-3 w-12 skeleton ml-auto" />
                <div className="h-2 w-8 skeleton ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Pricing Option Rows Skeleton ── */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <div className="h-3.5 w-28 skeleton" />
          <div className="h-2.5 w-20 skeleton" />
        </div>
        
        {/* 3 Pricing Rows */}
        <div className="space-y-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-[72px] rounded-2xl border border-line/45 bg-bg-card/20 p-4 flex items-center justify-between" >
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full border-2 border-line/70" />
                <div className="space-y-1">
                  <div className="h-3.5 w-16 skeleton" />
                  <div className="h-2 w-32 skeleton" />
                </div>
              </div>
              <div className="h-4 w-12 skeleton" />
            </div>
          ))}
        </div>

        {/* Large primary CTA button */}
        <div className="h-14 w-full skeleton mt-2" />
      </div>
    </div>
  );
}

import type { ComponentType } from "react";
import { Link, useLocation } from "react-router-dom";
import { hapticLight } from "../lib/haptics";

export interface TabItem {
  label: string;
  to: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number | string }>;
}

/** Native-style bottom tab bar: blurred surface, hairline top border,
 *  sliding pill indicator, safe-area padding (DESIGN.md §6). */
export function TabBar({ items }: { items: TabItem[] }) {
  const location = useLocation();
  const activeIndex = items.findIndex((t) => location.pathname === t.to);

  return (
    <nav
      className="bottom-nav md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-line"
      style={{
        background: "color-mix(in srgb, var(--surface-1) 92%, transparent)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="relative flex h-[60px]">
        {/* Sliding active indicator */}
        {activeIndex >= 0 && (
          <span
            className="absolute top-0 h-[3px] rounded-full bg-accent transition-transform duration-enter ease-out-quart"
            style={{
              width: `${100 / items.length / 2}%`,
              left: `${100 / items.length / 4}%`,
              transform: `translateX(${activeIndex * 200}%)`,
            }}
          />
        )}
        {items.map((item, i) => {
          const Icon = item.icon;
          const active = i === activeIndex;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => hapticLight()}
              className="flex-1 flex flex-col items-center justify-center gap-1 select-none"
            >
              <Icon
                className={`h-6 w-6 transition-colors duration-state ${
                  active ? "text-accent" : "text-ink-subtle"
                }`}
                strokeWidth={active ? 2.2 : 1.8}
              />
              <span
                className={`text-[10px] font-semibold tracking-tight transition-colors duration-state ${
                  active ? "text-accent" : "text-ink-subtle"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

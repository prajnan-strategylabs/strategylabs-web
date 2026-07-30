import { Component, type ReactNode } from "react";
import { reportBootRenderError } from "../lib/ota-boot-guard";

/**
 * Catches a render-time failure during initial mount and hands it to the OTA
 * boot guard, which resets to the embedded bundle and reloads. See
 * src/lib/ota-boot-guard.ts for why this only matters before boot completes —
 * this component intentionally renders nothing on error rather than a
 * fallback UI, since recovery is already underway by the time it would show.
 */
export class BootErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    reportBootRenderError(error);
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

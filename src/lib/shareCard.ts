import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";
import { Filesystem, Directory } from "@capacitor/filesystem";

const isNative = Capacitor.isNativePlatform();

interface ShareStats {
  total_return_pct: number;
  win_rate_pct: number;
  sharpe_ratio: number;
  max_drawdown_pct: number;
  trade_count: number;
}

/** Renders a square social card for a backtest result and returns the canvas. */
function renderCard(stats: ShareStats, asset: string, equity: number[]): HTMLCanvasElement {
  const S = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d")!;

  const ACCENT = "#22d3aa";
  const BG = "#0a0e1a";
  const MUTED = "rgba(232,236,244,0.55)";
  const SUBTLE = "rgba(232,236,244,0.35)";

  // Background
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, S, S);
  const glow = ctx.createRadialGradient(S * 0.85, S * 0.12, 0, S * 0.85, S * 0.12, S * 0.55);
  glow.addColorStop(0, "rgba(34,211,170,0.16)");
  glow.addColorStop(1, "rgba(34,211,170,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, S, S);

  // Header
  ctx.fillStyle = ACCENT;
  ctx.font = "800 34px system-ui, -apple-system, sans-serif";
  ctx.fillText("STRATEGY LABS", 72, 110);
  ctx.fillStyle = SUBTLE;
  ctx.font = "600 26px system-ui, sans-serif";
  ctx.fillText("HISTORICAL BACKTEST RESULT", 72, 156);

  // Return %
  const ret = stats.total_return_pct;
  ctx.fillStyle = ret >= 0 ? ACCENT : "#fb7185";
  ctx.font = "800 170px system-ui, sans-serif";
  ctx.fillText(`${ret >= 0 ? "+" : ""}${ret}%`, 64, 360);
  ctx.fillStyle = MUTED;
  ctx.font = "600 34px system-ui, sans-serif";
  ctx.fillText(`${asset} · historical backtest · ${stats.trade_count} trades`, 72, 424);

  // Equity curve
  if (equity.length > 1) {
    const x0 = 72, y0 = 500, w = S - 144, h = 280;
    const min = Math.min(...equity), max = Math.max(...equity);
    const span = max - min || 1;
    ctx.beginPath();
    equity.forEach((v, i) => {
      const x = x0 + (i / (equity.length - 1)) * w;
      const y = y0 + h - ((v - min) / span) * h;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 5;
    ctx.lineJoin = "round";
    ctx.stroke();
    // Fill under curve
    ctx.lineTo(x0 + w, y0 + h);
    ctx.lineTo(x0, y0 + h);
    ctx.closePath();
    const fill = ctx.createLinearGradient(0, y0, 0, y0 + h);
    fill.addColorStop(0, "rgba(34,211,170,0.22)");
    fill.addColorStop(1, "rgba(34,211,170,0)");
    ctx.fillStyle = fill;
    ctx.fill();
  }

  // Metrics row
  const metrics = [
    { k: "WIN RATE", v: `${stats.win_rate_pct}%` },
    { k: "SHARPE", v: String(stats.sharpe_ratio) },
    { k: "MAX DRAWDOWN", v: `−${stats.max_drawdown_pct}%` },
  ];
  const colW = (S - 144) / 3;
  metrics.forEach((m, i) => {
    const x = 72 + i * colW;
    ctx.fillStyle = SUBTLE;
    ctx.font = "700 24px system-ui, sans-serif";
    ctx.fillText(m.k, x, 880);
    ctx.fillStyle = i === 2 ? "#fda4af" : "#e8ecf4";
    ctx.font = "800 56px system-ui, sans-serif";
    ctx.fillText(m.v, x, 945);
  });

  // Footer
  ctx.fillStyle = ACCENT;
  ctx.font = "700 30px system-ui, sans-serif";
  ctx.fillText("strategylabs.trade", 72, 1020);
  ctx.fillStyle = SUBTLE;
  ctx.font = "500 22px system-ui, sans-serif";
  ctx.fillText("Backtested results · Not financial advice", 380, 1020);

  return canvas;
}

/**
 * Generates the share card image and opens the platform share sheet.
 * Falls back to downloading the PNG on web browsers without share support.
 */
export async function shareBacktestCard(
  stats: ShareStats,
  asset: string,
  equity: number[]
): Promise<void> {
  const canvas = renderCard(stats, asset, equity);
  const dataUrl = canvas.toDataURL("image/png");
  const fileName = `strategylabs-backtest-${Date.now()}.png`;

  if (isNative) {
    const base64 = dataUrl.split(",")[1];
    const written = await Filesystem.writeFile({
      path: fileName,
      data: base64,
      directory: Directory.Cache,
    });
    await Share.share({
      title: "My Strategy Labs backtest",
      text: `My strategy returned ${stats.total_return_pct >= 0 ? "+" : ""}${stats.total_return_pct}% on ${asset} in a historical backtest. Built with AI on strategylabs.trade`,
      files: [written.uri],
    });
    return;
  }

  // Web: try the native share sheet with the image file
  const blob: Blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/png")
  );
  const file = new File([blob], fileName, { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "My Strategy Labs backtest" });
      return;
    } catch {
      // user cancelled or share failed — fall through to download
    }
  }

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(a.href);
}

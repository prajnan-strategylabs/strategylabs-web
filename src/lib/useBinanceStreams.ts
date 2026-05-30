import { useEffect, useMemo, useRef, useState } from "react";

export interface LiveTick {
  /** Latest trade price. `null` until the first WS message lands. */
  price: number | null;
  /** Unix ms of the most recent tick — for "Xs ago" display. */
  lastTickAt: number | null;
  /** Direction of the most recent price change vs the previous tick. */
  tickDir: "up" | "down" | "flat";
}

/** REST snapshot helper — used to prime the table before the first WS frame. */
async function fetchBinancePrice(symbol: string): Promise<number | null> {
  try {
    const binSym = symbol.replace("/", "");
    const res = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=${binSym}`,
    );
    if (!res.ok) return null;
    const data: { price?: string } = await res.json();
    return data.price ? parseFloat(data.price) : null;
  } catch {
    return null;
  }
}

/** Convert "BTC/USDT" → "btcusdt" (Binance stream-name format). */
function streamName(symbol: string): string {
  return symbol.replace("/", "").toLowerCase();
}

/**
 * Subscribe to live trade ticks for many symbols on ONE WebSocket connection
 * (Binance's combined-streams endpoint). Returns a map from
 * `"BTC/USDT"` → `{ price, lastTickAt, tickDir }`.
 *
 * Pass an empty array to disconnect. The hook diffs the *content* of the
 * symbol list — passing `["BTC/USDT", "ETH/USDT"]` and then
 * `["ETH/USDT", "BTC/USDT"]` on the next render does NOT re-subscribe.
 */
export function useBinanceTradeStreams(
  symbols: string[],
): Record<string, LiveTick> {
  // Stable key: sorted, deduped. Re-renders that produce the same set of
  // symbols won't tear down + rebuild the WebSocket.
  const key = useMemo(() => {
    return Array.from(new Set(symbols)).sort().join("|");
  }, [symbols]);
  const stableSymbols = useMemo(
    () => (key ? key.split("|") : []),
    [key],
  );

  const [ticks, setTicks] = useState<Record<string, LiveTick>>(() => {
    const init: Record<string, LiveTick> = {};
    for (const s of stableSymbols) {
      init[s] = { price: null, lastTickAt: null, tickDir: "flat" };
    }
    return init;
  });

  // Track previous price per symbol without triggering re-renders
  const lastPriceRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    // Reset state when the symbol list changes
    setTicks(() => {
      const next: Record<string, LiveTick> = {};
      for (const s of stableSymbols) {
        next[s] = { price: null, lastTickAt: null, tickDir: "flat" };
      }
      return next;
    });
    lastPriceRef.current = new Map();

    if (stableSymbols.length === 0) return;

    let cancelled = false;
    let ws: WebSocket | null = null;
    let reconnectTimer: number | null = null;

    // Map stream-name ("btcusdt@trade") back to the original "BTC/USDT" key
    const streamToSymbol = new Map<string, string>();
    const streams = stableSymbols.map((sym) => {
      const sn = `${streamName(sym)}@trade`;
      streamToSymbol.set(sn, sym);
      return sn;
    });

    // Prime with REST snapshots so the table doesn't render "—" for the
    // first second while the WS handshake completes.
    void Promise.all(
      stableSymbols.map(async (sym) => {
        const p = await fetchBinancePrice(sym);
        if (cancelled || p == null) return;
        lastPriceRef.current.set(sym, p);
        setTicks((prev) => ({
          ...prev,
          [sym]: {
            price: p,
            lastTickAt: Date.now(),
            tickDir: "flat",
          },
        }));
      }),
    );

    const url = `wss://stream.binance.com:9443/stream?streams=${streams.join("/")}`;

    const connect = () => {
      try {
        ws = new WebSocket(url);
      } catch {
        reconnectTimer = window.setTimeout(connect, 2000);
        return;
      }

      ws.onmessage = (e) => {
        try {
          const msg: { stream?: string; data?: { p?: string } } = JSON.parse(e.data);
          const sym = msg.stream ? streamToSymbol.get(msg.stream) : undefined;
          const priceStr = msg.data?.p;
          if (!sym || !priceStr) return;
          const p = parseFloat(priceStr);
          if (!Number.isFinite(p)) return;
          const prev = lastPriceRef.current.get(sym);
          lastPriceRef.current.set(sym, p);
          setTicks((prevState) => ({
            ...prevState,
            [sym]: {
              price: p,
              lastTickAt: Date.now(),
              tickDir:
                prev == null
                  ? "flat"
                  : p > prev
                    ? "up"
                    : p < prev
                      ? "down"
                      : "flat",
            },
          }));
        } catch {
          /* malformed frame — ignore */
        }
      };

      ws.onclose = () => {
        if (!cancelled) {
          reconnectTimer = window.setTimeout(connect, 2000);
        }
      };

      ws.onerror = () => {
        ws?.close();
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
    };
  }, [key, stableSymbols]);

  return ticks;
}

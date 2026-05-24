/**
 * Database type definitions.
 * Keep in sync with `supabase/migrations/*.sql`.
 *
 * Later we can autogenerate this with `supabase gen types typescript`
 */

export type Database = {
  public: {
    Tables: {
      waitlist: {
        Row: {
          id: string;
          email: string;
          source: string | null;
          referrer: string | null;
          utm: Record<string, string> | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          email: string;
          source?: string | null;
          referrer?: string | null;
          utm?: Record<string, string> | null;
          notes?: string | null;
        };
        Update: Partial<{
          email: string;
          source: string | null;
          notes: string | null;
        }>;
      };

      profiles: {
        Row: {
          id: string;                  // matches auth.users.id
          email: string;
          display_name: string | null;
          tier: "free" | "explorer" | "trader" | "pro" | "auto";
          tier_status: "active" | "trialing" | "past_due" | "canceled" | null;
          tier_renews_at: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          tier?: "free" | "explorer" | "trader" | "pro" | "auto";
        };
        Update: Partial<{
          display_name: string | null;
          tier: "free" | "explorer" | "trader" | "pro" | "auto";
          tier_status: "active" | "trialing" | "past_due" | "canceled" | null;
          tier_renews_at: string | null;
        }>;
      };

      strategies: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          spec: Record<string, unknown>;    // JSON: the strategy spec
          source_prompt: string | null;     // original user prompt (if AI-built)
          status: "draft" | "backtesting" | "ready" | "live" | "paused" | "archived";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          spec: Record<string, unknown>;
          source_prompt?: string | null;
          status?: "draft" | "backtesting" | "ready" | "live" | "paused" | "archived";
        };
        Update: Partial<{
          name: string;
          spec: Record<string, unknown>;
          status: "draft" | "backtesting" | "ready" | "live" | "paused" | "archived";
        }>;
      };

      backtest_runs: {
        Row: {
          id: string;
          strategy_id: string;
          user_id: string;
          start_date: string;
          end_date: string;
          stats: Record<string, unknown>;   // total_pnl, win_rate, max_dd, etc.
          trades: Record<string, unknown>;  // serialized trade list
          robustness: Record<string, unknown> | null;
          status: "queued" | "running" | "completed" | "failed";
          error: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          strategy_id: string;
          user_id: string;
          start_date: string;
          end_date: string;
        };
        Update: Partial<{
          stats: Record<string, unknown>;
          trades: Record<string, unknown>;
          robustness: Record<string, unknown> | null;
          status: "queued" | "running" | "completed" | "failed";
          error: string | null;
          completed_at: string | null;
        }>;
      };

      signals: {
        Row: {
          id: string;
          strategy_id: string;
          symbol: string;
          direction: "long" | "short";
          entry: number;
          stop_loss: number;
          tp1: number;
          tp2: number | null;
          rr: number;
          rsi: number | null;
          atr_pct: number | null;
          regime: string | null;
          status: "new" | "filled" | "stopped" | "closed_tp" | "closed_trail" | "expired";
          pnl_usd: number | null;
          exit_price: number | null;
          exit_reason: string | null;
          created_at: string;
          closed_at: string | null;
        };
        Insert: {
          strategy_id: string;
          symbol: string;
          direction: "long" | "short";
          entry: number;
          stop_loss: number;
          tp1: number;
          tp2?: number | null;
          rr: number;
          rsi?: number | null;
          atr_pct?: number | null;
          regime?: string | null;
        };
      };
    };
  };
};

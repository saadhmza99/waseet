import { supabase } from "@/lib/supabase";

export type AnalyticsRange = "active" | "today" | "yesterday" | "week" | "month";

export type AnalyticsCategoryRow = {
  category: string;
  members: number;
};

export type AnalyticsPageRow = {
  path: string;
  views: number;
  unique_visitors: number;
  watch_ms_total: number;
  watch_ms_avg: number;
  clicks: number;
};

export type VisitorAnalytics = {
  range: AnalyticsRange | string;
  from: string;
  to: string;
  generated_at: string;
  active_sessions: number;
  sessions: number;
  visitors: number;
  page_views: number;
  clicks: number;
  watch_ms_total: number;
  signed_up: number;
  members: number;
  guest_visitors: number;
  regular_visitors: number;
  categories: AnalyticsCategoryRow[];
  pages: AnalyticsPageRow[];
};

export const analyticsService = {
  async getOverview(range: AnalyticsRange): Promise<VisitorAnalytics> {
    const { data, error } = await supabase.rpc("admin_visitor_analytics", {
      p_range: range,
    });
    if (error) throw error;
    const row = (data || {}) as Partial<VisitorAnalytics>;
    return {
      range: String(row.range || range),
      from: String(row.from || ""),
      to: String(row.to || ""),
      generated_at: String(row.generated_at || ""),
      active_sessions: Number(row.active_sessions || 0),
      sessions: Number(row.sessions || 0),
      visitors: Number(row.visitors || 0),
      page_views: Number(row.page_views || 0),
      clicks: Number(row.clicks || 0),
      watch_ms_total: Number(row.watch_ms_total || 0),
      signed_up: Number(row.signed_up || 0),
      members: Number(row.members || 0),
      guest_visitors: Number(row.guest_visitors || 0),
      regular_visitors: Number(row.regular_visitors || 0),
      categories: Array.isArray(row.categories) ? row.categories : [],
      pages: Array.isArray(row.pages) ? row.pages : [],
    };
  },
};

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Pie, PieChart, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";
import { CalendarCheck, FileSignature, TrendingUp, BriefcaseBusiness } from "lucide-react";

export function DashboardOverview() {
  const [data, setData] = useState<{
    trend: { date: string; bookings: number; quotes: number }[];
    statuses: { name: string; value: number; color: string }[];
    totals: { bookings: number; quotes: number; projects: number; conversion: number };
    loading: boolean;
  }>({ trend: [], statuses: [], totals: { bookings: 0, quotes: 0, projects: 0, conversion: 0 }, loading: true });

  useEffect(() => {
    async function fetchData() {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

      const [bookingsRes, quotesRes, projectsRes] = await Promise.all([
        supabase.from("bookings").select("created_at, status").gte("created_at", thirtyDaysAgo),
        supabase.from("quote_requests").select("created_at, status").gte("created_at", thirtyDaysAgo),
        supabase.from("portfolio").select("id", { count: "exact", head: true }),
      ]);

      const bookings = bookingsRes.data || [];
      const quotes = quotesRes.data || [];

      // Process Trend Data
      const days = eachDayOfInterval({
        start: subDays(new Date(), 29),
        end: new Date(),
      });

      const trend = days.map((day) => {
        const dateStr = format(day, "MMM dd");
        const dayStart = startOfDay(day);
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);

        return {
          date: dateStr,
          bookings: bookings.filter((b) => {
            const d = new Date(b.created_at);
            return d >= dayStart && d <= dayEnd;
          }).length,
          quotes: quotes.filter((q) => {
            const d = new Date(q.created_at);
            return d >= dayStart && d <= dayEnd;
          }).length,
        };
      });

      // Process Status Data (Bookings)
      const statusCounts: Record<string, number> = {};
      bookings.forEach((b) => {
        statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
      });
      const statusColors = ["var(--cocoa)", "var(--copper)", "var(--espresso)", "var(--muted-foreground)"];
      const statuses = Object.entries(statusCounts).map(([name, value], index) => ({ name, value, color: statusColors[index % statusColors.length] }));
      const positiveBookings = bookings.filter((booking) => booking.status === "confirmed" || booking.status === "completed").length;
      const conversion = bookings.length ? Math.round((positiveBookings / bookings.length) * 100) : 0;

      setData({
        trend,
        statuses,
        totals: { bookings: bookings.length, quotes: quotes.length, projects: projectsRes.count ?? 0, conversion },
        loading: false,
      });
    }

    fetchData();
  }, []);

  const trendConfig = {
    bookings: { label: "Bookings", color: "var(--cocoa)" },
    quotes: { label: "Quotes", color: "var(--copper)" },
  } satisfies ChartConfig;

  const statusConfig = Object.fromEntries(
    data.statuses.map((s) => [s.name, { label: s.name, color: s.color }]),
  ) as ChartConfig;

  if (data.loading) {
    return <div className="grid h-64 place-items-center"><p className="animate-pulse text-sm text-muted-foreground">Loading chart data...</p></div>;
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Bookings · 30 days", value: data.totals.bookings, icon: CalendarCheck },
          { label: "Quotes · 30 days", value: data.totals.quotes, icon: FileSignature },
          { label: "Booking conversion", value: `${data.totals.conversion}%`, icon: TrendingUp },
          { label: "Published projects", value: data.totals.projects, icon: BriefcaseBusiness },
        ].map((metric) => (
          <Card key={metric.label} className="border-espresso/10">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground"><span>{metric.label}</span><metric.icon className="h-4 w-4 text-cocoa" /></div>
              <p className="mt-3 font-display text-3xl font-black text-espresso">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="lg:col-span-4 border-espresso/10">
        <CardHeader>
          <CardTitle className="font-display font-black text-espresso">Activity Over Time</CardTitle>
          <CardDescription>Bookings and Quotes for the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartContainer config={trendConfig}>
              <AreaChart data={data.trend}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-bookings)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--color-bookings)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorQuotes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-quotes)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--color-quotes)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8}
                  minTickGap={32}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke="var(--color-bookings)"
                  fillOpacity={1}
                  fill="url(#colorBookings)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="quotes"
                  stroke="var(--color-quotes)"
                  fillOpacity={1}
                  fill="url(#colorQuotes)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3 border-espresso/10">
        <CardHeader>
          <CardTitle className="font-display font-black text-espresso">Booking Status</CardTitle>
          <CardDescription>Distribution of recent bookings</CardDescription>
        </CardHeader>
        <CardContent>
          {data.statuses.length === 0 ? (
            <div className="grid h-[240px] place-items-center text-sm text-muted-foreground">No bookings yet</div>
          ) : (
            <>
              <ChartContainer config={statusConfig} className="mx-auto h-[240px] w-full">
                <PieChart>
                  <Pie
                    data={data.statuses}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                  >
                    {data.statuses.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                </PieChart>
              </ChartContainer>
              <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
                {data.statuses.map((s) => (
                  <div key={s.name} className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                    <span className="capitalize">{s.name} · {s.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

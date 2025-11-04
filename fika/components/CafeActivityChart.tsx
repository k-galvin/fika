import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client"; // Adjust path as needed
import TwoLineActivityChart from "./TwoLineActivityChart";

interface CafeActivityChartProps {
  cafeId: number;
}

interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

interface ActivityData {
  time_period: string;
  daily_visit_count: number;
  daily_save_count: number;
}

const CafeActivityChart: React.FC<CafeActivityChartProps> = ({ cafeId }) => {
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchActivity = async () => {
      // 1. Calculate start and end dates for the last 30 days
      const now = new Date();
      // Calculate 29 days ago in milliseconds to include today
      const twentyNineDaysAgo = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);

      // Format dates as 'YYYY-MM-DD' strings for PostgreSQL function arguments
      const endDate = now.toISOString().split("T")[0];
      const startDate = twentyNineDaysAgo.toISOString().split("T")[0];

      try {
        // 2. Call the Supabase stored procedure (RPC)
        const { data, error } = await supabase.rpc(
          "get_coffee_shop_activity_over_time",
          {
            target_coffee_shop_id: cafeId, // Passes the ID of the current cafe
            start_date: startDate,
            end_date: endDate,
          }
        ) as { data: ActivityData[] | null; error: SupabaseError | null };

        if (error) throw error;

        const fetchedDataMap = new Map(
          data?.map((item: { time_period: string; daily_visit_count: number; daily_save_count: number; }) => [item.time_period, item])
        );

        const thirtyDayData = Array.from({ length: 30 }, (_, i) => {
          const date = new Date(twentyNineDaysAgo);
          date.setDate(twentyNineDaysAgo.getDate() + i);
          const formattedDate = date.toISOString().split("T")[0];

          return (
            fetchedDataMap.get(formattedDate) || {
              time_period: formattedDate,
              daily_visit_count: 0,
              daily_save_count: 0,
            } as ActivityData
          );
        });

        setActivityData(thirtyDayData);
      } catch (error: unknown) {
        console.error("Error fetching activity data:", (error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if cafeId is provided
    if (cafeId) {
      fetchActivity();
    }
  }, [cafeId, supabase]); // Re-run effect if cafeId changes

  if (loading) return <div>Loading recent activity trends...</div>;

  // 4. Render the visualization component
  return (
    <div className="cafe-activity-container w-full">
      <h4>Cafe Activity (Last 30 Days)</h4>
      <TwoLineActivityChart data={activityData} />
    </div>
  );
};

export default CafeActivityChart;

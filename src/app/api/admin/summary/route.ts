import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getTodayRange } from "@/lib/date";

export async function GET() {
  const { start, end } = getTodayRange();

  // 1. Get today's orders + items
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(`
      id,
      status,
      created_at,
      order_items (
        product_name,
        quantity
      )
    `)
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString());

  if (error) {
    console.error("SUMMARY ERROR:", error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  // 2. Filter only active kitchen orders
  const activeOrders =
    data?.filter(
      (order) =>
        order.status !== "picked_up"
    ) || [];

  // 3. Build summary
  const summary: Record<string, number> = {};

  activeOrders.forEach((order: any) => {
    order.order_items?.forEach(
      (item: any) => {
        if (!item.product_name) return;

        summary[item.product_name] =
          (summary[item.product_name] || 0) +
          item.quantity;
      }
    );
  });

  return NextResponse.json(summary);
}
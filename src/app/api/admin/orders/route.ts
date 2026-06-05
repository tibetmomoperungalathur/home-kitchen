import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getTodayRange } from "@/lib/date";


export async function GET() {

const { start, end } =
  getTodayRange();

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(`
      *,
      customers (
        name,
        phone,
        email
      ),
      order_items (
        id,
        product_name,
        quantity
      )
    `)
    .gte(
        "created_at",
        start.toISOString()
      )
      .lte(
        "created_at",
        end.toISOString()
      )
    .order("created_at", { ascending: false });

    console.log(data);
  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
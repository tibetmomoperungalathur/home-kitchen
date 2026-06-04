import { NextResponse }
from "next/server";

import {
  supabaseAdmin,
} from "@/lib/supabase/server";

export async function GET() {
  const { data } =
    await supabaseAdmin
      .from("order_items")
      .select(`
        product_name,
        quantity,
        orders!inner (
          status
        )
      `);

  const summary:
    Record<
      string,
      number
    > = {};

  data?.forEach(
    (item: any) => {
      summary[
        item.product_name
      ] =
        (summary[
          item.product_name
        ] || 0) +
        item.quantity;
    }
  );

  return NextResponse.json(
    summary
  );
}
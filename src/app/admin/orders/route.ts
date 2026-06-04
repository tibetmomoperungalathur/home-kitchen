import {
    NextResponse,
  } from "next/server";
  
  import {
    supabaseAdmin,
  } from "@/lib/supabase/server";
  
  export async function GET() {
    const { data, error } =
      await supabaseAdmin
        .from("orders")
        .select(`
          *,
          customers (
            name,
            phone,
            email
          ),
          order_items (
            *
          )
        `)
        .order(
          "created_at",
          {
            ascending: false,
          }
        );
  
    if (error) {
      return NextResponse.json(
        { error },
        { status: 500 }
      );
    }
  
    return NextResponse.json(
      data
    );
  }
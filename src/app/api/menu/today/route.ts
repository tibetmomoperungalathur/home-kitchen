import { supabase } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabase
    .from("daily_menu")
    .select(`
      id,
      price,
      products (
        id,
        name,
        description
      )
    `)
    .eq("available_date", new Date().toISOString().split("T")[0])
    .eq("active", true);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
  console.log("Calling SUPABASE");
console.log(data);
  return NextResponse.json(data);
}
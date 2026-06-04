import {
    NextResponse,
  } from "next/server";
  
  import {
    supabaseAdmin,
  } from "@/lib/supabase/server";
  
  export async function PATCH(
    request: Request,
    context: {
      params: Promise<{
        id: string;
      }>;
    }
  ) {
    const { id } =
      await context.params;
  
    const { status } =
      await request.json();
  
    const { error } =
      await supabaseAdmin
        .from("orders")
        .update({
          status,
        })
        .eq("id", id);
  
    if (error) {
      return NextResponse.json(
        { error },
        { status: 500 }
      );
    }
  
    return NextResponse.json({
      success: true,
    });
  }
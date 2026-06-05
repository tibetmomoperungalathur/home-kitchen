import {
    NextRequest,
    NextResponse,
  } from "next/server";
  
  import {
    supabaseAdmin,
  } from "@/lib/supabase/server";
  
  export async function GET(
    request: NextRequest
  ) {
    try {
      const searchParams =
        request.nextUrl.searchParams;
  
      const range =
        searchParams.get("range") ||
        "7d";
  
      const start =
        searchParams.get("start");
  
      const end =
        searchParams.get("end");
  
      let query = supabaseAdmin
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
        .order(
          "created_at",
          {
            ascending: false,
          }
        );
  
      // ----------------------------
      // CUSTOM DATE RANGE
      // ----------------------------
  
      if (start && end) {
        const startDate =
          new Date(start);
  
        startDate.setHours(
          0,
          0,
          0,
          0
        );
  
        const endDate =
          new Date(end);
  
        endDate.setHours(
          23,
          59,
          59,
          999
        );
  
        query = query
          .gte(
            "created_at",
            startDate.toISOString()
          )
          .lte(
            "created_at",
            endDate.toISOString()
          );
      }
  
      // ----------------------------
      // PRESET RANGES
      // ----------------------------
  
      else {
        const now =
          new Date();
  
        let startDate:
          | Date
          | null = null;
  
        switch (range) {
          case "today":
            startDate =
              new Date();
  
            startDate.setHours(
              0,
              0,
              0,
              0
            );
  
            query = query.gte(
              "created_at",
              startDate.toISOString()
            );
            break;
  
          case "yesterday":
            const yesterday =
              new Date();
  
            yesterday.setDate(
              yesterday.getDate() -
                1
            );
  
            yesterday.setHours(
              0,
              0,
              0,
              0
            );
  
            const yesterdayEnd =
              new Date(yesterday);
  
            yesterdayEnd.setHours(
              23,
              59,
              59,
              999
            );
  
            query = query
              .gte(
                "created_at",
                yesterday.toISOString()
              )
              .lte(
                "created_at",
                yesterdayEnd.toISOString()
              );
  
            break;
  
          case "7d":
            startDate =
              new Date();
  
            startDate.setDate(
              startDate.getDate() -
                7
            );
  
            query = query.gte(
              "created_at",
              startDate.toISOString()
            );
  
            break;
  
          case "30d":
            startDate =
              new Date();
  
            startDate.setDate(
              startDate.getDate() -
                30
            );
  
            query = query.gte(
              "created_at",
              startDate.toISOString()
            );
  
            break;
  
          case "all":
          default:
            break;
        }
      }
  
      const {
        data,
        error,
      } = await query;
  
      if (error) {
        console.error(
          "History API Error:",
          error
        );
  
        return NextResponse.json(
          {
            error:
              error.message,
          },
          {
            status: 500,
          }
        );
      }
  
      return NextResponse.json(
        data
      );
    } catch (error) {
      console.error(error);
  
      return NextResponse.json(
        {
          error:
            "Failed to load history",
        },
        {
          status: 500,
        }
      );
    }
  }
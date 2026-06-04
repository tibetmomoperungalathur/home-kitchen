import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { generateOrderNumber } from "@/lib/order-number";
import { orderingOpen } from "@/lib/cutoff";

export async function POST(
  request: Request
) {
  try {
    if (!orderingOpen()) {
        return NextResponse.json(
          {
            error:
              "Today's ordering has closed.",
          },
          {
            status: 400,
          }
        );
      }
    const body = await request.json();

    const {
      name,
      phone,
      email,
      notes,
      items,
    } = body;

    //
    // Find customer
    //

    let customerId: string;

    const { data: existingCustomer } =
      await supabaseAdmin
        .from("customers")
        .select("*")
        .eq("phone", phone)
        .single();

    if (existingCustomer) {
      customerId = existingCustomer.id;

      await supabaseAdmin
        .from("customers")
        .update({
          name,
          email,
        })
        .eq("id", customerId);
    } else {
      const { data: newCustomer, error } =
        await supabaseAdmin
          .from("customers")
          .insert({
            name,
            phone,
            email,
          })
          .select()
          .single();

      if (error) throw error;

      customerId = newCustomer.id;
    }

    //
    // Anti-spam
    //

    const fiveMinutesAgo =
      new Date(
        Date.now() - 5 * 60 * 1000
      ).toISOString();

    const { data: recentOrders } =
      await supabaseAdmin
        .from("orders")
        .select(`
          id,
          customer_id,
          created_at
        `)
        .eq("customer_id", customerId)
        .gte(
          "created_at",
          fiveMinutesAgo
        );

    if (recentOrders?.length) {
      return NextResponse.json(
        {
          error:
            "Please wait 5 minutes before placing another order.",
        },
        { status: 429 }
      );
    }

    //
    // Get menu items
    //

    const menuIds = items.map(
      (item: any) => item.menuId
    );

    const { data: menuItems } =
      await supabaseAdmin
        .from("daily_menu")
        .select(`
          *,
          products (
            name
          )
        `)
        .in("id", menuIds);

    if (!menuItems) {
      throw new Error(
        "Menu items not found"
      );
    }

    //
    // Calculate subtotal
    //

    let subtotal = 0;

    const orderItems = items.map(
      (item: any) => {
        const menu = menuItems.find(
          (m) => m.id === item.menuId
        );

        if (!menu) {
          throw new Error(
            "Invalid menu item"
          );
        }

        const lineTotal =
          Number(menu.price) *
          item.quantity;

        subtotal += lineTotal;

        return {
          daily_menu_id: menu.id,

          product_name:
            menu.products.name,

          unit_price:
            menu.price,

          quantity:
            item.quantity,

          line_total:
            lineTotal,
        };
      }
    );

    //
    // Create order
    //

    const { data: order, error } =
      await supabaseAdmin
        .from("orders")
        .insert({
          order_number:
            generateOrderNumber(),

          customer_id:
            customerId,

          subtotal,

          notes,

          status: "pending",

          pickup_date:
            new Date()
              .toISOString()
              .split("T")[0],
        })
        .select()
        .single();

    if (error) throw error;

    //
    // Save order items
    //
    const rows = orderItems.map(
        (item: {
          daily_menu_id: string;
          quantity: number;
        }) => ({
          ...item,
          order_id: order.id,
        })
      );

    const {
      error: orderItemError,
    } = await supabaseAdmin
      .from("order_items")
      .insert(rows);

    if (orderItemError)
      throw orderItemError;

    return NextResponse.json({
      success: true,
      orderNumber:
        order.order_number,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Unable to create order",
      },
      { status: 500 }
    );
  }
}
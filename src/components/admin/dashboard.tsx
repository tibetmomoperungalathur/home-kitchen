"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { AdminOrder } from "@/types/admin";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ViewMode =
  | "all"
  | "pending"
  | "preparing"
  | "ready"
  | "picked_up";

export default function Dashboard() {
  const supabase = createClient();
  const router = useRouter();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const [activeView, setActiveView] =
    useState<ViewMode>("all");

  const loadOrders = async () => {
    try {
      const [ordersResponse, summaryResponse] =
        await Promise.all([
          fetch("/api/admin/orders"),
          fetch("/api/admin/summary"),
        ]);

      if (!ordersResponse.ok) {
        throw new Error("Failed to load orders");
      }

      const ordersData = await ordersResponse.json();
      const summaryData = await summaryResponse.json();

      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setSummary(summaryData || {});
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const confirmed = confirm(
      "Are you sure you want to logout?"
    );
  
    if (!confirmed) return;
  
    await supabase.auth.signOut();
  
    router.push("/login");
  };

  useEffect(() => {
    loadOrders();

    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          loadOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(
        `/api/admin/orders/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        const result = await response.json();
        alert(result.error || "Failed to update status");
        return;
      }

      await loadOrders();
    } catch (error) {
      console.error(error);
    }
  };

  // -----------------------------
  // COUNTS
  // -----------------------------

  const counts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    ready: orders.filter((o) => o.status === "ready").length,
    picked_up: orders.filter((o) => o.status === "picked_up").length,
  };

  // -----------------------------
  // FILTERED VIEW
  // -----------------------------

  const visibleOrders =
    activeView === "all"
      ? orders
      : orders.filter((o) => o.status === activeView);

  if (loading) {
    return <div className="p-4">Loading orders...</div>;
  }

  
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <h1 className="text-3xl font-bold">
                Kitchen Dashboard
              </h1>

              <p className="mt-1 text-gray-500">
                {new Date().toLocaleDateString("en-AU", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="flex gap-2">
              <Link
                href="/admin/history"
                className="rounded-xl border px-4 py-2 font-medium hover:bg-gray-100"
              >
                History
              </Link>

              <button
  onClick={handleLogout}
  className="rounded-xl bg-red-500 px-4 py-2 font-medium text-white hover:bg-red-600"
>
  Logout
</button>
            </div>

          </div>
        </div>

        {/* OVERVIEW (CLICKABLE) */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="mb-4 text-lg font-bold">
            Today's Overview
          </h2>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

            <button
              onClick={() => setActiveView("all")}
              className="rounded-xl bg-blue-50 p-4 text-left hover:bg-blue-100"
            >
              <div className="text-sm text-gray-500">Orders</div>
              <div className="text-3xl font-bold">{orders.length}</div>
            </button>

            <button
              onClick={() => setActiveView("pending")}
              className="rounded-xl bg-red-50 p-4 text-left hover:bg-red-100"
            >
              <div className="text-sm text-gray-500">Pending</div>
              <div className="text-3xl font-bold">{counts.pending}</div>
            </button>

            <button
              onClick={() => setActiveView("preparing")}
              className="rounded-xl bg-yellow-50 p-4 text-left hover:bg-yellow-100"
            >
              <div className="text-sm text-gray-500">Preparing</div>
              <div className="text-3xl font-bold">{counts.preparing}</div>
            </button>

            <button
              onClick={() => setActiveView("ready")}
              className="rounded-xl bg-green-50 p-4 text-left hover:bg-green-100"
            >
              <div className="text-sm text-gray-500">Ready</div>
              <div className="text-3xl font-bold">{counts.ready}</div>
            </button>

          </div>

          {/* ACTIVE VIEW LABEL */}
          <div className="mt-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600 capitalize">
              {activeView === "all"
                ? "All Orders"
                : `${activeView} Orders`}
            </h3>

            {activeView !== "all" && (
              <button
                onClick={() => setActiveView("all")}
                className="text-sm text-gray-500 hover:text-black"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* SUMMARY */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">
            Production Summary
          </h2>

          {Object.keys(summary).length === 0 ? (
            <p className="text-gray-500">No active orders</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(summary).map(([name, qty]) => (
                <div
                  key={name}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                >
                  <span>{name}</span>
                  <span className="font-bold">{qty}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ORDERS LIST (CONTEXTUAL) */}
        <div className="space-y-4">

          {visibleOrders.length === 0 ? (
            <div className="rounded-xl bg-white p-6 text-gray-500 shadow-sm">
              No orders in this view
            </div>
          ) : (
            visibleOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl bg-white p-4 shadow-sm"
              >

                {/* HEADER */}
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-xs text-red-500">
                    #{order.order_number}
                  </span>

                  <span className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleTimeString(
                      "en-AU",
                      { hour: "2-digit", minute: "2-digit" }
                    )}
                  </span>
                </div>

                {/* CUSTOMER */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold">
                      {order.customers.name}
                    </h3>

                    <p className="text-sm text-blue-600">
                      {order.customers.phone}
                    </p>
                  </div>

                  <span className="rounded bg-gray-100 px-2 py-1 text-xs capitalize">
                    {order.status.replace("_", " ")}
                  </span>
                </div>

                {/* ITEMS */}
                <div className="mt-3 space-y-1">
                  {order.order_items.map((item) => (
                    <p key={item.id} className="text-sm">
                      {item.quantity} × {item.product_name}
                    </p>
                  ))}
                </div>

                {/* TOTAL */}
                <div className="mt-3 font-bold">
                <span className="text-yellow-600">$ </span>{Number(order.subtotal).toFixed(2)}
                </div>

                {/* ACTIONS */}
                <div className="mt-3 flex gap-2">

                  {order.status === "pending" && (
                    <button
                      onClick={() =>
                        updateStatus(order.id, "preparing")
                      }
                      className="rounded bg-blue-500 px-3 py-1 text-white"
                    >
                      Start
                    </button>
                  )}

                  {order.status === "preparing" && (
                    <button
                      onClick={() =>
                        updateStatus(order.id, "ready")
                      }
                      className="rounded bg-green-500 px-3 py-1 text-white"
                    >
                      Ready
                    </button>
                  )}

                  {order.status === "ready" && (
                    <button
                      onClick={() =>
                        updateStatus(order.id, "picked_up")
                      }
                      className="rounded bg-gray-700 px-3 py-1 text-white"
                    >
                      Picked Up
                    </button>
                  )}

                  {order.status === "picked_up" && (
                    <span className="text-sm text-green-600 font-semibold">
                      ✓ Done
                    </span>
                  )}

                </div>

              </div>
            ))
          )}

        </div>

      </div>
    </div>
  );
}
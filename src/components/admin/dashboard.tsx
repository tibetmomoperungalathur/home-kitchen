"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { AdminOrder } from "@/types/admin";
import StatusColumn from "@/components/admin/status-column";

type OrderStatus =
  | "all"
  | "pending"
  | "preparing"
  | "ready"
  | "picked_up";

export default function Dashboard() {
  const supabase = createClient();

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<OrderStatus>("all");
  const [loading, setLoading] = useState(true);

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

      setOrders(
        Array.isArray(ordersData)
          ? ordersData
          : []
      );

      setSummary(summaryData || {});
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
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

  const updateStatus = async (
    id: string,
    status: string
  ) => {
    try {
      const response = await fetch(
        `/api/admin/orders/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      if (!response.ok) {
        const result =
          await response.json();

        alert(
          result.error ||
            "Failed to update status"
        );

        return;
      }

      await loadOrders();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter(
          (order) =>
            order.status === filter
        );

  const counts = {
    all: orders.length,
    pending: orders.filter(
      (o) => o.status === "pending"
    ).length,
    preparing: orders.filter(
      (o) => o.status === "preparing"
    ).length,
    ready: orders.filter(
      (o) => o.status === "ready"
    ).length,
    picked_up: orders.filter(
      (o) => o.status === "picked_up"
    ).length,
  };

  const pendingOrders = orders.filter(
    (o) => o.status === "pending"
  );
  
  const preparingOrders = orders.filter(
    (o) => o.status === "preparing"
  );
  
  const readyOrders = orders.filter(
    (o) => o.status === "ready"
  );
  
  const pickedUpOrders = orders.filter(
    (o) => o.status === "picked_up"
  );

  if (loading) {
    return (
      <div className="p-4">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Tabs */}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() =>
            setFilter("all")
          }
          className="rounded bg-black px-3 py-2 text-white"
        >
          All ({counts.all})
        </button>

        <button
          onClick={() =>
            setFilter("pending")
          }
          className="rounded bg-yellow-500 px-3 py-2 text-white"
        >
          Pending ({counts.pending})
        </button>

        <button
          onClick={() =>
            setFilter("preparing")
          }
          className="rounded bg-blue-500 px-3 py-2 text-white"
        >
          Preparing ({counts.preparing})
        </button>

        <button
          onClick={() =>
            setFilter("ready")
          }
          className="rounded bg-green-500 px-3 py-2 text-white"
        >
          Ready ({counts.ready})
        </button>

        <button
          onClick={() =>
            setFilter("picked_up")
          }
          className="rounded bg-gray-600 px-3 py-2 text-white"
        >
          Picked Up ({counts.picked_up})
        </button>
      </div>

      {/* Production Summary */}

      <div className="rounded-xl bg-white p-4 shadow">
        <h2 className="mb-4 text-lg font-bold">
          Production Summary
        </h2>

        {Object.keys(summary).length === 0 ? (
          <p className="text-gray-500">
            No active orders
          </p>
        ) : (
          Object.entries(summary).map(
            ([name, qty]) => (
              <div
                key={name}
                className="flex justify-between py-1"
              >
                <span>{name}</span>
                <span>{qty}</span>
              </div>
            )
          )
        )}
      </div>

      {/* Orders */}

      {filteredOrders.map((order) => (
        <div
          key={order.id}
          className="rounded-xl bg-white p-4 shadow"
        >
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-xs text-gray-500">
                #{order.order_number}
              </span>

              <span className="text-xs text-gray-500">
                {new Date(
                  order.created_at
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold">
                {order.customers.name}
              </h3>

              <p className="text-sm text-gray-600">
                {order.customers.phone}
              </p>

              {order.customers.email && (
                <p className="text-sm text-gray-600">
                  {order.customers.email}
                </p>
              )}
            </div>

            <span className="rounded bg-gray-100 px-2 py-1 text-sm capitalize">
              {order.status.replace(
                "_",
                " "
              )}
            </span>
          </div>

          <div className="mt-4 space-y-1">
            {order.order_items.map(
              (item) => (
                <p key={item.id}>
                  {item.quantity} ×{" "}
                  {item.product_name}
                </p>
              )
            )}
          </div>

          {order.notes && (
            <div className="mt-3 rounded bg-yellow-50 p-2 text-sm">
              Note: {order.notes}
            </div>
          )}

          <div className="mt-4 font-bold">
            $
            {Number(
              order.subtotal
            ).toFixed(2)}
          </div>

          <div className="mt-4">
            {order.status ===
              "pending" && (
              <button
                onClick={() =>
                  updateStatus(
                    order.id,
                    "preparing"
                  )
                }
                className="rounded bg-blue-500 px-3 py-2 text-white"
              >
                Start Preparing
              </button>
            )}

            {order.status ===
              "preparing" && (
              <button
                onClick={() =>
                  updateStatus(
                    order.id,
                    "ready"
                  )
                }
                className="rounded bg-green-500 px-3 py-2 text-white"
              >
                Mark Ready
              </button>
            )}

            {order.status ===
              "ready" && (
              <button
                onClick={() =>
                  updateStatus(
                    order.id,
                    "picked_up"
                  )
                }
                className="rounded bg-gray-700 px-3 py-2 text-white"
              >
                Mark Picked Up
              </button>
            )}

            {order.status ===
              "picked_up" && (
              <div className="font-semibold text-green-600">
                ✓ Picked Up
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
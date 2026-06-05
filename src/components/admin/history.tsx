"use client";

import { useEffect, useState } from "react";
import { AdminOrder } from "@/types/admin";

type Range =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "all";

export default function History() {
  const [orders, setOrders] =
    useState<AdminOrder[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [range, setRange] =
    useState<Range>("7d");

  const [search, setSearch] =
    useState("");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);

      let url =
        "/api/admin/history";

      if (
        startDate &&
        endDate
      ) {
        url +=
          `?start=${startDate}` +
          `&end=${endDate}`;
      } else {
        url +=
          `?range=${range}`;
      }

      const response =
        await fetch(url);

      const data =
        await response.json();

      setOrders(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [range]);

  // ------------------------
  // SEARCH
  // ------------------------

  const filteredOrders =
    orders.filter(
      (order) => {
        const q =
          search.toLowerCase();

        return (
          order.customers.name
            .toLowerCase()
            .includes(q) ||
          order.customers.phone.includes(
            q
          ) ||
          order.order_number
            .toLowerCase()
            .includes(q)
        );
      }
    );

  // ------------------------
  // SUMMARY
  // ------------------------

  const totalRevenue =
    filteredOrders.reduce(
      (sum, order) =>
        sum +
        Number(
          order.subtotal
        ),
      0
    );

  const averageOrder =
    filteredOrders.length > 0
      ? totalRevenue /
        filteredOrders.length
      : 0;

  // ------------------------
  // GROUP BY DATE
  // ------------------------

  const groupedOrders =
    filteredOrders.reduce<
      Record<
        string,
        AdminOrder[]
      >
    >((acc, order) => {
      const date =
        new Date(
          order.created_at
        ).toLocaleDateString(
          "en-AU"
        );

      if (!acc[date]) {
        acc[date] = [];
      }

      acc[date].push(order);

      return acc;
    }, {});

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">

      {/* HEADER */}

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">
          Order History
        </h1>

        <p className="mt-1 text-gray-500">
          Search and review past orders
        </p>
      </div>

      {/* STATS */}

      <div className="grid gap-4 md:grid-cols-3">

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">
            Orders
          </div>

          <div className="text-3xl font-bold">
            {filteredOrders.length}
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">
            Revenue
          </div>

          <div className="text-3xl font-bold">
            $
            {totalRevenue.toFixed(
              2
            )}
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">
            Average Order
          </div>

          <div className="text-3xl font-bold">
            $
            {averageOrder.toFixed(
              2
            )}
          </div>
        </div>

      </div>

      {/* FILTERS */}

      <div className="rounded-2xl bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-4">

          {/* QUICK FILTERS */}

          <div className="flex flex-wrap gap-2">

            {[
              "today",
              "yesterday",
              "7d",
              "30d",
              "all",
            ].map((item) => (
              <button
                key={item}
                onClick={() => {
                  setStartDate("");
                  setEndDate("");

                  setRange(
                    item as Range
                  );
                }}
                className={`rounded-lg px-3 py-2 text-sm ${
                  range === item
                    ? "bg-black text-white"
                    : "bg-gray-100"
                }`}
              >
                {item}
              </button>
            ))}

          </div>

          {/* CUSTOM DATES */}

          <div className="flex flex-col gap-3 md:flex-row">

            <input
              type="date"
              value={startDate}
              onChange={(e) =>
                setStartDate(
                  e.target.value
                )
              }
              className="rounded-lg border p-2"
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) =>
                setEndDate(
                  e.target.value
                )
              }
              className="rounded-lg border p-2"
            />

            <button
              onClick={
                loadOrders
              }
              className="rounded-lg bg-blue-500 px-4 py-2 text-white"
            >
              Apply
            </button>

          </div>

          {/* SEARCH */}

          <input
            type="text"
            placeholder="Search name, phone or order number..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="rounded-lg border p-2"
          />

        </div>

      </div>

      {/* LIST */}

      {loading ? (
        <div>
          Loading history...
        </div>
      ) : (
        Object.entries(
          groupedOrders
        ).map(
          ([date, orders]) => (
            <div
              key={date}
              className="space-y-3"
            >
              <h2 className="text-lg font-bold">
                {date}
              </h2>

              {orders.map(
                (order) => (
                  <div
                    key={order.id}
                    className="rounded-xl bg-white p-4 shadow-sm"
                  >
                    <div className="flex justify-between">

                      <div>
                        <div className="font-mono text-sm text-gray-500">
                          #
                          {
                            order.order_number
                          }
                        </div>

                        <h3 className="font-bold">
                          {
                            order
                              .customers
                              .name
                          }
                        </h3>

                        <p className="text-sm text-gray-500">
                          {
                            order
                              .customers
                              .phone
                          }
                        </p>
                      </div>

                      <div className="text-right">

                        <div className="text-sm">
                          {new Date(
                            order.created_at
                          ).toLocaleTimeString(
                            "en-AU"
                          )}
                        </div>

                        <div className="text-sm capitalize text-gray-500">
                          {order.status.replace(
                            "_",
                            " "
                          )}
                        </div>

                      </div>

                    </div>

                    <div className="mt-3 space-y-1">

                      {order.order_items.map(
                        (
                          item
                        ) => (
                          <div
                            key={
                              item.id
                            }
                          >
                            {
                              item.quantity
                            }{" "}
                            ×{" "}
                            {
                              item.product_name
                            }
                          </div>
                        )
                      )}

                    </div>

                    <div className="mt-3 font-bold">
                      $
                      {Number(
                        order.subtotal
                      ).toFixed(
                        2
                      )}
                    </div>

                  </div>
                )
              )}

            </div>
          )
        )
      )}

    </div>
  );
}
import { AdminOrder } from "@/types/admin";

interface Props {
  title: string;
  color: string;
  orders: AdminOrder[];
  updateStatus: (
    id: string,
    status:
      | "preparing"
      | "ready"
      | "picked_up"
  ) => void;
}

export default function StatusColumn({
  title,
  color,
  orders,
  updateStatus,
}: Props) {
  return (
    <div className="rounded-2xl bg-gray-100 p-4">
      <div
        className={`${color} mb-4 rounded-xl p-3 text-center font-bold text-white`}
      >
        {title} ({orders.length})
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-xl bg-white p-4 shadow-sm border"
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

            <h3 className="font-bold">
              {order.customers.name}
            </h3>

            <p className="text-sm text-gray-500">
              {order.customers.phone}
            </p>

            <div className="mt-3 space-y-1">
              {order.order_items.map(
                (item) => (
                  <div key={item.id}>
                    {item.quantity} ×{" "}
                    {item.product_name}
                  </div>
                )
              )}
            </div>

            {order.notes && (
              <div className="mt-3 rounded bg-yellow-50 p-2 text-sm">
                {order.notes}
              </div>
            )}

            <div className="mt-3 font-semibold">
              $
              {Number(
                order.subtotal
              ).toFixed(2)}
            </div>

            {order.status ===
              "pending" && (
              <button
                onClick={() =>
                  updateStatus(
                    order.id,
                    "preparing"
                  )
                }
                className="mt-4 w-full rounded bg-blue-500 py-2 text-white"
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
                className="mt-4 w-full rounded bg-green-500 py-2 text-white"
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
                className="mt-4 w-full rounded bg-gray-700 py-2 text-white"
              >
                Mark Picked Up
              </button>
            )}

            {order.status ===
              "picked_up" && (
              <div className="mt-4 font-semibold text-green-600">
                ✓ Picked Up
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
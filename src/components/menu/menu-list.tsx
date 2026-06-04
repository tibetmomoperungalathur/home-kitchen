"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { MenuItem } from "@/types/menu";

import OrderForm from "@/components/order/order-form";

export default function MenuList({
    menu,
    orderingOpen,
  }: {
    menu: MenuItem[];
    orderingOpen: boolean;
  }) {
  const router = useRouter();

  const [cart, setCart] = useState<
    Record<string, number>
  >({});

  const [loading, setLoading] =
    useState(false);

  const updateQty = (
    id: string,
    change: number
  ) => {
    setCart((prev) => ({
      ...prev,
      [id]: Math.max(
        0,
        (prev[id] || 0) + change
      ),
    }));
  };

  const totalItems =
    Object.values(cart).reduce(
      (a, b) => a + b,
      0
    );

    const totalPrice = menu.reduce(
        (sum, item) =>
          sum +
          item.price *
            (cart[item.id] || 0),
        0
      );

  const submitOrder = async (
    formData: any
  ) => {
    const items = Object.entries(cart)
      .filter(([_, qty]) => qty > 0)
      .map(([menuId, quantity]) => ({
        menuId,
        quantity,
      }));

    if (!items.length) {
      alert(
        "Please add at least one item."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/orders",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            ...formData,
            items,
          }),
        }
      );

      if (!response.ok) {
        const result =
  await response.json();

if (!response.ok) {
  alert(
    result.error ||
      "Unable to create order"
  );

  return;
}
      }

      const result =
  await response.json();

router.push(
  `/success/${result.orderNumber}`
);
    } catch (error) {
      alert(
        "Could not submit order."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-4">

      {!orderingOpen && (
  <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
    Today's ordering has closed.
  </div>
)}

        <div className="rounded-xl bg-white p-4 shadow">
          <h2 className="mb-4 font-bold">
            Customer Information
          </h2>

          <OrderForm
  onSubmit={submitOrder}
  disabled={!orderingOpen}
/>
        </div>

        {menu.map((item) => (
          <div
            key={item.id}
            className="rounded-xl bg-white p-4 shadow"
          >
            <h2 className="font-semibold">
              {item.products.name}
            </h2>

            <p className="text-sm text-gray-500">
              {item.products.description}
            </p>

            <div className="mt-3 flex justify-between">

              <span>
                ${item.price}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    updateQty(item.id, -1)
                  }
                >
                  -
                </button>

                <span>
                  {cart[item.id] || 0}
                </span>

                <button
                  onClick={() =>
                    updateQty(item.id, 1)
                  }
                >
                  +
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-4">
  <div className="mx-auto max-w-md">

    <div className="flex justify-between">
      <span>{totalItems} items</span>

      <span>
        ${totalPrice.toFixed(2)}
      </span>
    </div>

  </div>
</div>
    </>
  );
}
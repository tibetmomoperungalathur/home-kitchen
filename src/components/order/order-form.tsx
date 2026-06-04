"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  OrderSchema,
  OrderFormData,
} from "@/lib/validations/order";

export default function OrderForm({
    onSubmit,
    disabled,
  }: {
    onSubmit: (data: OrderFormData) => void;
    disabled?: boolean;
  }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(OrderSchema),
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <input
        {...register("name")}
        placeholder="Name"
        className="w-full rounded border p-3"
      />

      {errors.name && (
        <p className="text-red-500">
          {errors.name.message}
        </p>
      )}

      <input
        {...register("phone")}
        placeholder="0412345678"
        className="w-full rounded border p-3"
      />

      {errors.phone && (
        <p className="text-red-500">
          {errors.phone.message}
        </p>
      )}

      <input
        {...register("email")}
        placeholder="Email"
        className="w-full rounded border p-3"
      />

      <textarea
        {...register("notes")}
        placeholder="Notes"
        className="w-full rounded border p-3"
      />

<button
  type="submit"
  disabled={disabled}
  className="w-full rounded bg-black p-3 text-white disabled:bg-gray-300"
>
  Place Order
</button>
    </form>
  );
}
import { z } from "zod";

export const OrderSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters"),

  phone: z
    .string()
    .regex(/^04\d{8}$/, "Invalid Australian mobile number"),

  email: z
    .string()
    .email("Invalid email")
    .optional()
    .or(z.literal("")),

  notes: z.string().optional(),
});

export type OrderFormData = z.infer<typeof OrderSchema>;
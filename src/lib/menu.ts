import { MenuItem } from "@/types/menu";

export async function getTodayMenu(): Promise<MenuItem[]> {
  const response = await fetch(
    "http://localhost:3000/api/menu/today",
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to load menu");
  }

  return response.json();
}
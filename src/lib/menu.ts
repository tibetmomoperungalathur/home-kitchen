import { MenuItem } from "@/types/menu";

export async function getTodayMenu(): Promise<MenuItem[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/menu/today`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to load menu");
  }

  return response.json();
}
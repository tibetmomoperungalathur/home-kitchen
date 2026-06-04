import { getTodayMenu } from "@/lib/menu";
import MenuList from "@/components/menu/menu-list";
import { orderingOpen } from "@/lib/cutoff";

export default async function HomePage() {
  const open =
  orderingOpen();
  const menu = await getTodayMenu();

  if (!menu.length) {
    return (
      <main className="p-8">
        <h1>No menu available today.</h1>
      </main>
    );
  }
  return (
    
    <main className="min-h-screen bg-gray-50 pb-24">
      <div className="mx-auto max-w-md p-4">

        <header className="mb-6">
          <h1 className="text-3xl font-bold">
            Home Kitchen
          </h1>

          <p className="text-gray-600">
            Orders close at 11:00 AM
          </p>
        </header>

        <MenuList
  menu={menu}
  orderingOpen={open}
/>
      </div>
    </main>
  );
}
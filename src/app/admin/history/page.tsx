import Link from "next/link";
import History from "@/components/admin/history";

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Order History
        </h1>

        <Link
          href="/admin"
          className="rounded bg-black px-4 py-2 text-white"
        >
          Dashboard
        </Link>
      </div>

      <History />
    </div>
  );
}
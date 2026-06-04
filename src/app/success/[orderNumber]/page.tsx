interface Props {
  params: Promise<{
    orderNumber: string;
  }>;
}

export default async function SuccessPage({
  params,
}: Props) {
  const { orderNumber } =
    await params;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">

      <div className="rounded-xl bg-white p-8 shadow text-center">

        <div className="mb-4 text-5xl">
          ✅
        </div>

        <h1 className="text-2xl font-bold">
          Order Received
        </h1>

        <p className="mt-4 text-gray-500">
          Order Number
        </p>

        <p className="font-bold">
          {orderNumber}
        </p>

        <p className="mt-6">
          Pickup after 4:00 PM
        </p>

      </div>

    </main>
  );
}
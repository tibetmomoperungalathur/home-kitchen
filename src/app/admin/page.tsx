import {
    createClient,
  } from "@/lib/supabase/server-auth";
  
  import {
    redirect,
  } from "next/navigation";
  
  import Dashboard
from "@/components/admin/dashboard";

  export default async function AdminPage() {
    const supabase =
      await createClient();
  
    const {
      data: { user },
    } =
      await supabase.auth.getUser();
  
    if (!user) {
      redirect("/login");
    }
  
    return (
        <main className="min-h-screen bg-gray-100 p-6">
      
          <h1 className="mb-6 text-3xl font-bold">
            Kitchen Dashboard
          </h1>
      
          <Dashboard />
      
        </main>
      );
  }
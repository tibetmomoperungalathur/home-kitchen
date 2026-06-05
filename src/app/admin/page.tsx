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
      
          <Dashboard />
      
        </main>
      );
  }
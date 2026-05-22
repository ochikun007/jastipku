import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MobileDashboard } from "@/components/mobile-dashboard";

export default async function Home() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (!session) {
    redirect("/login");
  }

  return <MobileDashboard />;
}

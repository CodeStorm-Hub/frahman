import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { TopHeader } from "@/components/layout/top-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-dvh bg-background">
      {/* Desktop: fixed left sidebar */}
      <AppSidebar />

      {/* Mobile: sticky top header */}
      <TopHeader />

      {/* Main scrollable content */}
      <main className="flex min-h-dvh flex-col md:ml-16 lg:ml-60">
        {/*
          pb-24 on mobile leaves clearance above the fixed bottom nav (h-16)
          md:pb-8 restores normal padding on desktop where bottom nav is hidden
        */}
        <div className="flex-1 p-4 pb-24 md:p-8 md:pb-8">{children}</div>
      </main>

      {/* Mobile: fixed bottom tab bar */}
      <MobileBottomNav />
    </div>
  );
}

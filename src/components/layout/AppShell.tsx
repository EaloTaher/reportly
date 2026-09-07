import { Outlet } from "react-router-dom"
import { BottomTabBar } from "@/components/layout/BottomTabBar"

export function AppShell() {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-lg bg-background">
      <div className="pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
        <Outlet />
      </div>
      <BottomTabBar />
    </div>
  )
}

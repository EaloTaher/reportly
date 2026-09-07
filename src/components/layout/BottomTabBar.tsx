import { NavLink, useLocation } from "react-router-dom"
import { ClipboardList, Settings, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/i18n/I18nProvider"

export function BottomTabBar() {
  const { t } = useI18n()
  const location = useLocation()
  const todayActive =
    location.pathname === "/" || location.pathname.startsWith("/reports/")

  const tabs = [
    { to: "/", label: t.tabs.today, icon: ClipboardList, end: true },
    { to: "/customers", label: t.tabs.customers, icon: Users, end: false },
    { to: "/settings", label: t.tabs.settings, icon: Settings, end: false },
  ] as const

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto grid h-16 max-w-lg grid-cols-3">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={() =>
              cn(
                "flex min-h-11 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
                (tab.to === "/" ? todayActive : location.pathname.startsWith(tab.to))
                  ? "text-foreground"
                  : "text-muted-foreground",
              )
            }
          >
            {() => {
              const active =
                tab.to === "/"
                  ? todayActive
                  : location.pathname.startsWith(tab.to)
              return (
                <>
                  <tab.icon
                    className={cn("size-5", active && "stroke-[2.4]")}
                  />
                  {tab.label}
                </>
              )
            }}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

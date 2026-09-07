import type { ReactNode } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useI18n } from "@/i18n/I18nProvider"

type TopBarProps = {
  title: string
  onBack?: () => void
  action?: ReactNode
}

export function TopBar({ title, onBack, action }: TopBarProps) {
  const { t } = useI18n()
  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="flex h-14 items-center gap-1 px-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex size-11 items-center justify-center rounded-xl text-foreground"
            aria-label={t.common.back}
          >
            <svg
              viewBox="0 0 24 24"
              className="size-6 rtl-flip"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        ) : (
          <div className="w-2" />
        )}
        <h1 className="min-w-0 flex-1 truncate text-lg font-semibold tracking-tight">
          {title}
        </h1>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  )
}

export function TopBarSkeleton() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background pt-[env(safe-area-inset-top)]">
      <div className="flex h-14 items-center px-4">
        <Skeleton className="h-6 w-32" />
      </div>
    </header>
  )
}

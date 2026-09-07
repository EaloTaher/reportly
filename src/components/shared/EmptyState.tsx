import { Button } from "@/components/ui/button"

type EmptyStateProps = {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-base font-semibold">{title}</p>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-6 h-11 min-w-40" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}

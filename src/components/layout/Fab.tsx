import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

type FabProps = {
  label: string
  onClick: () => void
  className?: string
}

export function Fab({ label, onClick, className }: FabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "fixed z-30 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg",
        "end-4 bottom-[calc(5.25rem+env(safe-area-inset-bottom))]",
        className,
      )}
    >
      <Plus className="size-7" />
    </button>
  )
}

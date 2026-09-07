import { Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatAmount } from "@/lib/currency"
import { formatVisitTimeLabel } from "@/lib/dates"
import { useSettings } from "@/hooks/useSettings"
import { useI18n } from "@/i18n/I18nProvider"
import type { VisitWithCustomer } from "@/types/database"

type VisitCardProps = {
  visit: VisitWithCustomer
  onEdit: () => void
  onDelete: () => void
}

export function VisitCard({ visit, onEdit, onDelete }: VisitCardProps) {
  const { t } = useI18n()
  const { currency } = useSettings()
  const time = formatVisitTimeLabel(visit.visit_time)

  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/8">
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="min-w-0 flex-1 text-start"
        >
          <p className="text-base font-semibold">
            {visit.customers?.full_name ?? t.visits.unknownCustomer}
          </p>
          {time ? (
            <p className="mt-0.5 text-sm text-muted-foreground">{time}</p>
          ) : null}
        </button>
        <button
          type="button"
          aria-label={t.visits.deleteVisit}
          onClick={onDelete}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
      <button type="button" onClick={onEdit} className="mt-3 w-full text-start">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl bg-muted/60 px-3 py-2">
            <p className="text-xs text-muted-foreground">{t.today.taken}</p>
            <p className="font-medium">
              {formatAmount(visit.amount_taken, currency)}
            </p>
          </div>
          <div className="rounded-xl bg-muted/60 px-3 py-2">
            <p className="text-xs text-muted-foreground">{t.today.left}</p>
            <p className="font-medium">
              {formatAmount(visit.amount_left, currency)}
            </p>
          </div>
        </div>
        {visit.status ? (
          <Badge variant="secondary" className="mt-3 h-6 dir-rtl" dir="rtl">
            {visit.status}
          </Badge>
        ) : null}
        {visit.notes ? (
          <p className="mt-2 text-sm text-muted-foreground">{visit.notes}</p>
        ) : null}
      </button>
    </div>
  )
}

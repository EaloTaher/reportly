import { useMemo, useState } from "react"
import { ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useI18n } from "@/i18n/I18nProvider"
import { dateLocale } from "@/i18n/messages"
import { formatReportDate, todayISODate } from "@/lib/dates"
import type { DailyReport } from "@/types/database"
import { EmptyState } from "@/components/shared/EmptyState"
import { toAsciiDigits } from "@/lib/digits"

type ReportHistoryListProps = {
  reports: DailyReport[]
}

export function ReportHistoryList({ reports }: ReportHistoryListProps) {
  const { t, lang } = useI18n()
  const navigate = useNavigate()
  const today = todayISODate()
  const [query, setQuery] = useState("")

  const past = useMemo(
    () =>
      reports.filter((report) => {
        if (report.report_date === today) return false
        if (!query.trim()) return true
        return (
          report.report_date.includes(query.trim()) ||
          (report.title ?? "").toLowerCase().includes(query.trim().toLowerCase())
        )
      }),
    [reports, today, query],
  )

  return (
    <div className="space-y-3">
      <input
        value={query}
        onChange={(event) => setQuery(toAsciiDigits(event.target.value))}
        placeholder={t.history.search}
        className="h-11 w-full rounded-xl border border-input bg-transparent px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      {past.length === 0 ? (
          <EmptyState
            title={t.history.emptyTitle}
            description={t.history.emptyDesc}
          />
      ) : (
        past.map((report) => (
          <button
            key={report.id}
            type="button"
            onClick={() => navigate(`/reports/${report.id}`)}
            className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-start shadow-sm ring-1 ring-foreground/8"
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{formatReportDate(report.report_date, dateLocale(lang))}</p>
              {report.title ? (
                <p className="text-sm text-muted-foreground">{report.title}</p>
              ) : (
                <p className="text-sm text-muted-foreground">{t.history.dailyReport}</p>
              )}
            </div>
            <ChevronRight className="size-5 text-muted-foreground rtl-flip" />
          </button>
        ))
      )}
    </div>
  )
}

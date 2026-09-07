import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { TopBar } from "@/components/layout/TopBar"
import { Fab } from "@/components/layout/Fab"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "@/components/shared/EmptyState"
import { CardListSkeleton } from "@/components/shared/CardListSkeleton"
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog"
import { VisitCard } from "@/components/reports/VisitCard"
import { VisitFormSheet } from "@/components/reports/VisitFormSheet"
import { ReportHistoryList } from "@/components/reports/ReportHistoryList"
import {
  useReport,
  useReports,
  useStartTodayReport,
  useTodayReport,
} from "@/hooks/useReports"
import { useVisits } from "@/hooks/useVisits"
import { useCustomers } from "@/hooks/useCustomers"
import { Printer } from "lucide-react"
import { useProfile, useSettings } from "@/hooks/useSettings"
import { printDailyReport } from "@/lib/printDailyReport"
import { getPrintHeader } from "@/lib/printHeader"
import { useI18n } from "@/i18n/I18nProvider"
import { dateLocale } from "@/i18n/messages"
import { formatAmount, toAmount } from "@/lib/currency"
import { formatReportDate, todayISODate } from "@/lib/dates"
import type { VisitWithCustomer } from "@/types/database"

export function TodayPage() {
  const { t, lang, dir } = useI18n()
  const { reportId } = useParams()
  const navigate = useNavigate()
  const today = todayISODate()
  const viewingPast = Boolean(reportId)

  const todayQuery = useTodayReport()
  const pastQuery = useReport(reportId)
  const reportsQuery = useReports()
  const startToday = useStartTodayReport()
  const { data: customers } = useCustomers()
  const { currency } = useSettings()
  const profileQuery = useProfile()

  const report = viewingPast ? pastQuery.data : todayQuery.data
  const reportLoading = viewingPast ? pastQuery.isLoading : todayQuery.isLoading
  const visitsQuery = useVisits(report?.id)

  const [tab, setTab] = useState("today")
  const [visitOpen, setVisitOpen] = useState(false)
  const [editingVisit, setEditingVisit] = useState<VisitWithCustomer | null>(null)
  const [deletingVisit, setDeletingVisit] = useState<VisitWithCustomer | null>(null)

  const totals = useMemo(() => {
    const visits = visitsQuery.data ?? []
    return visits.reduce(
      (acc, visit) => ({
        taken: acc.taken + toAmount(visit.amount_taken),
        left: acc.left + toAmount(visit.amount_left),
      }),
      { taken: 0, left: 0 },
    )
  }, [visitsQuery.data])

  async function onStartToday() {
    try {
      await startToday.mutateAsync()
      toast.success(t.today.started)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t.today.startFailed,
      )
    }
  }

  function openAddVisit() {
    if (!customers?.length) {
      toast.error(t.today.addVisitFirst)
      navigate("/customers")
      return
    }
    setEditingVisit(null)
    setVisitOpen(true)
  }

  function onPrint() {
    if (!report) {
      toast.error(t.today.startTitle)
      return
    }
    const visits = visitsQuery.data ?? []
    printDailyReport({
      header: getPrintHeader() || t.today.printHeaderDefault,
      reportDate: report.report_date,
      preparedBy: profileQuery.data?.full_name?.trim() || "",
      visits,
      currency,
      dir,
      t,
    })
  }

  const title = viewingPast
    ? formatReportDate(pastQuery.data?.report_date ?? "", dateLocale(lang))
    : t.today.title

  return (
    <div>
      <TopBar
        title={title}
        onBack={viewingPast ? () => navigate("/") : undefined}
        action={
          report ? (
            <button
              type="button"
              onClick={onPrint}
              className="inline-flex h-11 min-w-16 items-center justify-center gap-1 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground"
            >
              <Printer className="size-4" />
              {t.today.print}
            </button>
          ) : undefined
        }
      />
      <main className="px-4 py-4">
        {viewingPast ? (
          <ReportDetail
            loading={reportLoading || visitsQuery.isLoading}
            missing={!reportLoading && !report}
            visits={visitsQuery.data}
            totals={totals}
            currency={currency}
            onEdit={(visit) => {
              setEditingVisit(visit)
              setVisitOpen(true)
            }}
            onDelete={setDeletingVisit}
          />
        ) : (
          <Tabs value={tab} onValueChange={setTab} className="gap-4">
            <TabsList className="h-11 w-full">
              <TabsTrigger className="h-9" value="today">
                {t.today.title}
              </TabsTrigger>
              <TabsTrigger className="h-9" value="history">
                {t.today.history}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="today">
              {reportLoading ? (
                <CardListSkeleton />
              ) : !report ? (
                <div className="rounded-2xl bg-card p-5 text-center shadow-sm ring-1 ring-foreground/8">
                  <p className="text-lg font-semibold">{t.today.startTitle}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {formatReportDate(today, dateLocale(lang))} — {t.today.startHint}
                  </p>
                  <Button
                    className="mt-5 h-11 w-full"
                    onClick={() => void onStartToday()}
                    disabled={startToday.isPending}
                  >
                    {startToday.isPending ? t.today.starting : t.today.start}
                  </Button>
                </div>
              ) : (
                <ReportDetail
                  loading={visitsQuery.isLoading}
                  missing={false}
                  visits={visitsQuery.data}
                  totals={totals}
                  currency={currency}
                  onEdit={(visit) => {
                    setEditingVisit(visit)
                    setVisitOpen(true)
                  }}
                  onDelete={setDeletingVisit}
                />
              )}
            </TabsContent>
            <TabsContent value="history">
              {reportsQuery.isLoading ? (
                <CardListSkeleton />
              ) : (
                <ReportHistoryList reports={reportsQuery.data ?? []} />
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>

      {report && (!viewingPast ? tab === "today" : true) ? (
        <Fab label={t.visits.add} onClick={openAddVisit} />
      ) : null}

      {report ? (
        <VisitFormSheet
          open={visitOpen}
          onOpenChange={(open) => {
            setVisitOpen(open)
            if (!open) setEditingVisit(null)
          }}
          reportId={report.id}
          visit={editingVisit}
        />
      ) : null}

      <ConfirmDeleteDialog
        open={Boolean(deletingVisit)}
        onOpenChange={(open) => {
          if (!open) setDeletingVisit(null)
        }}
        title={t.today.deleteVisitTitle}
        description={t.today.deleteVisitDesc}
        confirming={visitsQuery.deleteVisit.isPending}
        onConfirm={() => {
          if (!deletingVisit || !report) return
          void visitsQuery.deleteVisit
            .mutateAsync({ id: deletingVisit.id, report_id: report.id })
            .then(() => {
              toast.success(t.today.visitDeleted)
              setDeletingVisit(null)
            })
            .catch((error: unknown) => {
              toast.error(
                error instanceof Error ? error.message : t.today.deleteVisitFailed,
              )
            })
        }}
      />
    </div>
  )
}

function ReportDetail({
  loading,
  missing,
  visits,
  totals,
  currency,
  onEdit,
  onDelete,
}: {
  loading: boolean
  missing: boolean
  visits: VisitWithCustomer[] | undefined
  totals: { taken: number; left: number }
  currency: string
  onEdit: (visit: VisitWithCustomer) => void
  onDelete: (visit: VisitWithCustomer) => void
}) {
  const { t } = useI18n()
  if (loading) return <CardListSkeleton />
  if (missing) {
    return (
      <EmptyState
        title={t.today.reportMissingTitle}
        description={t.today.reportMissingDesc}
      />
    )
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/8">
          <p className="text-xs text-muted-foreground">{t.today.taken}</p>
          <p className="mt-1 text-base font-semibold">
            {formatAmount(totals.taken, currency)}
          </p>
        </div>
        <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/8">
          <p className="text-xs text-muted-foreground">{t.today.left}</p>
          <p className="mt-1 text-base font-semibold">
            {formatAmount(totals.left, currency)}
          </p>
        </div>
      </div>
      {!visits?.length ? (
        <EmptyState
          title={t.today.noVisitsTitle}
          description={t.today.noVisitsDesc}
        />
      ) : (
        visits.map((visit) => (
          <VisitCard
            key={visit.id}
            visit={visit}
            onEdit={() => onEdit(visit)}
            onDelete={() => onDelete(visit)}
          />
        ))
      )}
    </div>
  )
}

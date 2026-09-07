import { useEffect, useMemo, useRef, useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FormDrawer } from "@/components/shared/FormDrawer"
import { CurrencyAmountInput } from "@/components/shared/CurrencyAmountInput"
import { useCustomers } from "@/hooks/useCustomers"
import { useVisits } from "@/hooks/useVisits"
import {
  DEFAULT_STATUS,
  NOTES_QUICK_FILL,
  STATUS_OPTIONS,
} from "@/lib/constants"
import { toAmount } from "@/lib/currency"
import { toAsciiDigits } from "@/lib/digits"
import { formatVisitTime } from "@/lib/dates"
import { useI18n } from "@/i18n/I18nProvider"
import type { VisitWithCustomer } from "@/types/database"

type VisitFormValues = {
  customer_id: string
  visit_time?: string
  amount_taken: number
  amount_left: number
  status: string
  notes?: string
}

type VisitFormSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  reportId: string
  visit?: VisitWithCustomer | null
}

export function VisitFormSheet({
  open,
  onOpenChange,
  reportId,
  visit,
}: VisitFormSheetProps) {
  const { t } = useI18n()
  const { data: customers = [] } = useCustomers()
  const { addVisit, updateVisit } = useVisits(reportId)
  const [search, setSearch] = useState("")
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const isEdit = Boolean(visit)

  const schema = useMemo(
    () =>
      z.object({
        customer_id: z.string().min(1, t.errors.pickCustomer),
        visit_time: z.string().optional(),
        amount_taken: z.number(),
        amount_left: z.number(),
        status: z.string(),
        notes: z.string().optional(),
      }),
    [t],
  )

  const form = useForm<VisitFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      customer_id: "",
      visit_time: "",
      amount_taken: 0,
      amount_left: 0,
      status: DEFAULT_STATUS,
      notes: "",
    },
  })

  useEffect(() => {
    if (!open) return
    setSearch("")
    setPickerOpen(false)
    form.reset({
      customer_id: visit?.customer_id ?? "",
      visit_time: formatVisitTime(visit?.visit_time) ?? "",
      amount_taken: toAmount(visit?.amount_taken),
      amount_left: toAmount(visit?.amount_left),
      status: visit?.status || DEFAULT_STATUS,
      notes: visit?.notes ?? "",
    })
  }, [open, visit, form])

  const selectedId = form.watch("customer_id")
  const status = form.watch("status")
  const selected = customers.find((customer) => customer.id === selectedId)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return customers
    return customers.filter(
      (customer) =>
        customer.full_name.toLowerCase().includes(q) ||
        customer.phone_number.includes(q),
    )
  }, [customers, search])

  useEffect(() => {
    if (!pickerOpen) return

    function onPointerDown(event: PointerEvent) {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setPickerOpen(false)
      }
    }

    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [pickerOpen])

  function pickCustomer(id: string) {
    form.setValue("customer_id", id, { shouldValidate: true })
    setPickerOpen(false)
    setSearch("")
  }

  async function onSubmit(values: VisitFormValues) {
    const payload = {
      report_id: reportId,
      customer_id: values.customer_id,
      visit_time: values.visit_time?.trim() ? values.visit_time : null,
      amount_taken: values.amount_taken,
      amount_left: values.amount_left,
      status: values.status,
      notes: values.notes,
    }
    try {
      if (visit) {
        await updateVisit.mutateAsync({ id: visit.id, ...payload })
        toast.success(t.visits.updated)
      } else {
        await addVisit.mutateAsync(payload)
        toast.success(t.visits.added)
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t.visits.saveFailed)
    }
  }

  const saving = addVisit.isPending || updateVisit.isPending

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? t.visits.edit : t.visits.add}
    >
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-2" ref={pickerRef}>
          <Label>{t.visits.customer}</Label>
          <button
            type="button"
            aria-expanded={pickerOpen}
            onClick={() => setPickerOpen((current) => !current)}
            className="flex h-11 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 text-start"
          >
            {selected ? (
              <span className="min-w-0 truncate text-sm font-medium">
                {selected.full_name}
                <span className="ms-2 text-xs font-normal text-muted-foreground">
                  {selected.phone_number}
                </span>
              </span>
            ) : (
              <span className="truncate text-sm text-muted-foreground">
                {t.visits.select}
              </span>
            )}
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          </button>
          {pickerOpen ? (
            <div
              className="overflow-hidden rounded-xl border border-input bg-popover shadow-md"
              onKeyDown={(event) => {
                if (event.key === "Escape") setPickerOpen(false)
              }}
            >
              <div className="p-2">
                <Input
                  autoFocus
                  className="h-11"
                  placeholder={t.visits.search}
                  value={search}
                  onChange={(event) => setSearch(toAsciiDigits(event.target.value))}
                />
              </div>
              <div className="max-h-56 overflow-y-auto pb-1">
                {filtered.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-muted-foreground">
                    {t.visits.noMatch}
                  </p>
                ) : (
                  filtered.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => pickCustomer(customer.id)}
                      className={
                        selectedId === customer.id
                          ? "flex min-h-11 w-full items-center gap-2 bg-muted px-3 py-2 text-start"
                          : "flex min-h-11 w-full items-center gap-2 px-3 py-2 text-start"
                      }
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {customer.full_name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {customer.phone_number}
                        </span>
                      </span>
                      {selectedId === customer.id ? (
                        <Check className="size-4 shrink-0 text-primary" />
                      ) : null}
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : null}
          {form.formState.errors.customer_id ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.customer_id.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="visit_time">{t.visits.time}</Label>
          <Input
            id="visit_time"
            type="time"
            className="h-11"
            {...form.register("visit_time")}
          />
        </div>

        <div className="space-y-2">
          <Label>{t.visits.taken}</Label>
          <Controller
            control={form.control}
            name="amount_taken"
            render={({ field }) => (
              <CurrencyAmountInput
                key={`taken-${open}-${visit?.id ?? "new"}`}
                value={toAmount(visit?.amount_taken)}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>{t.visits.left}</Label>
          <Controller
            control={form.control}
            name="amount_left"
            render={({ field }) => (
              <CurrencyAmountInput
                key={`left-${open}-${visit?.id ?? "new"}`}
                value={toAmount(visit?.amount_left)}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">{t.visits.status}</Label>
          <Input id="status" className="h-11" {...form.register("status")} />
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                dir="rtl"
                onClick={() => form.setValue("status", option)}
                className={
                  status === option
                    ? "h-8 rounded-full bg-primary px-3 text-sm text-primary-foreground"
                    : "h-8 rounded-full bg-muted px-3 text-sm"
                }
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="notes">{t.visits.notes}</Label>
            <button
              type="button"
              dir="rtl"
              className="h-8 rounded-full bg-muted px-3 text-sm"
              onClick={() => form.setValue("notes", NOTES_QUICK_FILL)}
            >
              {NOTES_QUICK_FILL}
            </button>
          </div>
          <Textarea id="notes" rows={3} {...form.register("notes")} />
        </div>

        <Button type="submit" className="h-11 w-full" disabled={saving}>
          {saving ? t.common.saving : isEdit ? t.visits.edit : t.visits.add}
        </Button>
      </form>
    </FormDrawer>
  )
}

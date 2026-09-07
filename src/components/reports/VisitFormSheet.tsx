import { useEffect, useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return customers
    return customers.filter(
      (customer) =>
        customer.full_name.toLowerCase().includes(q) ||
        customer.phone_number.includes(q),
    )
  }, [customers, search])

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
        <div className="space-y-2">
          <Label>{t.visits.customer}</Label>
          <Input
            className="h-11"
            placeholder={t.visits.search}
            value={search}
            onChange={(event) => setSearch(toAsciiDigits(event.target.value))}
          />
          <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl ring-1 ring-foreground/10">
            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted-foreground">
                {t.visits.noMatch}
              </p>
            ) : (
              filtered.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => form.setValue("customer_id", customer.id, { shouldValidate: true })}
                  className={
                    selectedId === customer.id
                      ? "flex min-h-11 w-full flex-col items-start px-3 py-2 text-start bg-muted"
                      : "flex min-h-11 w-full flex-col items-start px-3 py-2 text-start"
                  }
                >
                  <span className="text-sm font-medium">{customer.full_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {customer.phone_number}
                  </span>
                </button>
              ))
            )}
          </div>
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
          <Label>{t.visits.status}</Label>
          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger dir="rtl" className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option} dir="rtl">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
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

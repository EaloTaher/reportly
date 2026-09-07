import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormDrawer } from "@/components/shared/FormDrawer"
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog"
import { useCustomers } from "@/hooks/useCustomers"
import { useI18n } from "@/i18n/I18nProvider"
import { toAsciiDigits } from "@/lib/digits"
import { isUniqueViolation } from "@/lib/errors"
import type { Customer } from "@/types/database"

type CustomerFormValues = {
  full_name: string
  phone_number: string
  address: string
}

type CustomerFormSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer?: Customer | null
}

export function CustomerFormSheet({
  open,
  onOpenChange,
  customer,
}: CustomerFormSheetProps) {
  const { t } = useI18n()
  const {
    data: customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
  } = useCustomers()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isEdit = Boolean(customer)

  const schema = useMemo(
    () =>
      z.object({
        full_name: z.string().trim().min(1, t.errors.nameRequired),
        phone_number: z.string().trim().min(1, t.errors.phoneRequired),
        address: z.string().trim().min(1, t.errors.addressRequired),
      }),
    [t],
  )

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: "",
      phone_number: "",
      address: "",
    },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      full_name: customer?.full_name ?? "",
      phone_number: customer?.phone_number ?? "",
      address: customer?.address ?? "",
    })
  }, [open, customer, form])

  function rejectDuplicatePhone(phone: string): boolean {
    const clash = customers?.find(
      (item) => item.phone_number === phone && item.id !== customer?.id,
    )
    if (!clash) return false
    form.setError("phone_number", { message: t.errors.phoneTaken })
    toast.error(t.errors.phoneTaken, { description: clash.full_name })
    return true
  }

  async function onSubmit(values: CustomerFormValues) {
    const phone = toAsciiDigits(values.phone_number).trim()
    if (rejectDuplicatePhone(phone)) return
    try {
      if (customer) {
        await updateCustomer.mutateAsync({ id: customer.id, ...values })
        toast.success(t.customers.updated)
      } else {
        await addCustomer.mutateAsync(values)
        toast.success(t.customers.added)
      }
      onOpenChange(false)
    } catch (error) {
      if (isUniqueViolation(error)) {
        form.setError("phone_number", { message: t.errors.phoneTaken })
        toast.error(t.errors.phoneTaken)
        return
      }
      toast.error(t.customers.saveFailed, {
        description: error instanceof Error ? error.message : undefined,
      })
    }
  }

  async function onDelete() {
    if (!customer) return
    try {
      await deleteCustomer.mutateAsync(customer.id)
      toast.success(t.customers.deleted)
      setConfirmDelete(false)
      onOpenChange(false)
    } catch (error) {
      toast.error(t.customers.deleteFailed, {
        description: error instanceof Error ? error.message : undefined,
      })
    }
  }

  const saving = addCustomer.isPending || updateCustomer.isPending

  return (
    <>
      <FormDrawer
        open={open}
        onOpenChange={onOpenChange}
        title={isEdit ? t.customers.edit : t.customers.add}
      >
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="full_name">{t.customers.fullName}</Label>
            <Input
              id="full_name"
              className="h-11"
              autoComplete="name"
              {...form.register("full_name")}
            />
            {form.formState.errors.full_name ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.full_name.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone_number">{t.customers.phone}</Label>
            <Input
              id="phone_number"
              className="h-11"
              inputMode="tel"
              autoComplete="tel"
              lang="en"
              dir="ltr"
              {...form.register("phone_number", {
                setValueAs: toAsciiDigits,
                onChange: (event) => {
                  event.target.value = toAsciiDigits(event.target.value)
                },
              })}
            />
            {form.formState.errors.phone_number ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.phone_number.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">{t.customers.address}</Label>
            <Input
              id="address"
              className="h-11"
              {...form.register("address", {
                setValueAs: toAsciiDigits,
                onChange: (event) => {
                  event.target.value = toAsciiDigits(event.target.value)
                },
              })}
            />
            {form.formState.errors.address ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.address.message}
              </p>
            ) : null}
          </div>
          <Button type="submit" className="h-11 w-full" disabled={saving}>
            {saving ? t.common.saving : isEdit ? t.common.save : t.customers.add}
          </Button>
          {isEdit ? (
            <Button
              type="button"
              variant="destructive"
              className="h-11 w-full"
              onClick={() => setConfirmDelete(true)}
            >
              {t.customers.deleteButton}
            </Button>
          ) : null}
        </form>
      </FormDrawer>
      <ConfirmDeleteDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={t.customers.deleteTitle}
        description={t.customers.deleteDesc}
        confirming={deleteCustomer.isPending}
        onConfirm={() => void onDelete()}
      />
    </>
  )
}

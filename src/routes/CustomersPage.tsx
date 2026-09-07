import { useMemo, useState } from "react"
import { Search, X } from "lucide-react"
import { TopBar } from "@/components/layout/TopBar"
import { Fab } from "@/components/layout/Fab"
import { CustomerCard } from "@/components/customers/CustomerCard"
import { CustomerFormSheet } from "@/components/customers/CustomerFormSheet"
import { EmptyState } from "@/components/shared/EmptyState"
import { CardListSkeleton } from "@/components/shared/CardListSkeleton"
import { Input } from "@/components/ui/input"
import { useCustomers } from "@/hooks/useCustomers"
import { useI18n } from "@/i18n/I18nProvider"
import { toAsciiDigits } from "@/lib/digits"
import type { Customer } from "@/types/database"

export function CustomersPage() {
  const { t } = useI18n()
  const { data: customers, isLoading } = useCustomers()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q || !customers) return customers ?? []
    return customers.filter(
      (customer) =>
        customer.full_name.toLowerCase().includes(q) ||
        customer.phone_number.includes(q) ||
        (customer.address ?? "").toLowerCase().includes(q),
    )
  }, [customers, query])

  function openAdd() {
    setEditing(null)
    setSheetOpen(true)
  }

  return (
    <div>
      <TopBar title={t.customers.title} />
      <main className="px-4 py-4">
        {isLoading ? (
          <CardListSkeleton />
        ) : !customers?.length ? (
          <EmptyState
            title={t.customers.emptyTitle}
            description={t.customers.emptyDesc}
            actionLabel={t.customers.add}
            onAction={openAdd}
          />
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted-foreground" />
              <Input
                className="h-11 ps-9 pe-9"
                type="search"
                placeholder={t.customers.search}
                value={query}
                onChange={(event) => setQuery(toAsciiDigits(event.target.value))}
              />
              {query ? (
                <button
                  type="button"
                  aria-label={t.common.clear}
                  onClick={() => setQuery("")}
                  className="absolute inset-y-0 end-2 my-auto flex size-7 items-center justify-center rounded-full text-muted-foreground"
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </div>
            {filtered.length === 0 ? (
              <EmptyState
                title={t.customers.noMatch}
                description={t.customers.noMatchDesc}
              />
            ) : (
              filtered.map((customer) => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  onClick={() => {
                    setEditing(customer)
                    setSheetOpen(true)
                  }}
                />
              ))
            )}
          </div>
        )}
      </main>
      <Fab label={t.customers.add} onClick={openAdd} />
      <CustomerFormSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open)
          if (!open) setEditing(null)
        }}
        customer={editing}
      />
    </div>
  )
}

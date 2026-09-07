import { MapPin, Phone } from "lucide-react"
import type { Customer } from "@/types/database"

type CustomerCardProps = {
  customer: Customer
  onClick: () => void
}

export function CustomerCard({ customer, onClick }: CustomerCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl bg-card p-4 text-start shadow-sm ring-1 ring-foreground/8"
    >
      <p className="text-base font-semibold">{customer.full_name}</p>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Phone className="size-3.5" />
        {customer.phone_number}
      </p>
      {customer.address ? (
        <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-3.5 shrink-0" />
          <span>{customer.address}</span>
        </p>
      ) : null}
    </button>
  )
}

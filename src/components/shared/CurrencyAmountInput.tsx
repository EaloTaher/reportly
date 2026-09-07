import { useState } from "react"
import { Input } from "@/components/ui/input"
import { useSettings } from "@/hooks/useSettings"
import {
  formatAmount,
  inputDigitsToStored,
  storedToInputDigits,
} from "@/lib/currency"
import { cn } from "@/lib/utils"
import { toAsciiDigits } from "@/lib/digits"

type CurrencyAmountInputProps = {
  id?: string
  value: number
  onChange: (storedValue: number) => void
  disabled?: boolean
}

export function CurrencyAmountInput({
  id,
  value,
  onChange,
  disabled,
}: CurrencyAmountInputProps) {
  const { currency } = useSettings()
  const isIqd = currency === "IQD"
  const [digits, setDigits] = useState(() =>
    storedToInputDigits(value, currency),
  )

  const stored = inputDigitsToStored(digits, currency)

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Input
          id={id}
          inputMode={isIqd ? "numeric" : "decimal"}
          disabled={disabled}
          value={digits}
          onChange={(event) => {
            const next = toAsciiDigits(event.target.value)
            if (isIqd && next !== "" && !/^\d+$/.test(next)) return
            if (!isIqd && next !== "" && !/^\d*\.?\d{0,2}$/.test(next)) return
            setDigits(next)
            onChange(inputDigitsToStored(next, currency))
          }}
          className={cn("h-11 text-base", isIqd ? "pr-24" : "pr-16")}
          lang="en"
          dir="ltr"
          placeholder={isIqd ? "100" : "0.00"}
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-medium text-muted-foreground">
          {isIqd ? ",000 IQD" : currency}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        = {formatAmount(stored, currency)}
      </p>
    </div>
  )
}

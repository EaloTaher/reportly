import { toast } from "sonner"
import { useEffect, useState } from "react"
import { TopBar } from "@/components/layout/TopBar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { LanguageSelect } from "@/components/shared/LanguageSelect"
import { useAuth } from "@/hooks/useAuth"
import { useProfile, useSettings } from "@/hooks/useSettings"
import { usePwaInstall } from "@/hooks/usePwaInstall"
import { useI18n } from "@/i18n/I18nProvider"
import { CURRENCY_OPTIONS } from "@/lib/constants"
import { getPrintHeader, setPrintHeader } from "@/lib/printHeader"

export function SettingsPage() {
  const { t } = useI18n()
  const { user, signOut } = useAuth()
  const profileQuery = useProfile()
  const settings = useSettings()
  const pwa = usePwaInstall()
  const [printHeader, setPrintHeaderValue] = useState("")

  useEffect(() => {
    setPrintHeaderValue(getPrintHeader())
  }, [])

  async function onLogout() {
    try {
      await signOut()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t.settings.logoutFailed)
    }
  }

  async function onCurrencyChange(value: string) {
    try {
      await settings.updateCurrency.mutateAsync(value)
      toast.success(t.settings.currencyUpdated)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t.settings.currencyFailed,
      )
    }
  }

  function onSavePrintHeader() {
    setPrintHeader(printHeader)
    toast.success(t.settings.printHeaderSaved)
  }

  return (
    <div>
      <TopBar title={t.settings.title} />
      <main className="space-y-4 px-4 py-4">
        <section className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/8">
          <LanguageSelect />
        </section>

        <section className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/8">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t.settings.account}
          </p>
          {profileQuery.isLoading ? (
            <div className="mt-3 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-52" />
            </div>
          ) : (
            <div className="mt-3">
              <p className="text-base font-semibold">
                {profileQuery.data?.full_name || t.common.signedIn}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {profileQuery.data?.email || user?.email}
              </p>
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/8">
          <Label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t.settings.currency}
          </Label>
          {settings.isLoading ? (
            <Skeleton className="mt-3 h-11 w-full" />
          ) : (
            <Select
              value={settings.currency}
              onValueChange={(value) => void onCurrencyChange(value)}
            >
              <SelectTrigger className="mt-3 h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            {t.settings.currencyHint}
          </p>
        </section>

        <section className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/8">
          <Label
            htmlFor="print_header"
            className="text-xs font-medium tracking-wide text-muted-foreground uppercase"
          >
            {t.settings.printHeader}
          </Label>
          <Input
            id="print_header"
            className="mt-3 h-11"
            value={printHeader}
            placeholder={t.settings.printHeaderPlaceholder}
            onChange={(event) => setPrintHeaderValue(event.target.value)}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            {t.settings.printHeaderHint}
          </p>
          <Button
            type="button"
            className="mt-3 h-11 w-full"
            onClick={onSavePrintHeader}
          >
            {t.common.save}
          </Button>
        </section>

        <section className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/8">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t.settings.homeScreen}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t.settings.homeScreenIos}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t.settings.homeScreenAndroid}
          </p>
          {pwa.canInstall ? (
            <Button
              className="mt-4 h-11 w-full"
              onClick={() => void pwa.install()}
            >
              {t.settings.install}
            </Button>
          ) : null}
        </section>

        <Button variant="destructive" className="h-11 w-full" onClick={() => void onLogout()}>
          {t.settings.logout}
        </Button>
      </main>
    </div>
  )
}

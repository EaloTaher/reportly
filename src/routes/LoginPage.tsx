import { useMemo } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Navigate, useLocation } from "react-router-dom"
import { toast } from "sonner"
import { ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LanguageSelect } from "@/components/shared/LanguageSelect"
import { useAuth } from "@/hooks/useAuth"
import { useI18n } from "@/i18n/I18nProvider"

type LoginValues = { email: string; password: string }

export function LoginPage() {
  const { t } = useI18n()
  const { user, loading, signIn } = useAuth()
  const location = useLocation()
  const from =
    (location.state as { from?: string } | null)?.from &&
    (location.state as { from?: string }).from !== "/login"
      ? (location.state as { from: string }).from
      : "/"

  const schema = useMemo(
    () =>
      z.object({
        email: z.string().email(t.errors.validEmail),
        password: z.string().min(1, t.errors.passwordRequired),
      }),
    [t],
  )

  const form = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  })

  if (!loading && user) {
    return <Navigate to={from} replace />
  }

  async function onSubmit(values: LoginValues) {
    try {
      await signIn(values.email.trim(), values.password)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t.login.failed)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-5 py-10">
      <Card className="rounded-2xl py-6 shadow-sm">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <ClipboardList className="size-7" />
          </div>
          <CardTitle className="text-xl">{t.appName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <LanguageSelect />
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="email">{t.login.email}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                className="h-11"
                {...form.register("email")}
              />
              {form.formState.errors.email ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.email.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t.login.password}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                className="h-11"
                {...form.register("password")}
              />
              {form.formState.errors.password ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>
            <Button
              type="submit"
              className="h-11 w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? t.login.signingIn : t.login.signIn}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

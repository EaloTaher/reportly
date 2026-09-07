import { LANGUAGES, type LanguageCode } from "@/i18n/messages"
import { useI18n } from "@/i18n/I18nProvider"
import { cn } from "@/lib/utils"

export function LanguageSelect() {
  const { lang, setLang, t } = useI18n()

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {t.settings.language}
      </p>
      <p className="text-lg font-semibold">
        {lang === "ar" ? "العربية" : "کوردی"}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {LANGUAGES.map((item) => {
          const selected = lang === item.code
          return (
            <button
              key={item.code}
              type="button"
              dir="rtl"
              onClick={() => setLang(item.code as LanguageCode)}
              className={cn(
                "flex min-h-14 items-center justify-center rounded-xl text-lg font-semibold ring-1",
                selected
                  ? "bg-primary text-primary-foreground ring-primary"
                  : "bg-background text-foreground ring-foreground/15",
              )}
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

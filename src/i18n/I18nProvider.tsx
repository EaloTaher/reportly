import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  DEFAULT_LANGUAGE,
  getDir,
  getMessages,
  type LanguageCode,
  type Messages,
} from "@/i18n/messages"

const STORAGE_KEY = "reportly-lang"

type I18nState = {
  lang: LanguageCode
  dir: "rtl" | "ltr"
  t: Messages
  setLang: (code: LanguageCode) => void
}

const I18nContext = createContext<I18nState | null>(null)

function readStoredLang(): LanguageCode {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === "ar" || stored === "ckb") return stored
  } catch {
    /* private mode / iframe */
  }
  return DEFAULT_LANGUAGE
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>(readStoredLang)

  useEffect(() => {
    const dir = getDir(lang)
    document.documentElement.lang = lang
    document.documentElement.dir = dir
    document.title = getMessages(lang).appName
  }, [lang])

  const setLang = useCallback((code: LanguageCode) => {
    setLangState(code)
    try {
      window.localStorage.setItem(STORAGE_KEY, code)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo<I18nState>(
    () => ({
      lang,
      dir: getDir(lang),
      t: getMessages(lang),
      setLang,
    }),
    [lang, setLang],
  )

  return (
    <I18nContext.Provider value={value}>
      <div key={lang} dir={getDir(lang)} lang={lang} className="min-h-dvh">
        {children}
      </div>
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useI18n must be used within I18nProvider")
  return ctx
}

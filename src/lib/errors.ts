import type { PostgrestError } from "@supabase/supabase-js"

/** Postgres error code for a violated unique index. */
const UNIQUE_VIOLATION = "23505"

type AppError = Error & { code?: string }

/** Supabase rejects with a plain object, so wrap it to keep `instanceof Error`. */
export function toAppError(error: PostgrestError): AppError {
  const appError: AppError = new Error(error.message)
  appError.code = error.code
  return appError
}

export function isUniqueViolation(error: unknown): boolean {
  return error instanceof Error && (error as AppError).code === UNIQUE_VIOLATION
}

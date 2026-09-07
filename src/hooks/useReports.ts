import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { isUniqueViolation, todayISODate } from "@/lib/dates"
import type { DailyReport } from "@/types/database"

export function useReports() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ["reports", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async (): Promise<DailyReport[]> => {
      const { data, error } = await supabase
        .from("daily_reports")
        .select("*")
        .order("report_date", { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useTodayReport() {
  const { user } = useAuth()
  const today = todayISODate()

  return useQuery({
    queryKey: ["report", "today", user?.id, today],
    enabled: Boolean(user?.id),
    queryFn: async (): Promise<DailyReport | null> => {
      const { data, error } = await supabase
        .from("daily_reports")
        .select("*")
        .eq("report_date", today)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}

export function useReport(reportId: string | undefined) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ["report", reportId],
    enabled: Boolean(user?.id && reportId),
    queryFn: async (): Promise<DailyReport | null> => {
      const { data, error } = await supabase
        .from("daily_reports")
        .select("*")
        .eq("id", reportId!)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}

export function useStartTodayReport() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (title?: string) => {
      const today = todayISODate()
      const { data, error } = await supabase
        .from("daily_reports")
        .insert({
          user_id: user!.id,
          report_date: today,
          title: title?.trim() ? title.trim() : null,
        })
        .select("*")
        .single()

      if (error) {
        if (isUniqueViolation(error)) {
          const { data: existing, error: fetchError } = await supabase
            .from("daily_reports")
            .select("*")
            .eq("report_date", today)
            .maybeSingle()
          if (fetchError) throw fetchError
          if (existing) return existing
        }
        throw error
      }

      return data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["reports"] })
      await queryClient.invalidateQueries({ queryKey: ["report"] })
    },
  })
}

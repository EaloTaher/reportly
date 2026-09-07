import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import type { Profile, Settings } from "@/types/database"

export function useProfile() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}

export function useSettings() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ["settings", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async (): Promise<Settings> => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .maybeSingle()
      if (error) throw error
      if (data) return data

      const { data: created, error: insertError } = await supabase
        .from("settings")
        .insert({ user_id: user!.id, base_currency: "IQD" })
        .select("*")
        .single()

      if (insertError) {
        const { data: existing, error: refetchError } = await supabase
          .from("settings")
          .select("*")
          .maybeSingle()
        if (refetchError) throw refetchError
        if (existing) return existing
        throw insertError
      }

      return created
    },
  })

  const updateCurrency = useMutation({
    mutationFn: async (base_currency: string) => {
      if (!query.data) {
        const { error } = await supabase.from("settings").insert({
          user_id: user!.id,
          base_currency,
        })
        if (error) throw error
        return
      }
      const { error } = await supabase
        .from("settings")
        .update({ base_currency })
        .eq("id", query.data.id)
      if (error) throw error
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["settings"] })
    },
  })

  return {
    ...query,
    currency: query.data?.base_currency ?? "IQD",
    updateCurrency,
  }
}

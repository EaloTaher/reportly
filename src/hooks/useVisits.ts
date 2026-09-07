import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import type { VisitWithCustomer } from "@/types/database"

export type VisitInput = {
  report_id: string
  customer_id: string
  visit_time?: string | null
  amount_taken: number
  amount_left: number
  status: string
  notes?: string | null
}

export function useVisits(reportId: string | undefined) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ["visits", reportId],
    enabled: Boolean(reportId),
    queryFn: async (): Promise<VisitWithCustomer[]> => {
      const { data, error } = await supabase
        .from("visits")
        .select(
          "*, customers ( id, full_name, phone_number, address )",
        )
        .eq("report_id", reportId!)
        .order("visit_time", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: true })
      if (error) throw error
      return (data ?? []) as VisitWithCustomer[]
    },
  })

  const addVisit = useMutation({
    mutationFn: async (input: VisitInput) => {
      const { error } = await supabase.from("visits").insert({
        report_id: input.report_id,
        customer_id: input.customer_id,
        visit_time: input.visit_time || null,
        amount_taken: input.amount_taken,
        amount_left: input.amount_left,
        status: input.status,
        notes: input.notes?.trim() ? input.notes.trim() : null,
      })
      if (error) throw error
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["visits", variables.report_id],
      })
    },
  })

  const updateVisit = useMutation({
    mutationFn: async ({
      id,
      ...input
    }: Omit<VisitInput, "report_id"> & { id: string; report_id: string }) => {
      const { error } = await supabase
        .from("visits")
        .update({
          customer_id: input.customer_id,
          visit_time: input.visit_time || null,
          amount_taken: input.amount_taken,
          amount_left: input.amount_left,
          status: input.status,
          notes: input.notes?.trim() ? input.notes.trim() : null,
        })
        .eq("id", id)
      if (error) throw error
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["visits", variables.report_id],
      })
    },
  })

  const deleteVisit = useMutation({
    mutationFn: async ({ id }: { id: string; report_id: string }) => {
      const { error } = await supabase.from("visits").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["visits", variables.report_id],
      })
    },
  })

  return { ...query, addVisit, updateVisit, deleteVisit }
}

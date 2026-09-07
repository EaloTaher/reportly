import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { toAsciiDigits } from "@/lib/digits"
import type { Customer } from "@/types/database"

export type CustomerInput = {
  full_name: string
  phone_number: string
  address: string
}

export function useCustomers() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ["customers", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async (): Promise<Customer[]> => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("full_name", { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })

  const addCustomer = useMutation({
    mutationFn: async (input: CustomerInput) => {
      const { error } = await supabase.from("customers").insert({
        user_id: user!.id,
        full_name: input.full_name.trim(),
        phone_number: toAsciiDigits(input.phone_number).trim(),
        address: toAsciiDigits(input.address).trim(),
      })
      if (error) throw error
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["customers"] })
    },
  })

  const updateCustomer = useMutation({
    mutationFn: async ({
      id,
      ...input
    }: CustomerInput & { id: string }) => {
      const { error } = await supabase
        .from("customers")
        .update({
          full_name: input.full_name.trim(),
          phone_number: toAsciiDigits(input.phone_number).trim(),
          address: toAsciiDigits(input.address).trim(),
        })
        .eq("id", id)
      if (error) throw error
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["customers"] })
      await queryClient.invalidateQueries({ queryKey: ["visits"] })
    },
  })

  const deleteCustomer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("customers").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["customers"] })
      await queryClient.invalidateQueries({ queryKey: ["visits"] })
    },
  })

  return { ...query, addCustomer, updateCustomer, deleteCustomer }
}

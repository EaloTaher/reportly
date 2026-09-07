import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { toAsciiDigits } from "@/lib/digits"
import { toAppError } from "@/lib/errors"
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
    mutationFn: async (input: CustomerInput): Promise<Customer> => {
      const { data, error } = await supabase
        .from("customers")
        .insert({
          user_id: user!.id,
          full_name: input.full_name.trim(),
          phone_number: toAsciiDigits(input.phone_number).trim(),
          address: toAsciiDigits(input.address).trim(),
        })
        .select()
        .single()
      if (error) throw toAppError(error)
      return data
    },
    onSuccess: async (customer) => {
      // Show the new customer right away, then reconcile with the server.
      queryClient.setQueryData<Customer[]>(["customers", user?.id], (current) =>
        [...(current ?? []).filter((item) => item.id !== customer.id), customer].sort(
          (a, b) => a.full_name.localeCompare(b.full_name),
        ),
      )
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
      if (error) throw toAppError(error)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["customers"] })
      await queryClient.invalidateQueries({ queryKey: ["visits"] })
    },
  })

  const deleteCustomer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("customers").delete().eq("id", id)
      if (error) throw toAppError(error)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["customers"] })
      await queryClient.invalidateQueries({ queryKey: ["visits"] })
    },
  })

  return { ...query, addCustomer, updateCustomer, deleteCustomer }
}

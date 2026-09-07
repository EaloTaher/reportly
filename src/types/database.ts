export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Profile = {
  id: string
  email: string
  full_name: string | null
  created_at: string
}

export type Customer = {
  id: string
  user_id: string
  full_name: string
  phone_number: string
  address: string | null
  created_at: string
}

export type DailyReport = {
  id: string
  user_id: string
  report_date: string
  title: string | null
  created_at: string
}

export type Visit = {
  id: string
  report_id: string
  customer_id: string
  visit_time: string | null
  amount_taken: number | string
  amount_left: number | string
  status: string | null
  notes: string | null
  created_at: string
}

export type Settings = {
  id: string
  user_id: string
  base_currency: string
}

export type VisitWithCustomer = Visit & {
  customers: Pick<Customer, "id" | "full_name" | "phone_number" | "address"> | null
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: {
          id: string
          email: string
          full_name?: string | null
          created_at?: string
        }
        Update: {
          email?: string
          full_name?: string | null
        }
      }
      customers: {
        Row: Customer
        Insert: {
          id?: string
          user_id: string
          full_name: string
          phone_number: string
          address?: string | null
          created_at?: string
        }
        Update: {
          full_name?: string
          phone_number?: string
          address?: string | null
        }
      }
      daily_reports: {
        Row: DailyReport
        Insert: {
          id?: string
          user_id: string
          report_date: string
          title?: string | null
          created_at?: string
        }
        Update: {
          title?: string | null
          report_date?: string
        }
      }
      visits: {
        Row: Visit
        Insert: {
          id?: string
          report_id: string
          customer_id: string
          visit_time?: string | null
          amount_taken?: number
          amount_left?: number
          status?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          customer_id?: string
          visit_time?: string | null
          amount_taken?: number
          amount_left?: number
          status?: string | null
          notes?: string | null
        }
      }
      settings: {
        Row: Settings
        Insert: {
          id?: string
          user_id: string
          base_currency?: string
        }
        Update: {
          base_currency?: string
        }
      }
    }
  }
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string
          public_id: string
          title: string
          description: string | null
          visible_from: string
          visible_to: string
          view_mode: 'table' | 'calendar'
          edit_token: string
          cancel_before_hours: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          public_id: string
          title: string
          description?: string | null
          visible_from: string
          visible_to: string
          view_mode: 'table' | 'calendar'
          edit_token: string
          cancel_before_hours?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          public_id?: string
          title?: string
          description?: string | null
          visible_from?: string
          visible_to?: string
          view_mode?: 'table' | 'calendar'
          edit_token?: string
          cancel_before_hours?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      slots: {
        Row: {
          id: string
          event_id: string
          provider_name: string
          start_at: string
          end_at: string
          status: 'open' | 'booked' | 'canceled'
          cancel_token: string
          note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          provider_name: string
          start_at: string
          end_at: string
          status?: 'open' | 'booked' | 'canceled'
          cancel_token: string
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          provider_name?: string
          start_at?: string
          end_at?: string
          status?: 'open' | 'booked' | 'canceled'
          cancel_token?: string
          note?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          slot_id: string
          attendee_name: string
          attendee_contact: string | null
          status: 'booked' | 'canceled'
          cancel_token: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slot_id: string
          attendee_name: string
          attendee_contact?: string | null
          status?: 'booked' | 'canceled'
          cancel_token: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slot_id?: string
          attendee_name?: string
          attendee_contact?: string | null
          status?: 'booked' | 'canceled'
          cancel_token?: string
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          event_id: string | null
          action: string
          target_type: string | null
          target_id: string | null
          meta: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          event_id?: string | null
          action: string
          target_type?: string | null
          target_id?: string | null
          meta?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string | null
          action?: string
          target_type?: string | null
          target_id?: string | null
          meta?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
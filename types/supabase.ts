export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      announcements: {
        Row: {
          content: string | null
          created_at: string | null
          created_by: string | null
          id: string
          title: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          title?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          subject_id: string | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          subject_id?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          subject_id?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          class_number: number | null
          created_at: string | null
          full_name: string | null
          grade: number | null
          id: string
          role: Database["public"]["Enums"]["user_role"] | null
          school: string | null
          student_number: number | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          class_number?: number | null
          created_at?: string | null
          full_name?: string | null
          grade?: number | null
          id: string
          role?: Database["public"]["Enums"]["user_role"] | null
          school?: string | null
          student_number?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          class_number?: number | null
          created_at?: string | null
          full_name?: string | null
          grade?: number | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          school?: string | null
          student_number?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      progress: {
        Row: {
          assignment_id: string | null
          feedback: string | null
          id: string
          score: number | null
          status: string | null
          student_id: string | null
          subject_id: string | null
          submitted_at: string | null
          updated_at: string | null
        }
        Insert: {
          assignment_id?: string | null
          feedback?: string | null
          id?: string
          score?: number | null
          status?: string | null
          student_id?: string | null
          subject_id?: string | null
          submitted_at?: string | null
          updated_at?: string | null
        }
        Update: {
          assignment_id?: string | null
          feedback?: string | null
          id?: string
          score?: number | null
          status?: string | null
          student_id?: string | null
          subject_id?: string | null
          submitted_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          description: string | null
          id: string
          title: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          title?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          title?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: "student" | "admin"
    }
  }
}

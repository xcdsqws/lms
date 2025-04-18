export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      announcements: {
        Row: {
          id: string
          title: string | null
          content: string | null
          created_at: string | null
          created_by: string | null
        }
        Insert: {
          id?: string
          title?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
        }
        Update: {
          id?: string
          title?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
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
          id: string
          title: string | null
          description: string | null
          due_date: string | null
          created_at: string | null
          created_by: string | null
          subject_id: string | null
        }
        Insert: {
          id?: string
          title?: string | null
          description?: string | null
          due_date?: string | null
          created_at?: string | null
          created_by?: string | null
          subject_id?: string | null
        }
        Update: {
          id?: string
          title?: string | null
          description?: string | null
          due_date?: string | null
          created_at?: string | null
          created_by?: string | null
          subject_id?: string | null
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
          id: string
          full_name: string | null
          username: string | null
          avatar_url: string | null
          role: "student" | "admin" | null
          school: string | null
          grade: number | null
          class_number: number | null
          student_number: number | null
          updated_at: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          role?: "student" | "admin" | null
          school?: string | null
          grade?: number | null
          class_number?: number | null
          student_number?: number | null
          updated_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          role?: "student" | "admin" | null
          school?: string | null
          grade?: number | null
          class_number?: number | null
          student_number?: number | null
          updated_at?: string | null
          created_at?: string | null
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
          id: string
          student_id: string | null
          subject_id: string | null
          assignment_id: string | null
          status: string | null
          score: number | null
          feedback: string | null
          submitted_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          student_id?: string | null
          subject_id?: string | null
          assignment_id?: string | null
          status?: string | null
          score?: number | null
          feedback?: string | null
          submitted_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          student_id?: string | null
          subject_id?: string | null
          assignment_id?: string | null
          status?: string | null
          score?: number | null
          feedback?: string | null
          submitted_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
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
          id: string
          title: string | null
          description: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          title?: string | null
          description?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          title?: string | null
          description?: string | null
          created_at?: string | null
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

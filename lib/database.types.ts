export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      announcements: {
        Row: {
          id: string
          title: string
          content: string
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          title: string
          content: string
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          title?: string
          content?: string
          created_at?: string
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
          title: string
          description: string | null
          due_date: string | null
          created_at: string
          created_by: string | null
          subject_id: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          due_date?: string | null
          created_at?: string
          created_by?: string | null
          subject_id?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          due_date?: string | null
          created_at?: string
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
          role: Database["public"]["Enums"]["user_role"]
          school: string | null
          grade: number | null
          class_number: number | null
          student_number: number | null
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          school?: string | null
          grade?: number | null
          class_number?: number | null
          student_number?: number | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          school?: string | null
          grade?: number | null
          class_number?: number | null
          student_number?: number | null
          updated_at?: string | null
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
          assignment_id: string | null
          subject_id: string | null
          status: string | null
          score: number | null
          feedback: string | null
          submitted_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          student_id?: string | null
          assignment_id?: string | null
          subject_id?: string | null
          status?: string | null
          score?: number | null
          feedback?: string | null
          submitted_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          student_id?: string | null
          assignment_id?: string | null
          subject_id?: string | null
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
      self_evaluations: {
        Row: {
          id: string
          student_id: string
          evaluation_date: string
          satisfaction_level: number
          achievement_level: number
          focus_level: number
          reflection: string | null
          goals_for_tomorrow: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          evaluation_date?: string
          satisfaction_level: number
          achievement_level: number
          focus_level: number
          reflection?: string | null
          goals_for_tomorrow?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          evaluation_date?: string
          satisfaction_level?: number
          achievement_level?: number
          focus_level?: number
          reflection?: string | null
          goals_for_tomorrow?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "self_evaluations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      study_logs: {
        Row: {
          id: string
          student_id: string
          subject_id: string
          content: string
          study_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          subject_id: string
          content: string
          study_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          subject_id?: string
          content?: string
          study_date?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_logs_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      study_schedules: {
        Row: {
          id: string
          student_id: string | null
          title: string
          description: string | null
          start_time: string
          end_time: string
          created_at: string | null
        }
        Insert: {
          id?: string
          student_id?: string | null
          title: string
          description?: string | null
          start_time: string
          end_time: string
          created_at?: string | null
        }
        Update: {
          id?: string
          student_id?: string | null
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "study_schedules_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      study_time_logs: {
        Row: {
          id: string
          student_id: string
          subject_id: string
          start_time: string | null
          end_time: string | null
          duration_minutes: number
          study_date: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          subject_id: string
          start_time?: string | null
          end_time?: string | null
          duration_minutes?: number
          study_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          subject_id?: string
          start_time?: string | null
          end_time?: string | null
          duration_minutes?: number
          study_date?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_time_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_time_logs_subject_id_fkey"
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
          name: string
          description: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
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

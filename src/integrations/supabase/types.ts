export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admission_inquiries: {
        Row: {
          class_applying: string
          created_at: string
          email: string | null
          id: string
          message: string | null
          parent_name: string | null
          phone: string
          student_name: string
        }
        Insert: {
          class_applying: string
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          parent_name?: string | null
          phone: string
          student_name: string
        }
        Update: {
          class_applying?: string
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          parent_name?: string | null
          phone?: string
          student_name?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          created_at: string
          date: string
          id: string
          marked_by: string | null
          status: string
          student_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          marked_by?: string | null
          status?: string
          student_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          marked_by?: string | null
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          alt: string
          category: string
          created_at: string
          id: string
          sort_order: number
          src: string
        }
        Insert: {
          alt?: string
          category?: string
          created_at?: string
          id?: string
          sort_order?: number
          src: string
        }
        Update: {
          alt?: string
          category?: string
          created_at?: string
          id?: string
          sort_order?: number
          src?: string
        }
        Relationships: []
      }
      hero_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          sort_order?: number
        }
        Relationships: []
      }
      media_items: {
        Row: {
          created_at: string
          description: string | null
          external_url: string | null
          id: string
          image_url: string | null
          is_active: boolean
          item_date: string | null
          sort_order: number
          source: string | null
          title: string
          type: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          external_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          item_date?: string | null
          sort_order?: number
          source?: string | null
          title: string
          type: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          external_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          item_date?: string | null
          sort_order?: number
          source?: string | null
          title?: string
          type?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      notices: {
        Row: {
          category: string
          created_at: string
          date: string
          id: string
          pdf_url: string | null
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          date?: string
          id?: string
          pdf_url?: string | null
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          date?: string
          id?: string
          pdf_url?: string | null
          title?: string
        }
        Relationships: []
      }
      popup_banners: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          link_url: string | null
          size: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          link_url?: string | null
          size?: string
          title?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          link_url?: string | null
          size?: string
          title?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          content_type: string
          id: string
          key: string
          section: string
          updated_at: string
          value: string
        }
        Insert: {
          content_type?: string
          id?: string
          key: string
          section?: string
          updated_at?: string
          value?: string
        }
        Update: {
          content_type?: string
          id?: string
          key?: string
          section?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          area_of_expertise: string | null
          created_at: string
          designation: string
          email: string | null
          experience: string | null
          id: string
          joining_date: string | null
          name: string
          phone: string | null
          photo_url: string | null
          qualification: string | null
          staff_type: string
        }
        Insert: {
          area_of_expertise?: string | null
          created_at?: string
          designation?: string
          email?: string | null
          experience?: string | null
          id?: string
          joining_date?: string | null
          name: string
          phone?: string | null
          photo_url?: string | null
          qualification?: string | null
          staff_type?: string
        }
        Update: {
          area_of_expertise?: string | null
          created_at?: string
          designation?: string
          email?: string | null
          experience?: string | null
          id?: string
          joining_date?: string | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          qualification?: string | null
          staff_type?: string
        }
        Relationships: []
      }
      student_physical_data: {
        Row: {
          created_at: string
          height_cm: number | null
          id: string
          recorded_by: string | null
          recorded_date: string
          student_id: string
          weight_kg: number | null
        }
        Insert: {
          created_at?: string
          height_cm?: number | null
          id?: string
          recorded_by?: string | null
          recorded_date?: string
          student_id: string
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          height_cm?: number | null
          id?: string
          recorded_by?: string | null
          recorded_date?: string
          student_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "student_physical_data_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_results: {
        Row: {
          academic_year: string
          created_at: string
          entered_by: string | null
          exam_type: string
          id: string
          marks_obtained: number
          published: boolean
          student_id: string
          subject: string
          total_marks: number
        }
        Insert: {
          academic_year?: string
          created_at?: string
          entered_by?: string | null
          exam_type: string
          id?: string
          marks_obtained?: number
          published?: boolean
          student_id: string
          subject: string
          total_marks?: number
        }
        Update: {
          academic_year?: string
          created_at?: string
          entered_by?: string | null
          exam_type?: string
          id?: string
          marks_obtained?: number
          published?: boolean
          student_id?: string
          subject?: string
          total_marks?: number
        }
        Relationships: [
          {
            foreignKeyName: "student_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          address: string | null
          admission_date: string | null
          class: string
          created_at: string
          date_of_birth: string | null
          email: string | null
          father_name: string | null
          id: string
          mother_name: string | null
          name: string
          phone: string | null
          photo_url: string | null
          roll_number: string | null
          section: string | null
        }
        Insert: {
          address?: string | null
          admission_date?: string | null
          class?: string
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          father_name?: string | null
          id?: string
          mother_name?: string | null
          name: string
          phone?: string | null
          photo_url?: string | null
          roll_number?: string | null
          section?: string | null
        }
        Update: {
          address?: string | null
          admission_date?: string | null
          class?: string
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          father_name?: string | null
          id?: string
          mother_name?: string | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          roll_number?: string | null
          section?: string | null
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      teacher_class_assignments: {
        Row: {
          class_name: string
          created_at: string
          id: string
          is_class_teacher: boolean
          section: string | null
          subjects: string | null
          teacher_id: string
        }
        Insert: {
          class_name: string
          created_at?: string
          id?: string
          is_class_teacher?: boolean
          section?: string | null
          subjects?: string | null
          teacher_id: string
        }
        Update: {
          class_name?: string
          created_at?: string
          id?: string
          is_class_teacher?: boolean
          section?: string | null
          subjects?: string | null
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_class_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_links: {
        Row: {
          class_name: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          section: string | null
          subject: string
          title: string
          url: string
        }
        Insert: {
          class_name: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          section?: string | null
          subject?: string
          title: string
          url: string
        }
        Update: {
          class_name?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          section?: string | null
          subject?: string
          title?: string
          url?: string
        }
        Relationships: []
      }
      teachers: {
        Row: {
          area_of_expertise: string | null
          created_at: string
          designation: string | null
          email: string | null
          experience: string | null
          id: string
          id_number: string | null
          joining_date: string | null
          name: string
          phone: string | null
          photo_url: string | null
          qualification: string | null
          resume_url: string | null
          subject: string
        }
        Insert: {
          area_of_expertise?: string | null
          created_at?: string
          designation?: string | null
          email?: string | null
          experience?: string | null
          id?: string
          id_number?: string | null
          joining_date?: string | null
          name: string
          phone?: string | null
          photo_url?: string | null
          qualification?: string | null
          resume_url?: string | null
          subject?: string
        }
        Update: {
          area_of_expertise?: string | null
          created_at?: string
          designation?: string | null
          email?: string | null
          experience?: string | null
          id?: string
          id_number?: string | null
          joining_date?: string | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          qualification?: string | null
          resume_url?: string | null
          subject?: string
        }
        Relationships: []
      }
      test_questions: {
        Row: {
          correct_option: string
          created_at: string
          id: string
          marks: number
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question_text: string
          sort_order: number
          test_id: string
        }
        Insert: {
          correct_option: string
          created_at?: string
          id?: string
          marks?: number
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question_text: string
          sort_order?: number
          test_id: string
        }
        Update: {
          correct_option?: string
          created_at?: string
          id?: string
          marks?: number
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          question_text?: string
          sort_order?: number
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_submissions: {
        Row: {
          answers: Json | null
          file_url: string | null
          graded_at: string | null
          id: string
          score: number | null
          status: string
          student_id: string
          submitted_at: string
          test_id: string
        }
        Insert: {
          answers?: Json | null
          file_url?: string | null
          graded_at?: string | null
          id?: string
          score?: number | null
          status?: string
          student_id: string
          submitted_at?: string
          test_id: string
        }
        Update: {
          answers?: Json | null
          file_url?: string | null
          graded_at?: string | null
          id?: string
          score?: number | null
          status?: string
          student_id?: string
          submitted_at?: string
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_submissions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          class_name: string
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          extracted_questions: Json | null
          id: string
          is_active: boolean
          question_file_url: string | null
          section: string | null
          subject: string
          test_type: string
          title: string
          total_marks: number
        }
        Insert: {
          class_name: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          extracted_questions?: Json | null
          id?: string
          is_active?: boolean
          question_file_url?: string | null
          section?: string | null
          subject: string
          test_type?: string
          title: string
          total_marks?: number
        }
        Update: {
          class_name?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          extracted_questions?: Json | null
          id?: string
          is_active?: boolean
          question_file_url?: string | null
          section?: string | null
          subject?: string
          test_type?: string
          title?: string
          total_marks?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "teacher" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "teacher", "user"],
    },
  },
} as const

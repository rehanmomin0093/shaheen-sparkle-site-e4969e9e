import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useTeacherAssignment = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["teacher-assignment", user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      // Find teacher record by email, then get assignment
      const { data: teacher } = await supabase
        .from("teachers")
        .select("id")
        .eq("email", user.email)
        .maybeSingle();

      if (!teacher) return null;

      const { data: assignment } = await supabase
        .from("teacher_class_assignments")
        .select("*")
        .eq("teacher_id", teacher.id)
        .maybeSingle();

      return assignment;
    },
    enabled: !!user?.email,
  });
};

export const useTeacherStudents = (className?: string, section?: string | null) => {
  return useQuery({
    queryKey: ["teacher-students", className, section],
    queryFn: async () => {
      let query = supabase
        .from("students")
        .select("*")
        .eq("class", className!)
        .order("roll_number");

      if (section) {
        query = query.eq("section", section);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!className,
  });
};

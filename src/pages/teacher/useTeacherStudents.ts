import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useTeacherAssignment = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["teacher-assignment", user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const { data: teacher } = await supabase
        .from("teachers")
        .select("id, subject")
        .eq("email", user.email)
        .maybeSingle();

      if (!teacher) return null;

      // Prefer class teacher assignment for attendance access
      const { data: assignments } = await supabase
        .from("teacher_class_assignments")
        .select("*")
        .eq("teacher_id", teacher.id)
        .order("is_class_teacher", { ascending: false });

      // Return class teacher assignment first if exists, otherwise first assignment
      const assignment = assignments?.[0] ?? null;

      return assignment ? { ...assignment, teacher_subjects: (assignment as any).subjects || teacher.subject || "" } : null;
    },
    enabled: !!user?.email,
  });
};

export const useTeacherAssignments = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["teacher-assignments-all", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const { data: teacher } = await supabase
        .from("teachers")
        .select("id")
        .eq("email", user.email)
        .maybeSingle();

      if (!teacher) return [];

      const { data: assignments } = await supabase
        .from("teacher_class_assignments")
        .select("*")
        .eq("teacher_id", teacher.id)
        .order("class_name");

      return assignments ?? [];
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
        .eq("class", className!);

      if (section) {
        query = query.eq("section", section);
      }

      const { data, error } = await query;
      if (error) throw error;
      const rows = data ?? [];
      // Numeric-aware sort by roll_number so "2" comes before "10"
      rows.sort((a: any, b: any) => {
        const ra = (a.roll_number ?? "").toString();
        const rb = (b.roll_number ?? "").toString();
        const na = parseInt(ra, 10);
        const nb = parseInt(rb, 10);
        const aNum = !isNaN(na);
        const bNum = !isNaN(nb);
        if (aNum && bNum && na !== nb) return na - nb;
        if (aNum && !bNum) return -1;
        if (!aNum && bNum) return 1;
        return ra.localeCompare(rb, undefined, { numeric: true, sensitivity: "base" });
      });
      return rows;
    },
    enabled: !!className,
  });
};

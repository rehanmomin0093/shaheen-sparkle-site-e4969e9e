import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Image, Settings, Users, UserPlus, Briefcase, GraduationCap, Megaphone } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))", "hsl(210 60% 50%)", "hsl(30 80% 55%)", "hsl(150 50% 45%)"];

const AdminDashboard = () => {
  const { data: contentCount } = useQuery({
    queryKey: ["admin-content-count"],
    queryFn: async () => {
      const { count } = await supabase.from("site_content").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: galleryCount } = useQuery({
    queryKey: ["admin-gallery-count"],
    queryFn: async () => {
      const { count } = await supabase.from("gallery_images").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: noticeCount } = useQuery({
    queryKey: ["admin-notice-count"],
    queryFn: async () => {
      const { count } = await supabase.from("notices").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: studentCount } = useQuery({
    queryKey: ["admin-student-count"],
    queryFn: async () => {
      const { count } = await supabase.from("students").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: teacherCount } = useQuery({
    queryKey: ["admin-teacher-count"],
    queryFn: async () => {
      const { count } = await supabase.from("teachers").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: teachingStaffCount } = useQuery({
    queryKey: ["admin-teaching-staff-count"],
    queryFn: async () => {
      const { count } = await supabase.from("staff").select("*", { count: "exact", head: true }).eq("staff_type", "teaching");
      return count ?? 0;
    },
  });

  const { data: nonTeachingStaffCount } = useQuery({
    queryKey: ["admin-nonteaching-staff-count"],
    queryFn: async () => {
      const { count } = await supabase.from("staff").select("*", { count: "exact", head: true }).eq("staff_type", "non-teaching");
      return count ?? 0;
    },
  });

  const { data: bannerCount } = useQuery({
    queryKey: ["admin-banner-count"],
    queryFn: async () => {
      const { count } = await supabase.from("popup_banners").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: classDist } = useQuery({
    queryKey: ["admin-class-distribution"],
    queryFn: async () => {
      const { data } = await supabase.from("students").select("class");
      if (!data) return [];
      const map: Record<string, number> = {};
      data.forEach((s) => { map[s.class || "Unassigned"] = (map[s.class || "Unassigned"] || 0) + 1; });
      return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => a.name.localeCompare(b.name));
    },
  });

  const cards = [
    { label: "Students", count: studentCount ?? 0, icon: GraduationCap, color: "text-blue-500" },
    { label: "Teachers", count: teacherCount ?? 0, icon: Users, color: "text-emerald-500" },
    { label: "Teaching Staff", count: teachingStaffCount ?? 0, icon: Briefcase, color: "text-violet-500" },
    { label: "Non-Teaching Staff", count: nonTeachingStaffCount ?? 0, icon: UserPlus, color: "text-amber-500" },
    { label: "Notices", count: noticeCount ?? 0, icon: FileText, color: "text-rose-500" },
    { label: "Gallery Images", count: galleryCount ?? 0, icon: Image, color: "text-cyan-500" },
    { label: "Content Items", count: contentCount ?? 0, icon: Settings, color: "text-muted-foreground" },
    { label: "Popup Banners", count: bannerCount ?? 0, icon: Megaphone, color: "text-orange-500" },
  ];

  const staffPieData = [
    { name: "Teaching", value: teachingStaffCount ?? 0 },
    { name: "Non-Teaching", value: nonTeachingStaffCount ?? 0 },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl font-bold">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <span className="font-serif text-3xl font-bold">{c.count}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Class Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Students by Class</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {classDist && classDist.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classDist}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" name="Students" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">No student data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Staff Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Staff Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {staffPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={staffPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {staffPieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">No staff data yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

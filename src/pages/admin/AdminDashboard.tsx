import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Image, Settings } from "lucide-react";

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

  const cards = [
    { label: "Content Items", count: contentCount ?? 0, icon: Settings },
    { label: "Gallery Images", count: galleryCount ?? 0, icon: Image },
    { label: "Notices", count: noticeCount ?? 0, icon: FileText },
  ];

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <span className="font-serif text-3xl font-bold">{c.count}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;

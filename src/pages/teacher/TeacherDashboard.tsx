import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, ClipboardList, Ruler, BookOpen, Loader2, Link as LinkIcon, GraduationCap } from "lucide-react";
import AttendanceTab from "./AttendanceTab";
import PhysicalDataTab from "./PhysicalDataTab";
import TestsTab from "./TestsTab";
import LinksTab from "./LinksTab";
import CCETab from "./CCETab";

const TeacherDashboard = () => {
  const { user, isTeacher, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/staff-portal");
    if (!loading && user && !isTeacher && !isAdmin) navigate("/staff-portal");
  }, [loading, user, isTeacher, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <header className="border-b bg-background shadow-sm">
        <div className="container flex items-center justify-between py-4">
          <h1 className="font-serif text-2xl font-bold text-primary">Teacher Dashboard</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={() => { signOut(); navigate("/staff-portal"); }}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <Tabs defaultValue="attendance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid lg:grid-cols-5">
            <TabsTrigger value="attendance" className="gap-2">
              <ClipboardList className="h-4 w-4" /> Attendance
            </TabsTrigger>
            <TabsTrigger value="cce" className="gap-2">
              <GraduationCap className="h-4 w-4" /> Result
            </TabsTrigger>
            <TabsTrigger value="physical" className="gap-2">
              <Ruler className="h-4 w-4" /> Student Data
            </TabsTrigger>
            <TabsTrigger value="tests" className="gap-2">
              <BookOpen className="h-4 w-4" /> Tests
            </TabsTrigger>
            <TabsTrigger value="links" className="gap-2">
              <LinkIcon className="h-4 w-4" /> Links
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attendance"><AttendanceTab /></TabsContent>
          <TabsContent value="cce"><CCETab /></TabsContent>
          <TabsContent value="physical"><PhysicalDataTab /></TabsContent>
          <TabsContent value="tests"><TestsTab /></TabsContent>
          <TabsContent value="links"><LinksTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TeacherDashboard;

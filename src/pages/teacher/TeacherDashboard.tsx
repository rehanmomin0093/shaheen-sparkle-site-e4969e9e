import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, ClipboardList, FileText, Ruler, Loader2 } from "lucide-react";
import AttendanceTab from "./AttendanceTab";
import ResultsTab from "./ResultsTab";
import PhysicalDataTab from "./PhysicalDataTab";

const TeacherDashboard = () => {
  const { user, isTeacher, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/staff-portal");
    }
    if (!loading && user && !isTeacher && !isAdmin) {
      navigate("/staff-portal");
    }
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
      {/* Header */}
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

      {/* Main Content */}
      <main className="container py-6">
        <Tabs defaultValue="attendance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="attendance" className="gap-2">
              <ClipboardList className="h-4 w-4" /> Attendance
            </TabsTrigger>
            <TabsTrigger value="results" className="gap-2">
              <FileText className="h-4 w-4" /> Results
            </TabsTrigger>
            <TabsTrigger value="physical" className="gap-2">
              <Ruler className="h-4 w-4" /> Student Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attendance">
            <AttendanceTab />
          </TabsContent>
          <TabsContent value="results">
            <ResultsTab />
          </TabsContent>
          <TabsContent value="physical">
            <PhysicalDataTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TeacherDashboard;

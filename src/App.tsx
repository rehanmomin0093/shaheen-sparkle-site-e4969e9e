import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import Index from "./pages/Index";
import About from "./pages/About";
import Academics from "./pages/Academics";
import Staff from "./pages/Staff";
import Gallery from "./pages/Gallery";
import Videos from "./pages/Videos";
import Achievements from "./pages/Achievements";
import PressMedia from "./pages/PressMedia";
import NoticeBoard from "./pages/NoticeBoard";
import Admissions from "./pages/Admissions";
import Contact from "./pages/Contact";
import StudentPortal from "./pages/StudentPortal";
import StaffPortal from "./pages/StaffPortal";
import LeaderMessage from "./pages/LeaderMessage";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminContent from "./pages/admin/AdminContent";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminNotices from "./pages/admin/AdminNotices";
import AdminTeachers from "./pages/admin/AdminTeachers";
import AdminManagement from "./pages/admin/AdminManagement";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminAdmissions from "./pages/admin/AdminAdmissions";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/academics" element={<Academics />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/press-media" element={<PressMedia />} />
              <Route path="/notices" element={<NoticeBoard />} />
              <Route path="/admissions" element={<Admissions />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/student-portal" element={<StudentPortal />} />
              <Route path="/staff" element={<Staff />} />
              <Route path="/faculty" element={<Staff />} />
              <Route path="/staff-portal" element={<StaffPortal />} />
              <Route path="/leader/:role" element={<LeaderMessage />} />
            </Route>
            <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="gallery" element={<AdminGallery />} />
              <Route path="notices" element={<AdminNotices />} />
              <Route path="teachers" element={<AdminTeachers />} />
              <Route path="management" element={<AdminManagement />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="banners" element={<AdminBanners />} />
              <Route path="staff" element={<AdminStaff />} />
              <Route path="admissions" element={<AdminAdmissions />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

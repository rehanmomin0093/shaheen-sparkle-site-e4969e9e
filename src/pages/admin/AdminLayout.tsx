import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { GraduationCap, LayoutDashboard, FileText, Image, Settings, LogOut, Loader2, Users, UserPlus, Megaphone, Briefcase, ClipboardList, Crown, Images, PanelBottom, Film, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/content", label: "Site Content", icon: Settings },
  { to: "/admin/hero-images", label: "Hero Images", icon: Images },
  { to: "/admin/footer", label: "Footer", icon: PanelBottom },
  { to: "/admin/gallery", label: "Gallery", icon: Image },
  { to: "/admin/notices", label: "Notices", icon: FileText },
  { to: "/admin/management", label: "Management", icon: Crown },
  { to: "/admin/teachers", label: "Teachers", icon: Users },
  { to: "/admin/students", label: "Students", icon: UserPlus },
  { to: "/admin/banners", label: "Popup Banners", icon: Megaphone },
  { to: "/admin/media", label: "Videos / Achievements / Press", icon: Film },
  { to: "/admin/staff", label: "Staff", icon: Briefcase },
  { to: "/admin/admissions", label: "Admissions", icon: ClipboardList },
  { to: "/admin/cce-config", label: "CCE Result Config", icon: BookOpen },
];

const AdminLayout = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <h1 className="font-serif text-2xl">Access Denied</h1>
        <p className="text-muted-foreground">You do not have admin privileges.</p>
        <Button variant="outline" onClick={signOut}>Sign Out</Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
        <div className="flex items-center gap-2 border-b border-sidebar-border p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-sidebar-primary">
            <GraduationCap className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <span className="font-serif text-lg font-bold">Admin Panel</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {sidebarLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-colors",
                location.pathname === l.to
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
              )}
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto bg-background p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

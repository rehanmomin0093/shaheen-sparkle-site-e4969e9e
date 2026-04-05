import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { ArrowUp } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { cn } from "@/lib/utils";

const Layout = () => {
  const [showLoader, setShowLoader] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Page loader */}
      {showLoader && (
        <div className="page-loader">
          <div className="loader-spinner" />
        </div>
      )}

      {/* Floating decorative shapes */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="floating-shape absolute top-[10%] left-[5%] h-16 w-16 rounded-full bg-secondary/5" style={{ animationDelay: "0s" }} />
        <div className="floating-shape absolute top-[60%] right-[8%] h-12 w-12 rounded-full bg-primary/5" style={{ animationDelay: "2s" }} />
        <div className="floating-shape absolute top-[30%] right-[20%] h-8 w-8 rounded-full bg-secondary/5" style={{ animationDelay: "4s" }} />
      </div>

      <Navbar />
      <main className="flex-1 relative z-[1]">
        <Outlet />
      </main>
      <Footer />

      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90 hover:scale-110",
          showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
        aria-label="Back to top"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Layout;

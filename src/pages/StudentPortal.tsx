import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Lock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const StudentPortal = () => {
  const { user, loading: authLoading } = useAuth();
  const [rollNo, setRollNo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Look up email by roll number
      const { data: student, error: lookupError } = await supabase
        .from("students")
        .select("email")
        .eq("roll_number", rollNo.trim())
        .maybeSingle();

      if (lookupError) throw lookupError;
      if (!student || !student.email) {
        toast({ title: "Login failed", description: "Roll number not found or no email linked.", variant: "destructive" });
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: student.email,
        password,
      });

      if (error) {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Welcome!", description: "Redirecting to your dashboard..." });
        navigate("/student-dashboard");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center bg-muted py-24">
      <div className="container">
        <div className="mx-auto max-w-md">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
                <GraduationCap className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="font-serif text-3xl">Student Portal</h1>
              <p className="mt-2 text-sm text-muted-foreground">Log in with your roll number and password to view results, attendance & performance.</p>
            </div>

            <Card className="border-none shadow-lg">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="rollNo">Roll Number</Label>
                    <Input
                      id="rollNo"
                      required
                      placeholder="e.g. SHS2026001"
                      value={rollNo}
                      onChange={(e) => setRollNo(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type="password"
                        required
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                  <Button type="submit" size="lg" className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Log In
                  </Button>
                </form>
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  Forgot your password? Contact the school office.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default StudentPortal;

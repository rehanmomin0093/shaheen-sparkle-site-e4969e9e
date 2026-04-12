import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { roll_number, password } = await req.json();
    if (!roll_number || !password) {
      return new Response(
        JSON.stringify({ error: "Roll number and password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Find student by roll number
    const { data: student, error: lookupError } = await adminClient
      .from("students")
      .select("id, email, roll_number")
      .eq("roll_number", roll_number.trim())
      .maybeSingle();

    if (lookupError) throw lookupError;
    if (!student) {
      return new Response(
        JSON.stringify({ error: "Roll number not found." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine the auth email: use student's real email, or generate one from roll number
    const authEmail = student.email && student.email.trim()
      ? student.email.trim()
      : `student_${student.roll_number}@school.internal`;

    // Try to sign in
    const signInClient = createClient(supabaseUrl, anonKey);
    const { data: signInData, error: signInError } = await signInClient.auth.signInWithPassword({
      email: authEmail,
      password,
    });

    if (signInError) {
      // If user doesn't exist yet, create them with default password and retry
      if (signInError.message.includes("Invalid login credentials")) {
        // Check if auth user exists
        const { data: { users } } = await adminClient.auth.admin.listUsers();
        const existingUser = users?.find((u) => u.email === authEmail);

        if (!existingUser) {
          // Auto-create the auth account
          const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
            email: authEmail,
            password: "123456",
            email_confirm: true,
          });

          if (createError) {
            return new Response(
              JSON.stringify({ error: "Failed to create account. Contact school office." }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          // Assign student role
          await adminClient.from("user_roles").upsert(
            { user_id: newUser.user.id, role: "user" },
            { onConflict: "user_id,role" }
          );

          // Update student email if it was empty
          if (!student.email || !student.email.trim()) {
            await adminClient.from("students").update({ email: authEmail }).eq("id", student.id);
          }

          // Retry sign in
          const { data: retryData, error: retryError } = await signInClient.auth.signInWithPassword({
            email: authEmail,
            password,
          });

          if (retryError) {
            return new Response(
              JSON.stringify({ error: retryError.message }),
              { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          return new Response(
            JSON.stringify({ session: retryData.session }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      return new Response(
        JSON.stringify({ error: "Invalid password. Default password is 123456." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ session: signInData.session }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

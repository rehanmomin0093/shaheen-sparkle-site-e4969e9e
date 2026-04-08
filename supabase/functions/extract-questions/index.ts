import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing auth header");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await supabaseUser.auth.getUser();
    if (userErr || !user) throw new Error("Unauthorized");

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check teacher role
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "teacher")
      .maybeSingle();
    if (!roleData) throw new Error("Only teachers can extract questions");

    const { test_id, file_url } = await req.json();
    if (!test_id || !file_url) throw new Error("test_id and file_url required");

    // Download the file to get its content
    let fileContent = "";
    try {
      const fileResponse = await fetch(file_url);
      if (!fileResponse.ok) throw new Error("Could not download file");
      
      const contentType = fileResponse.headers.get("content-type") || "";
      
      if (contentType.includes("pdf") || file_url.endsWith(".pdf")) {
        // For PDFs, we'll send the URL to AI and let it analyze
        fileContent = `[PDF file uploaded at: ${file_url}]`;
      } else {
        // For text-based files (doc, docx may come as text)
        const text = await fileResponse.text();
        fileContent = text.substring(0, 50000); // Limit to 50k chars
      }
    } catch (e) {
      fileContent = `[File uploaded at: ${file_url}]`;
    }

    const prompt = `You are an expert teacher's assistant. Analyze the following question paper file and extract ALL questions from it.

File URL: ${file_url}
File Content: ${fileContent}

Extract every question found in this document. For each question, determine:
1. The question text (preserve original language - may be English, Hindi, Urdu, or Marathi)
2. The marks allocated (if mentioned, otherwise estimate based on question type)
3. The question number/order

Respond with ONLY a JSON object (no markdown):
{
  "questions": [
    {
      "number": 1,
      "text": "Full question text here",
      "marks": 5,
      "type": "descriptive"
    }
  ],
  "total_marks": 100,
  "summary": "Brief description of the question paper"
}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a multilingual question paper analyzer. You understand English, Hindi, Urdu, and Marathi fluently. Always respond with valid JSON only." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "AI rate limit exceeded. Please try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    let extracted;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      extracted = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("AI could not parse the question file. Please try again or use a clearer file.");
    }

    // Save extracted questions to the test
    const { error: updateErr } = await supabaseAdmin
      .from("tests")
      .update({
        question_file_url: file_url,
        extracted_questions: extracted,
      })
      .eq("id", test_id);

    if (updateErr) throw updateErr;

    return new Response(JSON.stringify(extracted), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-questions error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

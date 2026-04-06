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

    // Verify caller is a teacher
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
    if (!roleData) throw new Error("Only teachers can grade");

    const { submission_id } = await req.json();
    if (!submission_id) throw new Error("submission_id required");

    // Get submission with test info and student answers
    const { data: submission, error: subErr } = await supabaseAdmin
      .from("test_submissions")
      .select("*, tests(*), students(name, class)")
      .eq("id", submission_id)
      .single();
    if (subErr || !submission) throw new Error("Submission not found");

    const test = (submission as any).tests;
    const student = (submission as any).students;
    const answers = submission.answers as Record<string, string> | null;

    // Get test questions if MCQ
    let questionsText = "";
    let mcqScore = 0;
    let mcqTotal = 0;

    if (test.test_type === "mcq" || test.test_type === "both") {
      const { data: questions } = await supabaseAdmin
        .from("test_questions")
        .select("*")
        .eq("test_id", test.id)
        .order("sort_order");

      if (questions && answers) {
        for (const q of questions) {
          mcqTotal += Number(q.marks);
          const studentAnswer = answers[q.id];
          if (studentAnswer === q.correct_option) {
            mcqScore += Number(q.marks);
          }
          questionsText += `Q: ${q.question_text}\nCorrect: ${q.correct_option}, Student answered: ${studentAnswer || "No answer"}\n\n`;
        }
      }
    }

    // For written/upload tests, use AI to evaluate
    let aiScore: number | null = null;
    let aiReason = "";

    if (test.test_type === "upload" || test.test_type === "both") {
      // Build prompt for AI grading
      const writtenMarks = test.test_type === "both"
        ? test.total_marks - mcqTotal
        : test.total_marks;

      const prompt = `You are an expert school teacher grading a student's written test submission.

Test Details:
- Title: ${test.title}
- Subject: ${test.subject}
- Class: ${test.class_name}
- Total marks for written section: ${writtenMarks}

Student: ${student?.name || "Unknown"}

IMPORTANT: The student may have written answers in Urdu, English, Marathi, or Hindi. You must understand and evaluate answers in ALL these languages equally and fairly. Use NLP understanding for each language.

${submission.file_url ? `The student uploaded a file at: ${submission.file_url}` : ""}
${answers && Object.keys(answers).some(k => k.startsWith("written_")) ? `
Written Answers:
${Object.entries(answers)
  .filter(([k]) => k.startsWith("written_"))
  .map(([k, v]) => `${k}: ${v}`)
  .join("\n")}
` : "No written answers provided."}

Grade the written portion out of ${writtenMarks} marks. Consider:
1. Relevance and accuracy of answers
2. Understanding of concepts
3. Language proficiency in whichever language the student used
4. Completeness of answers

Respond with ONLY a JSON object (no markdown):
{"score": <number>, "reason": "<brief evaluation in English>"}`;

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "You are a multilingual school test grading assistant. You understand Urdu, English, Marathi, and Hindi fluently. Always respond with valid JSON only." },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!aiResponse.ok) {
        const status = aiResponse.status;
        if (status === 429) {
          return new Response(JSON.stringify({ error: "AI rate limit exceeded. Please try again in a moment." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI gateway error: ${status}`);
      }

      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content || "";

      try {
        // Clean potential markdown wrapping
        const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(cleaned);
        aiScore = Number(parsed.score) || 0;
        aiReason = parsed.reason || "";
      } catch {
        console.error("Failed to parse AI response:", content);
        aiScore = 0;
        aiReason = "AI could not parse the submission. Please grade manually.";
      }
    }

    // Calculate final score
    let finalScore: number;
    if (test.test_type === "mcq") {
      finalScore = mcqScore;
    } else if (test.test_type === "upload") {
      finalScore = aiScore ?? 0;
    } else {
      // both
      finalScore = mcqScore + (aiScore ?? 0);
    }

    // Update submission
    const { error: updateErr } = await supabaseAdmin
      .from("test_submissions")
      .update({
        score: finalScore,
        status: "graded",
        graded_at: new Date().toISOString(),
        answers: {
          ...(answers || {}),
          _ai_grade: {
            mcq_score: mcqScore,
            mcq_total: mcqTotal,
            written_score: aiScore,
            reason: aiReason,
            graded_by: "ai",
          },
        },
      })
      .eq("id", submission_id);

    if (updateErr) throw updateErr;

    return new Response(
      JSON.stringify({
        score: finalScore,
        mcq_score: mcqScore,
        written_score: aiScore,
        reason: aiReason,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("grade-submission error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "POST only" }), { status: 405, headers: { ...cors, "Content-Type": "application/json" } });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Sign in required" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
    const supabase = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return new Response(JSON.stringify({ error: "Invalid session" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });

    const body = await req.json();
    if (!Array.isArray(body.mocks) || body.mocks.length === 0) throw new Error("Provide at least one mock score.");
    if (body.mocks.length > 80) throw new Error("Please analyse 80 mocks or fewer at a time.");
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("OPENAI_API_KEY is not configured as a Supabase secret.");

    const system = `You are a practical competitive-exam performance coach for an Indian aspirant preparing for banking and SSC/RRB exams. Use only the supplied data. Never invent sectional marks, accuracy, time taken, topic weaknesses, exam cutoffs, or selection probabilities. If only overall scores are available, clearly say sectional diagnosis needs section-wise data. Be encouraging but candid. Respond in clear Markdown with: 1) snapshot and trend, 2) strongest signals, 3) risks/gaps and what more data is needed, 4) ranked priorities for the next 7 days, 5) a realistic daily plan, 6) measurable targets for the next three mocks, 7) one thing to stop doing. Distinguish observations from hypotheses. Keep the advice specific and actionable.`;
    const payload = { mocks: body.mocks, goal: String(body.goal || "competitive exam preparation").slice(0, 200), instructions: String(body.instructions || "").slice(0, 2000) };
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o-mini", temperature: 0.3, messages: [{ role: "system", content: system }, { role: "user", content: `Analyse these mock scores and give me a clear next-action plan.\n\n${JSON.stringify(payload)}` }] }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result?.error?.message || `OpenAI request failed (${response.status}).`);
    const analysis = result?.choices?.[0]?.message?.content;
    if (!analysis) throw new Error("The AI returned no analysis.");
    return new Response(JSON.stringify({ analysis }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    const status = message.includes("Sign in") || message.includes("session") ? 401 : 400;
    return new Response(JSON.stringify({ error: message }), { status, headers: { ...cors, "Content-Type": "application/json" } });
  }
});

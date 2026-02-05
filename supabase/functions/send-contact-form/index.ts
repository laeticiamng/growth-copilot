import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

interface ContactFormRequest {
  name: string;
  email: string;
  subject: "bug" | "question" | "billing" | "feature" | "other";
  message: string;
}

const subjectLabels: Record<string, string> = {
  bug: "🐛 Bug Report",
  question: "❓ Question",
  billing: "💳 Billing",
  feature: "💡 Feature Request",
  other: "📝 Other",
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const SUPPORT_EMAIL = "support@agent-growth-automator.com";

  try {
    const body: ContactFormRequest = await req.json();
    const { name, email, subject, message } = body;

    // Validate input
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Rate limiting: max 3 messages per email per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { count: recentCount, error: countError } = await supabase
      .from("contact_submissions")
      .select("*", { count: "exact", head: true })
      .eq("email", email)
      .gte("created_at", oneHourAgo);

    if (countError) {
      console.error("[CONTACT] Rate limit check error:", countError);
    } else if (recentCount !== null && recentCount >= 3) {
      console.warn(`[CONTACT] Rate limit exceeded for ${email}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Rate limit exceeded. Please wait before sending another message." 
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log the submission
    const { error: insertError } = await supabase
      .from("contact_submissions")
      .insert({
        name,
        email,
        subject,
        message,
        status: "pending",
      });

    if (insertError) {
      console.error("[CONTACT] Insert error:", insertError);
      // Continue anyway - we still want to try sending the email
    }

    // Send email via Resend
    if (!RESEND_API_KEY) {
      console.warn("[CONTACT] RESEND_API_KEY not configured - email not sent");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Message recorded (email delivery pending configuration)" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const subjectLine = `[Growth OS Contact] ${subjectLabels[subject] || subject} - ${name}`;
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 20px;">📩 Nouveau message de contact</h1>
  </div>
  
  <div style="background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-top: none;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; font-weight: bold; width: 100px;">De :</td>
        <td style="padding: 8px 0;">${name}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">Email :</td>
        <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #6366f1;">${email}</a></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">Sujet :</td>
        <td style="padding: 8px 0;">${subjectLabels[subject] || subject}</td>
      </tr>
    </table>
  </div>
  
  <div style="background: white; padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
    <h3 style="margin-top: 0; color: #1e293b;">Message :</h3>
    <div style="background: #f1f5f9; padding: 16px; border-radius: 6px; white-space: pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
  </div>
  
  <div style="margin-top: 20px; text-align: center;">
    <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subjectLine)}" 
       style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
      Répondre à ${name}
    </a>
  </div>
  
  <p style="margin-top: 20px; font-size: 12px; color: #64748b; text-align: center;">
    Ce message a été envoyé via le formulaire de contact de Growth OS
  </p>
</body>
</html>
`;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Growth OS <noreply@agent-growth-automator.com>",
        to: [SUPPORT_EMAIL],
        reply_to: email,
        subject: subjectLine,
        html: htmlContent,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error("[CONTACT] Resend error:", errorText);
      
      // Update status to failed
      await supabase
        .from("contact_submissions")
        .update({ status: "failed" })
        .eq("email", email)
        .eq("message", message)
        .order("created_at", { ascending: false })
        .limit(1);

      // Still return success to user - we have the message logged
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Message received. We'll get back to you soon." 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendData = await resendResponse.json();
    console.log("[CONTACT] Email sent successfully:", resendData.id);

    // Update status to sent
    await supabase
      .from("contact_submissions")
      .update({ status: "sent", resend_id: resendData.id })
      .eq("email", email)
      .eq("message", message)
      .order("created_at", { ascending: false })
      .limit(1);

    return new Response(
      JSON.stringify({ success: true, message: "Message sent successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[CONTACT] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

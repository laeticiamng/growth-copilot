import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { getTemplate } from "../_shared/email-templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  template: string;
  data: Record<string, unknown>;
  workspace_id?: string;
}

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-EMAIL] ${step}${detailsStr}`);
};

// Send email via Resend API with retry
async function sendViaResend(
  apiKey: string,
  to: string,
  subject: string,
  html: string,
  retryCount = 0
): Promise<{ success: boolean; resendId?: string; error?: string }> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Growth OS <noreply@agent-growth-automator.com>",
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.message || data.error || `HTTP ${response.status}`;
      logStep(`Resend API error`, { status: response.status, error: errorMessage });

      // Retry once after 2 seconds
      if (retryCount === 0) {
        logStep("Retrying in 2 seconds...");
        await new Promise(resolve => setTimeout(resolve, 2000));
        return sendViaResend(apiKey, to, subject, html, 1);
      }

      return { success: false, error: errorMessage };
    }

    return { success: true, resendId: data.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep(`Fetch error`, { error: errorMessage });

    // Retry once after 2 seconds
    if (retryCount === 0) {
      logStep("Retrying in 2 seconds...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      return sendViaResend(apiKey, to, subject, html, 1);
    }

    return { success: false, error: errorMessage };
  }
}

// Log email to database
async function logEmailToDatabase(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  workspaceId: string | null,
  recipient: string,
  templateName: string,
  subject: string,
  status: 'sent' | 'failed' | 'bounced',
  resendId?: string,
  errorMessage?: string
): Promise<void> {
  try {
    const { error } = await supabase.from('email_log').insert({
      workspace_id: workspaceId,
      recipient,
      template_name: templateName,
      subject,
      status,
      resend_id: resendId || null,
      error_message: errorMessage || null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      logStep('Failed to log email to database', { error: error.message });
    }
  } catch (err) {
    logStep('Error logging email', { error: err });
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase configuration missing");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body: EmailRequest = await req.json();
    const { to, template, data, workspace_id } = body;

    if (!to || !template || !data) {
      throw new Error("Missing required fields: to, template, data");
    }

    logStep("Processing email request", { to, template, workspace_id });

    // Generate email content from template
    let subject: string;
    let html: string;
    
    try {
      const templateResult = getTemplate(template, data);
      subject = templateResult.subject;
      html = templateResult.html;
    } catch (templateError) {
      const errorMsg = templateError instanceof Error ? templateError.message : String(templateError);
      logStep("Template error", { error: errorMsg });
      return new Response(
        JSON.stringify({ success: false, error: errorMsg }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if Resend is configured
    if (!RESEND_API_KEY) {
      console.warn("[SEND-EMAIL] RESEND_API_KEY not configured - email will not be sent");
      
      await logEmailToDatabase(
        supabase,
        workspace_id || null,
        to,
        template,
        subject,
        'failed',
        undefined,
        'Email service not configured'
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Email service not configured" 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send via Resend
    const result = await sendViaResend(RESEND_API_KEY, to, subject, html);

    // Log to database
    await logEmailToDatabase(
      supabase,
      workspace_id || null,
      to,
      template,
      subject,
      result.success ? 'sent' : 'failed',
      result.resendId,
      result.error
    );

    if (result.success) {
      logStep("Email sent successfully", { to, template, resendId: result.resendId });
      return new Response(
        JSON.stringify({ success: true, id: result.resendId }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      logStep("Email sending failed", { error: result.error });
      return new Response(
        JSON.stringify({ success: false, error: result.error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[SEND-EMAIL] Error:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

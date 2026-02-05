import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

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

interface EmailTemplate {
  subject: string;
  html: string;
}

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-EMAIL] ${step}${detailsStr}`);
};

// Brand constants (must match src/lib/email-templates.ts)
const BRAND = {
  name: 'Growth OS',
  company: 'EmotionsCare SASU',
  supportEmail: 'support@agent-growth-automator.com',
  primaryColor: '#6366f1',
  secondaryColor: '#8b5cf6',
  backgroundColor: '#0f1117',
  cardBackground: '#1a1f2e',
  textColor: '#ffffff',
  mutedColor: '#9ca3af',
  borderColor: '#374151',
};

const LOGO_SVG = `
<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1"/>
      <stop offset="100%" style="stop-color:#8b5cf6"/>
    </linearGradient>
  </defs>
  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#logoGradient)"/>
</svg>
`;

const BUTTON_STYLE = `
  display: inline-block;
  padding: 14px 28px;
  background: linear-gradient(135deg, ${BRAND.primaryColor} 0%, ${BRAND.secondaryColor} 100%);
  color: #ffffff;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  text-align: center;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
`;

function baseLayout(content: string, previewText: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${BRAND.name}</title>
  <style>
    body { margin: 0; padding: 0; background-color: ${BRAND.backgroundColor}; }
    a { color: ${BRAND.primaryColor}; text-decoration: none; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.backgroundColor};">
  <div style="display: none; font-size: 1px; color: ${BRAND.backgroundColor}; max-height: 0px; overflow: hidden;">
    ${previewText}
  </div>
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${BRAND.backgroundColor};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 12px;">${LOGO_SVG}</td>
                  <td style="vertical-align: middle;">
                    <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 24px; font-weight: 700; color: ${BRAND.textColor};">
                      ${BRAND.name}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: ${BRAND.cardBackground}; border-radius: 12px; border: 1px solid ${BRAND.borderColor}; padding: 40px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 30px;">
              <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; color: ${BRAND.mutedColor}; margin: 0 0 10px 0;">
                ${BRAND.name} par ${BRAND.company}
              </p>
              <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; color: ${BRAND.mutedColor}; margin: 0;">
                <a href="mailto:${BRAND.supportEmail}" style="color: ${BRAND.primaryColor};">${BRAND.supportEmail}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Template generators
function generateTemplate(templateName: string, data: Record<string, unknown>): EmailTemplate {
  switch (templateName) {
    case 'welcome':
      return generateWelcomeEmail(data);
    case 'password_reset':
      return generatePasswordResetEmail(data);
    case 'payment_confirmation':
      return generatePaymentConfirmationEmail(data);
    case 'agent_run_completed':
      return generateAgentRunCompletedEmail(data);
    default:
      throw new Error(`Unknown template: ${templateName}`);
  }
}

function generateWelcomeEmail(data: Record<string, unknown>): EmailTemplate {
  const userName = data.userName as string | undefined;
  const loginUrl = data.loginUrl as string;
  const greeting = userName ? `Bonjour ${userName},` : 'Bonjour,';
  
  const content = `
    <h1 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 24px; font-weight: 700; color: ${BRAND.textColor}; margin: 0 0 20px 0;">
      Bienvenue sur ${BRAND.name} ! 🚀
    </h1>
    <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; color: ${BRAND.textColor}; line-height: 1.6; margin: 0 0 20px 0;">
      ${greeting}
    </p>
    <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; color: ${BRAND.textColor}; line-height: 1.6; margin: 0 0 30px 0;">
      Votre compte a été créé avec succès. Vous avez maintenant accès à notre plateforme d'agents IA.
    </p>
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" style="padding: 10px 0;">
          <a href="${loginUrl}" style="${BUTTON_STYLE}">Accéder à mon tableau de bord</a>
        </td>
      </tr>
    </table>
  `;

  return {
    subject: `Bienvenue sur ${BRAND.name} ! Votre compte est prêt`,
    html: baseLayout(content, `Bienvenue sur ${BRAND.name} !`),
  };
}

function generatePasswordResetEmail(data: Record<string, unknown>): EmailTemplate {
  const resetUrl = data.resetUrl as string;
  const expiresIn = (data.expiresIn as string) || '1 heure';
  
  const content = `
    <h1 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 24px; font-weight: 700; color: ${BRAND.textColor}; margin: 0 0 20px 0;">
      Réinitialisation de votre mot de passe
    </h1>
    <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; color: ${BRAND.textColor}; line-height: 1.6; margin: 0 0 20px 0;">
      Bonjour,
    </p>
    <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; color: ${BRAND.textColor}; line-height: 1.6; margin: 0 0 30px 0;">
      Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
    </p>
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" style="padding: 10px 0;">
          <a href="${resetUrl}" style="${BUTTON_STYLE}">Réinitialiser mon mot de passe</a>
        </td>
      </tr>
    </table>
    <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: ${BRAND.mutedColor}; margin: 30px 0 0 0;">
      ⏱️ Ce lien expire dans <strong style="color: ${BRAND.textColor};">${expiresIn}</strong>.
    </p>
  `;

  return {
    subject: `[${BRAND.name}] Réinitialisez votre mot de passe`,
    html: baseLayout(content, 'Réinitialisez votre mot de passe Growth OS'),
  };
}

function generatePaymentConfirmationEmail(data: Record<string, unknown>): EmailTemplate {
  const userName = data.userName as string | undefined;
  const planName = data.planName as string;
  const amount = data.amount as string;
  const dashboardUrl = data.dashboardUrl as string;
  const invoiceUrl = data.invoiceUrl as string | undefined;
  const greeting = userName ? `Bonjour ${userName},` : 'Bonjour,';
  
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <span style="font-size: 40px;">✅</span>
    </div>
    <h1 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 24px; font-weight: 700; color: ${BRAND.textColor}; margin: 0 0 20px 0; text-align: center;">
      Paiement confirmé !
    </h1>
    <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; color: ${BRAND.textColor}; margin: 0 0 20px 0;">
      ${greeting}
    </p>
    <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; color: ${BRAND.textColor}; margin: 0 0 30px 0;">
      Merci pour votre confiance ! Votre abonnement ${BRAND.name} est maintenant actif.
    </p>
    <div style="background-color: rgba(99, 102, 241, 0.1); border-radius: 8px; padding: 20px; margin-bottom: 30px;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="font-family: sans-serif; font-size: 14px; color: ${BRAND.mutedColor}; padding-bottom: 10px;">Plan</td>
          <td align="right" style="font-family: sans-serif; font-size: 14px; color: ${BRAND.textColor}; font-weight: 600;">${planName}</td>
        </tr>
        <tr>
          <td style="font-family: sans-serif; font-size: 14px; color: ${BRAND.mutedColor};">Montant</td>
          <td align="right" style="font-family: sans-serif; font-size: 18px; color: ${BRAND.primaryColor}; font-weight: 700;">${amount}</td>
        </tr>
      </table>
    </div>
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" style="padding: 10px 0;">
          <a href="${dashboardUrl}" style="${BUTTON_STYLE}">Accéder à mon tableau de bord</a>
        </td>
      </tr>
    </table>
    ${invoiceUrl ? `<p style="font-family: sans-serif; font-size: 14px; color: ${BRAND.mutedColor}; margin: 30px 0 0 0; text-align: center;">📄 <a href="${invoiceUrl}" style="color: ${BRAND.primaryColor};">Télécharger ma facture</a></p>` : ''}
  `;

  return {
    subject: `[${BRAND.name}] Confirmation de paiement - ${planName}`,
    html: baseLayout(content, `Paiement confirmé pour ${BRAND.name}`),
  };
}

function generateAgentRunCompletedEmail(data: Record<string, unknown>): EmailTemplate {
  const userName = data.userName as string | undefined;
  const agentName = data.agentName as string;
  const siteName = data.siteName as string;
  const summary = data.summary as string;
  const dashboardUrl = data.dashboardUrl as string;
  const greeting = userName ? `Bonjour ${userName},` : 'Bonjour,';
  
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <span style="font-size: 40px;">🤖</span>
    </div>
    <h1 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 24px; font-weight: 700; color: ${BRAND.textColor}; margin: 0 0 20px 0; text-align: center;">
      Analyse terminée !
    </h1>
    <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; color: ${BRAND.textColor}; margin: 0 0 20px 0;">
      ${greeting}
    </p>
    <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; color: ${BRAND.textColor}; margin: 0 0 20px 0;">
      L'agent <strong style="color: ${BRAND.primaryColor};">${agentName}</strong> a terminé son analyse pour <strong>${siteName}</strong>.
    </p>
    <div style="background-color: rgba(99, 102, 241, 0.1); border-left: 4px solid ${BRAND.primaryColor}; padding: 20px; margin: 20px 0 30px 0; border-radius: 0 8px 8px 0;">
      <p style="font-family: sans-serif; font-size: 14px; color: ${BRAND.mutedColor}; margin: 0 0 8px 0;">Résumé</p>
      <p style="font-family: sans-serif; font-size: 15px; color: ${BRAND.textColor}; margin: 0;">${summary}</p>
    </div>
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" style="padding: 10px 0;">
          <a href="${dashboardUrl}" style="${BUTTON_STYLE}">Voir les résultats</a>
        </td>
      </tr>
    </table>
  `;

  return {
    subject: `[${BRAND.name}] ${agentName} a terminé l'analyse de ${siteName}`,
    html: baseLayout(content, `L'agent ${agentName} a terminé son analyse`),
  };
}

async function sendEmailWithRetry(
  smtpClient: SMTPClient,
  to: string,
  subject: string,
  html: string,
  maxRetries: number = 1
): Promise<{ success: boolean; error?: string }> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      await smtpClient.send({
        from: `Growth OS <noreply@agent-growth-automator.com>`,
        to: to,
        subject: subject,
        content: "auto",
        html: html,
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logStep(`Send attempt ${attempt + 1} failed`, { error: errorMessage });
      
      if (attempt === maxRetries) {
        return { success: false, error: errorMessage };
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return { success: false, error: 'Max retries exceeded' };
}

// deno-lint-ignore no-explicit-any
async function logEmailToDatabase(
  supabase: any,
  workspaceId: string | null,
  recipient: string,
  templateName: string,
  subject: string,
  status: 'sent' | 'failed' | 'pending',
  errorMessage?: string
): Promise<void> {
  try {
    const insertData: Record<string, unknown> = {
      recipient,
      template_name: templateName,
      subject,
      status,
      error_message: errorMessage || null,
      sent_at: new Date().toISOString(),
    };
    
    if (workspaceId) {
      insertData.workspace_id = workspaceId;
    }
    
    const { error } = await supabase.from('email_log').insert(insertData);
    
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
    const SMTP_HOST = Deno.env.get("SMTP_HOST");
    const SMTP_PORT = Deno.env.get("SMTP_PORT");
    const SMTP_USER = Deno.env.get("SMTP_USER");
    const SMTP_PASS = Deno.env.get("SMTP_PASS");

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

    // Generate email content
    const { subject, html } = generateTemplate(template, data);

    // Check if SMTP is configured
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
      logStep("SMTP not configured, logging email as pending");
      
      await logEmailToDatabase(
        supabase,
        workspace_id || null,
        to,
        template,
        subject,
        'pending',
        'SMTP not configured'
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          warning: "SMTP not configured, email logged but not sent" 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create SMTP client
    const smtpClient = new SMTPClient({
      connection: {
        hostname: SMTP_HOST,
        port: parseInt(SMTP_PORT, 10),
        tls: true,
        auth: {
          username: SMTP_USER,
          password: SMTP_PASS,
        },
      },
    });

    try {
      // Send email with retry
      const result = await sendEmailWithRetry(smtpClient, to, subject, html);

      // Log to database
      await logEmailToDatabase(
        supabase,
        workspace_id || null,
        to,
        template,
        subject,
        result.success ? 'sent' : 'failed',
        result.error
      );

      await smtpClient.close();

      if (result.success) {
        logStep("Email sent successfully", { to, template });
        return new Response(
          JSON.stringify({ success: true }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } else {
        logStep("Email sending failed after retries", { error: result.error });
        return new Response(
          JSON.stringify({ success: false, error: result.error }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    } catch (error) {
      await smtpClient.close();
      throw error;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Send email error:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

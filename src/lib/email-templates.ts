/**
 * Email Templates for Growth OS
 * Professional branded HTML email templates in French
 */

const BRAND = {
  name: 'Growth OS',
  company: 'EmotionsCare SASU',
  supportEmail: 'support@agent-growth-automator.com',
  primaryColor: '#6366f1', // Indigo
  secondaryColor: '#8b5cf6', // Violet
  backgroundColor: '#0f1117',
  cardBackground: '#1a1f2e',
  textColor: '#ffffff',
  mutedColor: '#9ca3af',
  borderColor: '#374151',
};

// Inline SVG logo (lightning bolt)
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

// Button gradient CSS
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

// Base email layout wrapper
function baseLayout(content: string, previewText: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${BRAND.name}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: ${BRAND.backgroundColor}; }
    a { color: ${BRAND.primaryColor}; text-decoration: none; }
    @media screen and (max-width: 600px) {
      .mobile-padding { padding: 20px !important; }
      .mobile-text { font-size: 14px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.backgroundColor};">
  <!-- Preview text -->
  <div style="display: none; font-size: 1px; color: ${BRAND.backgroundColor}; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${previewText}
  </div>
  
  <!-- Email container -->
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${BRAND.backgroundColor};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
          
          <!-- Header with Logo -->
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 12px;">
                    ${LOGO_SVG}
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 24px; font-weight: 700; color: ${BRAND.textColor};">
                      ${BRAND.name}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Main content card -->
          <tr>
            <td style="background-color: ${BRAND.cardBackground}; border-radius: 12px; border: 1px solid ${BRAND.borderColor}; padding: 40px;" class="mobile-padding">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 30px;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; color: ${BRAND.mutedColor}; text-align: center; line-height: 1.6;">
                    <p style="margin: 0 0 10px 0;">
                      ${BRAND.name} par ${BRAND.company}
                    </p>
                    <p style="margin: 0 0 10px 0;">
                      <a href="mailto:${BRAND.supportEmail}" style="color: ${BRAND.primaryColor};">${BRAND.supportEmail}</a>
                    </p>
                    <p style="margin: 0; font-size: 11px;">
                      <a href="{{unsubscribe_url}}" style="color: ${BRAND.mutedColor}; text-decoration: underline;">Se désinscrire des emails</a>
                    </p>
                  </td>
                </tr>
              </table>
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

// Template data interfaces
export interface WelcomeEmailData {
  userName?: string;
  loginUrl: string;
}

export interface PasswordResetEmailData {
  resetUrl: string;
  expiresIn?: string;
}

export interface PaymentConfirmationEmailData {
  userName?: string;
  planName: string;
  amount: string;
  invoiceUrl?: string;
  dashboardUrl: string;
}

export interface AgentRunCompletedEmailData {
  userName?: string;
  agentName: string;
  siteName: string;
  summary: string;
  dashboardUrl: string;
}

// Template generators
export function welcomeEmail(data: WelcomeEmailData): { subject: string; html: string } {
  const greeting = data.userName ? `Bonjour ${data.userName},` : 'Bonjour,';
  
  const content = `
    <h1 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 24px; font-weight: 700; color: ${BRAND.textColor}; margin: 0 0 20px 0;">
      Bienvenue sur ${BRAND.name} ! 🚀
    </h1>
    
    <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; color: ${BRAND.textColor}; line-height: 1.6; margin: 0 0 20px 0;">
      ${greeting}
    </p>
    
    <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; color: ${BRAND.textColor}; line-height: 1.6; margin: 0 0 20px 0;">
      Votre compte a été créé avec succès. Vous avez maintenant accès à notre plateforme d'agents IA pour automatiser et optimiser la croissance de votre entreprise.
    </p>
    
    <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; color: ${BRAND.textColor}; line-height: 1.6; margin: 0 0 30px 0;">
      Voici ce que vous pouvez faire dès maintenant :
    </p>
    
    <ul style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: ${BRAND.mutedColor}; line-height: 1.8; margin: 0 0 30px 0; padding-left: 20px;">
      <li>Connecter votre premier site web</li>
      <li>Configurer vos intégrations Google et Meta</li>
      <li>Lancer votre premier audit SEO automatisé</li>
      <li>Explorer les 35+ agents IA disponibles</li>
    </ul>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" style="padding: 10px 0;">
          <a href="${data.loginUrl}" style="${BUTTON_STYLE}">
            Accéder à mon tableau de bord
          </a>
        </td>
      </tr>
    </table>
    
    <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: ${BRAND.mutedColor}; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
      Des questions ? Répondez directement à cet email ou contactez-nous à 
      <a href="mailto:${BRAND.supportEmail}" style="color: ${BRAND.primaryColor};">${BRAND.supportEmail}</a>
    </p>
  `;

  return {
    subject: `Bienvenue sur ${BRAND.name} ! Votre compte est prêt`,
    html: baseLayout(content, `Bienvenue sur ${BRAND.name} ! Votre compte a été créé avec succès.`),
  };
}

export function passwordResetEmail(data: PasswordResetEmailData): { subject: string; html: string } {
  const expiresText = data.expiresIn || '1 heure';
  
  const content = `
    <h1 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 24px; font-weight: 700; color: ${BRAND.textColor}; margin: 0 0 20px 0;">
      Réinitialisation de votre mot de passe
    </h1>
    
    <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; color: ${BRAND.textColor}; line-height: 1.6; margin: 0 0 20px 0;">
      Bonjour,
    </p>
    
    <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; color: ${BRAND.textColor}; line-height: 1.6; margin: 0 0 20px 0;">
      Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte ${BRAND.name}.
    </p>
    
    <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; color: ${BRAND.textColor}; line-height: 1.6; margin: 0 0 30px 0;">
      Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
    </p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" style="padding: 10px 0;">
          <a href="${data.resetUrl}" style="${BUTTON_STYLE}">
            Réinitialiser mon mot de passe
          </a>
        </td>
      </tr>
    </table>
    
    <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: ${BRAND.mutedColor}; line-height: 1.6; margin: 30px 0 0 0;">
      ⏱️ Ce lien expire dans <strong style="color: ${BRAND.textColor};">${expiresText}</strong>.
    </p>
    
    <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: ${BRAND.mutedColor}; line-height: 1.6; margin: 15px 0 0 0;">
      Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité. Votre mot de passe actuel restera inchangé.
    </p>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid ${BRAND.borderColor};">
      <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; color: ${BRAND.mutedColor}; line-height: 1.6; margin: 0;">
        🔒 Pour votre sécurité, ne partagez jamais ce lien avec personne.
      </p>
    </div>
  `;

  return {
    subject: `[${BRAND.name}] Réinitialisez votre mot de passe`,
    html: baseLayout(content, 'Réinitialisez votre mot de passe Growth OS'),
  };
}

export function paymentConfirmationEmail(data: PaymentConfirmationEmailData): { subject: string; html: string } {
  const greeting = data.userName ? `Bonjour ${data.userName},` : 'Bonjour,';
  
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="display: inline-block; background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%); border-radius: 50%; padding: 20px;">
        <span style="font-size: 40px;">✅</span>
      </div>
    </div>
    
    <h1 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 24px; font-weight: 700; color: ${BRAND.textColor}; margin: 0 0 20px 0; text-align: center;">
      Paiement confirmé !
    </h1>
    
    <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; color: ${BRAND.textColor}; line-height: 1.6; margin: 0 0 20px 0;">
      ${greeting}
    </p>
    
    <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; color: ${BRAND.textColor}; line-height: 1.6; margin: 0 0 30px 0;">
      Merci pour votre confiance ! Votre abonnement ${BRAND.name} est maintenant actif.
    </p>
    
    <!-- Receipt box -->
    <div style="background-color: rgba(99, 102, 241, 0.1); border-radius: 8px; padding: 20px; margin-bottom: 30px;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: ${BRAND.mutedColor}; padding-bottom: 10px;">
            Plan
          </td>
          <td align="right" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: ${BRAND.textColor}; font-weight: 600; padding-bottom: 10px;">
            ${data.planName}
          </td>
        </tr>
        <tr>
          <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: ${BRAND.mutedColor};">
            Montant
          </td>
          <td align="right" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 18px; color: ${BRAND.primaryColor}; font-weight: 700;">
            ${data.amount}
          </td>
        </tr>
      </table>
    </div>
    
    <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; color: ${BRAND.textColor}; line-height: 1.6; margin: 0 0 30px 0;">
      Vous avez maintenant accès à tous les agents IA de votre formule. Commencez dès maintenant à automatiser votre croissance !
    </p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" style="padding: 10px 0;">
          <a href="${data.dashboardUrl}" style="${BUTTON_STYLE}">
            Accéder à mon tableau de bord
          </a>
        </td>
      </tr>
    </table>
    
    ${data.invoiceUrl ? `
    <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: ${BRAND.mutedColor}; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
      📄 <a href="${data.invoiceUrl}" style="color: ${BRAND.primaryColor};">Télécharger ma facture</a>
    </p>
    ` : ''}
  `;

  return {
    subject: `[${BRAND.name}] Confirmation de paiement - ${data.planName}`,
    html: baseLayout(content, `Paiement confirmé pour votre abonnement ${BRAND.name}`),
  };
}

export function agentRunCompletedEmail(data: AgentRunCompletedEmailData): { subject: string; html: string } {
  const greeting = data.userName ? `Bonjour ${data.userName},` : 'Bonjour,';
  
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="display: inline-block; background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%); border-radius: 50%; padding: 20px;">
        <span style="font-size: 40px;">🤖</span>
      </div>
    </div>
    
    <h1 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 24px; font-weight: 700; color: ${BRAND.textColor}; margin: 0 0 20px 0; text-align: center;">
      Analyse terminée !
    </h1>
    
    <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; color: ${BRAND.textColor}; line-height: 1.6; margin: 0 0 20px 0;">
      ${greeting}
    </p>
    
    <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; color: ${BRAND.textColor}; line-height: 1.6; margin: 0 0 20px 0;">
      L'agent <strong style="color: ${BRAND.primaryColor};">${data.agentName}</strong> a terminé son analyse pour <strong>${data.siteName}</strong>.
    </p>
    
    <!-- Summary box -->
    <div style="background-color: rgba(99, 102, 241, 0.1); border-left: 4px solid ${BRAND.primaryColor}; padding: 20px; margin: 20px 0 30px 0; border-radius: 0 8px 8px 0;">
      <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: ${BRAND.mutedColor}; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">
        Résumé
      </p>
      <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: ${BRAND.textColor}; line-height: 1.6; margin: 0;">
        ${data.summary}
      </p>
    </div>
    
    <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; color: ${BRAND.textColor}; line-height: 1.6; margin: 0 0 30px 0;">
      Consultez les résultats détaillés et les recommandations dans votre tableau de bord.
    </p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" style="padding: 10px 0;">
          <a href="${data.dashboardUrl}" style="${BUTTON_STYLE}">
            Voir les résultats
          </a>
        </td>
      </tr>
    </table>
    
    <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; color: ${BRAND.mutedColor}; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
      💡 Astuce : Activez les runs automatiques pour recevoir des analyses régulières sans intervention manuelle.
    </p>
  `;

  return {
    subject: `[${BRAND.name}] ${data.agentName} a terminé l'analyse de ${data.siteName}`,
    html: baseLayout(content, `L'agent ${data.agentName} a terminé son analyse`),
  };
}

// Template registry for easy access
export const emailTemplates = {
  welcome: welcomeEmail,
  password_reset: passwordResetEmail,
  payment_confirmation: paymentConfirmationEmail,
  agent_run_completed: agentRunCompletedEmail,
} as const;

export type EmailTemplateName = keyof typeof emailTemplates;

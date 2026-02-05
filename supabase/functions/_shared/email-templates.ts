// Email templates for Growth OS transactional emails
// Templates use inline CSS for maximum email client compatibility

const BRAND = {
  name: 'Growth OS',
  company: 'EmotionsCare SASU',
  supportEmail: 'support@agent-growth-automator.com',
  dashboardUrl: 'https://www.agent-growth-automator.com/dashboard',
  billingUrl: 'https://www.agent-growth-automator.com/dashboard/billing',
};

const COLORS = {
  background: '#0f1117',
  cardBackground: '#1a1a2e',
  text: '#e2e8f0',
  muted: '#64748b',
  primary: '#6366f1',
  secondary: '#8b5cf6',
  border: '#2d2d5e',
};

function baseLayout(content: string, previewText: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${BRAND.name}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.background}; font-family: Arial, sans-serif; line-height: 1.6;">
  <div style="display: none; font-size: 1px; color: ${COLORS.background}; max-height: 0px; overflow: hidden;">
    ${previewText}
  </div>
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${COLORS.background};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <span style="font-size: 32px;">⚡</span>
              <span style="font-size: 24px; font-weight: bold; color: #ffffff; vertical-align: middle; margin-left: 10px;">
                ${BRAND.name}
              </span>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="border-top: 1px solid ${COLORS.border}; padding-top: 30px;">
              <p style="font-size: 12px; color: ${COLORS.muted}; margin: 0 0 10px 0; text-align: center;">
                ${BRAND.name} par ${BRAND.company}
              </p>
              <p style="font-size: 12px; color: ${COLORS.muted}; margin: 0; text-align: center;">
                Des questions ? <a href="mailto:${BRAND.supportEmail}" style="color: ${COLORS.primary}; text-decoration: none;">${BRAND.supportEmail}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(text: string, url: string): string {
  return `<table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <a href="${url}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary}); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          ${text}
        </a>
      </td>
    </tr>
  </table>`;
}

function infoBox(content: string): string {
  return `<div style="background-color: ${COLORS.cardBackground}; border-radius: 8px; padding: 20px; margin: 20px 0;">
    ${content}
  </div>`;
}

interface WelcomeData {
  userName?: string;
}

function welcomeTemplate(data: WelcomeData): string {
  const userName = data.userName || 'là';
  const content = `
    <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 20px 0;">Bienvenue sur ${BRAND.name} 🚀</h1>
    <p style="color: ${COLORS.text}; margin: 0 0 15px 0;">
      Bonjour ${userName},
    </p>
    <p style="color: ${COLORS.text}; margin: 0 0 15px 0;">
      Votre entreprise digitale est prête. <strong>39 agents IA</strong> travaillent désormais pour vous, 24h/24.
    </p>
    <p style="color: ${COLORS.text}; margin: 0 0 25px 0;">
      Votre prochaine étape : connectez vos outils (Google Search Console, Analytics) pour débloquer tout le potentiel de ${BRAND.name}.
    </p>
    ${ctaButton('Accéder à mon dashboard', BRAND.dashboardUrl)}
    <p style="color: ${COLORS.muted}; font-size: 14px; margin: 25px 0 0 0;">
      Si vous avez des questions, notre équipe est disponible à <a href="mailto:${BRAND.supportEmail}" style="color: ${COLORS.primary}; text-decoration: none;">${BRAND.supportEmail}</a>
    </p>
  `;
  return baseLayout(content, `Bienvenue sur ${BRAND.name} ! Votre entreprise digitale est prête.`);
}

interface PaymentConfirmationData {
  userName?: string;
  planName: string;
  amount: string;
  nextBillingDate?: string;
  invoiceUrl?: string;
}

function paymentConfirmationTemplate(data: PaymentConfirmationData): string {
  const userName = data.userName || 'là';
  const invoiceLink = data.invoiceUrl 
    ? `<p style="color: ${COLORS.text}; text-align: center; margin-top: 15px;">
        <a href="${data.invoiceUrl}" style="color: ${COLORS.primary}; text-decoration: none;">📄 Télécharger la facture</a>
       </p>`
    : '';
  
  const content = `
    <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 20px 0;">Paiement confirmé ✅</h1>
    <p style="color: ${COLORS.text}; margin: 0 0 15px 0;">
      Bonjour ${userName},
    </p>
    <p style="color: ${COLORS.text}; margin: 0 0 25px 0;">
      Votre paiement a bien été confirmé. Merci pour votre confiance !
    </p>
    ${infoBox(`
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="color: ${COLORS.muted}; padding-bottom: 10px;">Plan</td>
          <td align="right" style="color: ${COLORS.text}; font-weight: bold; padding-bottom: 10px;">${data.planName}</td>
        </tr>
        <tr>
          <td style="color: ${COLORS.muted}; padding-bottom: 10px;">Montant</td>
          <td align="right" style="color: ${COLORS.text}; font-weight: bold; padding-bottom: 10px;">${data.amount}</td>
        </tr>
        ${data.nextBillingDate ? `
        <tr>
          <td style="color: ${COLORS.muted};">Prochain prélèvement</td>
          <td align="right" style="color: ${COLORS.text};">${data.nextBillingDate}</td>
        </tr>
        ` : ''}
      </table>
    `)}
    ${invoiceLink}
    ${ctaButton('Voir mon abonnement', BRAND.billingUrl)}
  `;
  return baseLayout(content, `Votre paiement ${BRAND.name} a été confirmé.`);
}

interface RunCompletedData {
  userName?: string;
  agentName: string;
  runType: string;
  summary: string;
}

function runCompletedTemplate(data: RunCompletedData): string {
  const userName = data.userName || 'là';
  // Truncate summary to 200 chars
  const truncatedSummary = data.summary.length > 200 
    ? data.summary.substring(0, 197) + '...'
    : data.summary;
  
  const content = `
    <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 20px 0;">Analyse terminée 🤖</h1>
    <p style="color: ${COLORS.text}; margin: 0 0 15px 0;">
      Bonjour ${userName},
    </p>
    <p style="color: ${COLORS.text}; margin: 0 0 25px 0;">
      L'agent <strong style="color: ${COLORS.primary};">${data.agentName}</strong> a terminé l'exécution de <strong>${data.runType}</strong>.
    </p>
    ${infoBox(`
      <p style="color: ${COLORS.muted}; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase;">Résumé</p>
      <p style="color: ${COLORS.text}; margin: 0; font-size: 14px;">${truncatedSummary}</p>
    `)}
    ${ctaButton('Voir les résultats', BRAND.dashboardUrl)}
  `;
  return baseLayout(content, `L'agent ${data.agentName} a terminé l'analyse.`);
}

interface PasswordResetData {
  resetLink: string;
}

function passwordResetTemplate(data: PasswordResetData): string {
  const content = `
    <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 20px 0;">Réinitialisation de mot de passe</h1>
    <p style="color: ${COLORS.text}; margin: 0 0 15px 0;">
      Vous avez demandé une réinitialisation de mot de passe.
    </p>
    <p style="color: ${COLORS.text}; margin: 0 0 25px 0;">
      Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien expire dans <strong>1 heure</strong>.
    </p>
    ${ctaButton('Réinitialiser mon mot de passe', data.resetLink)}
    <p style="color: ${COLORS.muted}; font-size: 14px; margin: 25px 0 0 0;">
      Si vous n'avez pas fait cette demande, ignorez cet email. Votre mot de passe restera inchangé.
    </p>
  `;
  return baseLayout(content, 'Réinitialisez votre mot de passe Growth OS');
}

export function getTemplate(template: string, data: Record<string, unknown>): { subject: string; html: string } {
  switch (template) {
    case 'welcome':
      return {
        subject: 'Bienvenue sur Growth OS 🚀',
        html: welcomeTemplate(data as unknown as WelcomeData),
      };
    case 'payment_confirmation': {
      const paymentData = data as unknown as PaymentConfirmationData;
      return {
        subject: 'Confirmation de paiement — Growth OS',
        html: paymentConfirmationTemplate(paymentData),
      };
    }
    case 'run_completed': {
      const runData = data as unknown as RunCompletedData;
      return {
        subject: `${runData.agentName || 'Agent'} a terminé : ${runData.runType || 'analyse'}`,
        html: runCompletedTemplate(runData),
      };
    }
    case 'password_reset':
      return {
        subject: 'Réinitialisation de mot de passe — Growth OS',
        html: passwordResetTemplate(data as unknown as PasswordResetData),
      };
    default:
      throw new Error(`Unknown email template: ${template}`);
  }
}

export { BRAND, COLORS };

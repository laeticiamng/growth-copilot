import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders } from "../_shared/cors.ts";

interface CreativeInitRequest {
  workspace_id: string;
  site_id?: string;
  site_url: string;
  offer: string;
  objective: 'lead' | 'sale' | 'booking' | 'awareness';
  language: string;
  geo?: string;
  style?: string;
  duration_seconds?: number;
  logo_url?: string;
  product_images?: string[];
  brand_kit_id?: string;
  idempotency_key?: string; // V2: Prevent duplicate jobs
}

interface CopywritingOutput {
  hooks: string[];
  scripts: { duration: number; script: string }[];
  ctas: string[];
  headlines: string[];
  primary_texts: string[];
}

interface BlueprintScene {
  scene_id: string;
  start_time: number;
  end_time: number;
  text_overlay?: {
    text: string;
    position: 'top' | 'center' | 'bottom';
    font_size: 'small' | 'medium' | 'large';
    safe_zone: boolean;
  };
  asset_placeholder?: {
    type: 'logo' | 'product' | 'background';
    url?: string;
  };
  transition?: string;
}

interface CreativeBlueprint {
  aspect_ratio: '9:16' | '1:1' | '16:9';
  duration_seconds: number;
  scenes: BlueprintScene[];
  subtitles: { start: number; end: number; text: string }[];
  cta_placement: { position: string; timing: number };
  brand_colors?: { primary: string; secondary: string };
}

// V2: Claim guardrail patterns for auto-detection
const CLAIM_PATTERNS = {
  absolute: /\b(meilleur|unique|seul|garanti|100%|parfait|miracle|révolutionnaire|n°1|numéro\s*1)\b/gi,
  numeric: /\d+\s*(%|€|euros?|fois|x\d)/gi,
  health: /\b(guérit|soigne|traite|élimine|supprime|perte\s*de\s*poids)\b/gi,
  finance: /\b(gains?\s*garanti|revenu\s*passif|devenez\s*riche|millionnaire)\b/gi
};

// V2: Auto-rewrite non-compliant claims
function rewriteClaim(claim: string): { rewritten: string; wasModified: boolean; reason?: string } {
  let rewritten = claim;
  let wasModified = false;
  let reason: string | undefined;
  
  // Replace absolute claims with compliant alternatives
  const absoluteReplacements: Record<string, string> = {
    'meilleur': 'excellent',
    'unique': 'distinctif',
    'garanti': 'conçu pour',
    'parfait': 'optimal',
    'miracle': 'efficace',
    'révolutionnaire': 'innovant',
    'n°1': 'leader',
    'numéro 1': 'leader'
  };
  
  for (const [original, replacement] of Object.entries(absoluteReplacements)) {
    const regex = new RegExp(`\\b${original}\\b`, 'gi');
    if (regex.test(rewritten)) {
      rewritten = rewritten.replace(regex, replacement);
      wasModified = true;
      reason = `Claim absolu "${original}" remplacé par "${replacement}"`;
    }
  }
  
  // Flag numeric claims that need evidence
  if (CLAIM_PATTERNS.numeric.test(claim) && !wasModified) {
    reason = 'Claim chiffré détecté - nécessite une source vérifiable';
  }
  
  return { rewritten, wasModified, reason };
}

// V2: Validate all copywriting claims and auto-rewrite if needed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function validateAndRewriteClaims(
  serviceClient: any,
  workspaceId: string,
  copywriting: CopywritingOutput,
  jobId: string
): Promise<{ copywriting: CopywritingOutput; decisions: Array<{ original: string; decision: string; rewritten?: string; reason?: string }> }> {
  const decisions: Array<{ original: string; decision: string; rewritten?: string; reason?: string }> = [];
  const rewrittenCopy = { ...copywriting };
  
  // Process hooks
  rewrittenCopy.hooks = copywriting.hooks.map(hook => {
    const result = rewriteClaim(hook);
    if (result.wasModified) {
      decisions.push({ original: hook, decision: 'rewritten', rewritten: result.rewritten, reason: result.reason });
      return result.rewritten;
    } else if (result.reason) {
      decisions.push({ original: hook, decision: 'flagged', reason: result.reason });
    }
    return hook;
  });
  
  // Process headlines
  rewrittenCopy.headlines = copywriting.headlines.map(headline => {
    const result = rewriteClaim(headline);
    if (result.wasModified) {
      decisions.push({ original: headline, decision: 'rewritten', rewritten: result.rewritten, reason: result.reason });
      return result.rewritten;
    }
    return headline;
  });
  
  // Process CTAs
  rewrittenCopy.ctas = copywriting.ctas.map(cta => {
    const result = rewriteClaim(cta);
    if (result.wasModified) {
      decisions.push({ original: cta, decision: 'rewritten', rewritten: result.rewritten, reason: result.reason });
      return result.rewritten;
    }
    return cta;
  });
  
  // Store claim decisions in database for audit
  if (decisions.length > 0) {
    for (const decision of decisions) {
      await serviceClient
        .from('claim_decisions')
        .insert({
          workspace_id: workspaceId,
          creative_job_id: jobId,
          original_claim: decision.original,
          decision: decision.decision,
          rewritten_claim: decision.rewritten,
          reason: decision.reason
        });
    }
  }
  
  return { copywriting: rewrittenCopy, decisions };
}

// Generate copywriting using AI Gateway
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateCopywriting(
  supabase: any,
  input: CreativeInitRequest,
  brandKit: Record<string, unknown> | null
): Promise<CopywritingOutput> {
  const systemPrompt = `Tu es un expert en copywriting publicitaire vidéo. Tu génères des textes courts, percutants et optimisés pour les réseaux sociaux.
  
RÈGLES STRICTES:
- Hooks: 3 variations, max 8 mots chacun, accrocheurs
- Scripts: 2 versions (15s et 30s), conversationnels, avec pauses naturelles
- CTAs: 3 variations, action claire, urgence subtile
- Headlines: 3 variations, max 40 caractères, impact immédiat
- Primary texts: 3 variations, max 125 caractères, bénéfice clair

INTERDICTIONS:
- Jamais de promesses non vérifiables
- Jamais de superlatifs excessifs (meilleur, unique, révolutionnaire)
- Jamais de claims santé/finance non sourcés
- Toujours respecter le ton de voix de la marque si fourni`;

  const userPrompt = `Génère un pack copywriting complet pour cette publicité vidéo:

CONTEXTE:
- Site: ${input.site_url}
- Offre: ${input.offer}
- Objectif: ${input.objective}
- Langue: ${input.language}
- Géo: ${input.geo || 'France'}
${brandKit ? `- Ton de voix: ${brandKit.tone_of_voice || 'professionnel et accessible'}` : ''}
${brandKit ? `- Valeurs: ${JSON.stringify(brandKit.values) || '[]'}` : ''}
${brandKit ? `- Termes interdits: ${JSON.stringify(brandKit.forbidden_words) || '[]'}` : ''}

Réponds UNIQUEMENT en JSON valide avec cette structure:
{
  "hooks": ["hook1", "hook2", "hook3"],
  "scripts": [
    {"duration": 15, "script": "texte script 15s..."},
    {"duration": 30, "script": "texte script 30s..."}
  ],
  "ctas": ["cta1", "cta2", "cta3"],
  "headlines": ["headline1", "headline2", "headline3"],
  "primary_texts": ["text1", "text2", "text3"]
}`;

  const { data, error } = await supabase.functions.invoke('ai-gateway', {
    body: {
      agent_name: 'copywriting_agent',
      purpose: 'creative_copywriting',
      workspace_id: input.workspace_id,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' }
    }
  });

  if (error) {
    console.error('[creative-init] Copywriting AI error:', error);
    throw new Error('Failed to generate copywriting: ' + error.message);
  }

  try {
    const content = data.output?.content || data.output;
    return typeof content === 'string' ? JSON.parse(content) : content;
  } catch (e) {
    console.error('[creative-init] Failed to parse copywriting output:', e);
    throw new Error('Invalid copywriting output format');
  }
}

// Generate creative blueprint using AI Gateway
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateBlueprint(
  supabase: any,
  input: CreativeInitRequest,
  copywriting: CopywritingOutput,
  aspectRatio: '9:16' | '1:1' | '16:9'
): Promise<CreativeBlueprint> {
  const safeZoneGuide = {
    '9:16': { top: 150, bottom: 200, left: 40, right: 40, cta_bottom: 180 },
    '1:1': { top: 80, bottom: 80, left: 40, right: 40, cta_bottom: 100 },
    '16:9': { top: 60, bottom: 80, left: 80, right: 80, cta_bottom: 60 }
  };

  const systemPrompt = `Tu es un expert en production vidéo publicitaire. Tu crées des blueprints JSON structurés pour le rendu vidéo.

SAFE ZONES (pixels à respecter pour ${aspectRatio}):
${JSON.stringify(safeZoneGuide[aspectRatio], null, 2)}

RÈGLES DE DESIGN:
- Texte lisible sur mobile (min 24px pour 9:16)
- Contraste minimum 4.5:1 (WCAG AA)
- Max 2 lignes de texte par écran
- CTA toujours visible en fin de vidéo
- Transitions fluides (0.3s-0.5s)
- Logo visible mais non intrusif

STRUCTURE SCÈNE:
- scene_id: identifiant unique
- start_time/end_time: en secondes
- text_overlay: texte affiché (position, taille, safe_zone=true obligatoire)
- asset_placeholder: logo, product, ou background
- transition: fade, slide, zoom (optionnel)`;

  const userPrompt = `Génère un blueprint vidéo pour le format ${aspectRatio}:

DURÉE: ${input.duration_seconds || 15} secondes
HOOK: ${copywriting.hooks[0]}
SCRIPT: ${copywriting.scripts[0].script}
CTA: ${copywriting.ctas[0]}

ASSETS DISPONIBLES:
- Logo: ${input.logo_url || 'placeholder'}
- Images produit: ${JSON.stringify(input.product_images || [])}

Réponds UNIQUEMENT en JSON valide:
{
  "aspect_ratio": "${aspectRatio}",
  "duration_seconds": ${input.duration_seconds || 15},
  "scenes": [
    {
      "scene_id": "scene_1",
      "start_time": 0,
      "end_time": 3,
      "text_overlay": {
        "text": "Hook text here",
        "position": "center",
        "font_size": "large",
        "safe_zone": true
      },
      "asset_placeholder": {"type": "background"},
      "transition": "fade"
    }
  ],
  "subtitles": [
    {"start": 0, "end": 3, "text": "Subtitle text..."}
  ],
  "cta_placement": {"position": "bottom_center", "timing": 12},
  "brand_colors": {"primary": "#000000", "secondary": "#ffffff"}
}`;

  const { data, error } = await supabase.functions.invoke('ai-gateway', {
    body: {
      agent_name: 'creative_blueprint_agent',
      purpose: 'creative_blueprint',
      workspace_id: input.workspace_id,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' }
    }
  });

  if (error) {
    console.error('[creative-init] Blueprint AI error:', error);
    throw new Error('Failed to generate blueprint: ' + error.message);
  }

  try {
    const content = data.output?.content || data.output;
    return typeof content === 'string' ? JSON.parse(content) : content;
  } catch (e) {
    console.error('[creative-init] Failed to parse blueprint output:', e);
    throw new Error('Invalid blueprint output format');
  }
}

// QCO validation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function validateWithQCO(
  supabase: any,
  copywriting: CopywritingOutput,
  blueprints: CreativeBlueprint[],
  workspaceId: string
): Promise<{ approved: boolean; issues: string[] }> {
  const systemPrompt = `Tu es le Quality & Compliance Officer (QCO). Tu valides la conformité des publicités.

CRITÈRES DE VALIDATION:
1. Claims vérifiables uniquement (pas de "meilleur", "unique", "garanti")
2. Pas de promesses santé/finance non sourcées
3. Pas de manipulation émotionnelle excessive
4. Texte lisible (safe zones respectées)
5. Contraste suffisant
6. Densité texte acceptable (max 2 lignes/écran)

RÉPONSE: JSON avec approved (boolean) et issues (array de problèmes détectés)`;

  const userPrompt = `Valide ce contenu publicitaire:

COPYWRITING:
${JSON.stringify(copywriting, null, 2)}

BLUEPRINTS (résumé):
${blueprints.map(b => `- ${b.aspect_ratio}: ${b.scenes.length} scènes`).join('\n')}

Réponds en JSON: {"approved": true/false, "issues": ["issue1", "issue2"]}`;

  const { data, error } = await supabase.functions.invoke('ai-gateway', {
    body: {
      agent_name: 'qco_agent',
      purpose: 'creative_compliance',
      workspace_id: workspaceId,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' }
    }
  });

  if (error) {
    console.error('[creative-init] QCO validation error:', error);
    // FAIL-CLOSED: If QCO fails, mark as NOT approved and require manual review
    return { approved: false, issues: ['QCO validation error - manual review required: ' + error.message] };
  }

  try {
    const content = data.output?.content || data.output;
    return typeof content === 'string' ? JSON.parse(content) : content;
  } catch (e) {
    // FAIL-CLOSED: Parsing failure means we can't trust the output
    console.error('[creative-init] QCO output parsing failed:', e);
    return { approved: false, issues: ['QCO output parsing failed - manual review required'] };
  }
}

// Pricing configuration (cost per render/asset)
const PRICING_CONFIG = {
  video_render: 0.05,      // Per video format
  thumbnail_render: 0.01,  // Per thumbnail
  ai_tokens_per_1k: 0.002, // Per 1K tokens
  base_job_cost: 0.10      // Base cost per job
};

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Track workspace for finally{} cleanup
  let workspaceId: string | null = null;
  let quotaIncremented = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let serviceClient: any = null;

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Client for user auth validation
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Service client for writes (untyped for Deno compatibility)
    serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Validate user
    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: authError } = await userClient.auth.getClaims(token);
    if (authError || !claims?.claims) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claims.claims.sub;
    const input: CreativeInitRequest = await req.json();
    workspaceId = input.workspace_id;

    console.log('[creative-init] Starting job for workspace:', input.workspace_id);

    // Validate workspace access
    const { data: hasAccess } = await userClient.rpc('has_workspace_access', {
      _user_id: userId,
      _workspace_id: input.workspace_id
    });

    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: 'No access to workspace' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check quotas
    const { data: quota } = await serviceClient.rpc('get_workspace_quota', {
      p_workspace_id: input.workspace_id
    });

    if (quota && quota[0]) {
      const q = quota[0];
      if (q.concurrent_runs >= 3) {
        return new Response(
          JSON.stringify({ error: 'quota_exceeded', message: 'Too many concurrent jobs' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Increment concurrent runs
    await serviceClient.rpc('update_workspace_quota', {
      p_workspace_id: input.workspace_id,
      p_increment_concurrent: true
    });
    quotaIncremented = true;

    // Create job with idempotency key
    const jobInsertData: Record<string, unknown> = {
      workspace_id: input.workspace_id,
      site_id: input.site_id,
      status: 'running',
      objective: input.objective,
      language: input.language,
      geo: input.geo,
      style: input.style || 'minimal_premium',
      duration_seconds: input.duration_seconds || 15,
      input_json: {
        site_url: input.site_url,
        offer: input.offer,
        logo_url: input.logo_url,
        product_images: input.product_images
      },
      audit_manifest: {
        initiated_at: new Date().toISOString(),
        initiated_by: userId,
        inputs_hash: null // Could add hash of inputs for audit
      }
    };
    
    // Add idempotency key if provided
    if (input.idempotency_key) {
      jobInsertData.idempotency_key = input.idempotency_key;
    }
    
    const { data: job, error: jobError } = await serviceClient
      .from('creative_jobs')
      .insert(jobInsertData)
      .select()
      .single();

    if (jobError) {
      console.error('[creative-init] Job creation error:', jobError);
      await serviceClient.rpc('update_workspace_quota', {
        p_workspace_id: input.workspace_id,
        p_decrement_concurrent: true
      });
      throw jobError;
    }

    console.log('[creative-init] Job created:', job.id);

    // Fetch brand kit if available
    let brandKit = null;
    if (input.site_id) {
      const { data: bk } = await serviceClient
        .from('brand_kit')
        .select('*')
        .eq('site_id', input.site_id)
        .single();
      brandKit = bk;
    }

    // Step 1: Generate copywriting
    console.log('[creative-init] Generating copywriting...');
    let copywriting = await generateCopywriting(userClient, input, brandKit);
    console.log('[creative-init] Copywriting generated:', copywriting.hooks.length, 'hooks');
    
    // Step 1.5 (V2): Validate claims and auto-rewrite non-compliant ones
    console.log('[creative-init] Running claim guardrail...');
    const claimResult = await validateAndRewriteClaims(serviceClient, input.workspace_id, copywriting, job.id);
    copywriting = claimResult.copywriting;
    console.log('[creative-init] Claim guardrail:', claimResult.decisions.length, 'claims processed');

    // Step 2: Generate blueprints for all formats with A/B variations
    console.log('[creative-init] Generating blueprints with A/B variations...');
    const blueprints: CreativeBlueprint[] = [];
    const variants = ['A', 'B']; // A/B pack variations using different hooks/CTAs
    
    for (const ratio of ['9:16', '1:1', '16:9'] as const) {
      for (let variantIndex = 0; variantIndex < variants.length; variantIndex++) {
        // Use different hook and CTA for each variant
        const variantCopywriting = {
          ...copywriting,
          // Rotate hooks and CTAs for variation
          hooks: [copywriting.hooks[variantIndex % copywriting.hooks.length], ...copywriting.hooks],
          ctas: [copywriting.ctas[variantIndex % copywriting.ctas.length], ...copywriting.ctas]
        };
        const blueprint = await generateBlueprint(userClient, input, variantCopywriting, ratio);
        // Tag the blueprint with variant info using spread
        const taggedBlueprint = {
          ...blueprint,
          variant: variants[variantIndex],
          variant_index: variantIndex
        } as CreativeBlueprint & { variant: string; variant_index: number };
        blueprints.push(taggedBlueprint);
      }
    }
    console.log('[creative-init] Blueprints generated:', blueprints.length, '(including A/B variants)');

    // Step 3: QCO validation
    console.log('[creative-init] Running QCO validation...');
    const qcoResult = await validateWithQCO(userClient, copywriting, blueprints, input.workspace_id);
    console.log('[creative-init] QCO result:', qcoResult.approved, qcoResult.issues);

    // Store blueprints (all variants)
    for (const blueprint of blueprints) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bpAny = blueprint as any;
      await serviceClient
        .from('creative_blueprints')
        .insert({
          job_id: job.id,
          workspace_id: input.workspace_id,
          version: 1,
          blueprint_json: blueprint,
          qa_report_json: { 
            qco: qcoResult,
            variant: bpAny.variant || 'A'
          },
          is_approved: qcoResult.approved
        });
    }

    // Store copy pack as asset
    await serviceClient
      .from('creative_assets')
      .insert({
        job_id: job.id,
        workspace_id: input.workspace_id,
        asset_type: 'copy_pack',
        meta_json: copywriting
      });

    // Update job with output
    await serviceClient
      .from('creative_jobs')
      .update({
        output_json: {
          copywriting,
          blueprints_count: blueprints.length,
          qco_approved: qcoResult.approved,
          qco_issues: qcoResult.issues
        },
        status: qcoResult.approved ? 'queued' : 'needs_manual_review'
      })
      .eq('id', job.id);

    // Create approval queue item
    const { data: approval } = await serviceClient
      .from('approval_queue')
      .insert({
        workspace_id: input.workspace_id,
        site_id: input.site_id,
        agent_type: 'creative_factory',
        action_type: 'publish_ad_pack',
        risk_level: 'high',
        action_data: {
          job_id: job.id,
          copywriting_preview: {
            hook: copywriting.hooks[0],
            cta: copywriting.ctas[0]
          },
          formats: ['9:16', '1:1', '16:9']
        }
      })
      .select()
      .single();

    // Link approval to job
    if (approval) {
      await serviceClient
        .from('creative_jobs')
        .update({ approval_id: approval.id })
        .eq('id', job.id);
    }

    // Log action
    await serviceClient
      .from('action_log')
      .insert({
        workspace_id: input.workspace_id,
        site_id: input.site_id,
        actor_type: 'agent',
        actor_id: userId,
        action_type: 'creative_init',
        action_category: 'creative',
        description: `Ad pack initialized: ${input.offer}`,
        details: {
          job_id: job.id,
          objective: input.objective,
          formats: 3,
          qco_approved: qcoResult.approved
        },
        is_automated: true
      });

    // Calculate dynamic cost estimate
    const costEstimate = PRICING_CONFIG.base_job_cost +
      (3 * PRICING_CONFIG.video_render) +  // 3 video formats
      (3 * PRICING_CONFIG.thumbnail_render); // 3 thumbnails

    // Update job with cost estimate
    await serviceClient
      .from('creative_jobs')
      .update({ cost_estimate: costEstimate })
      .eq('id', job.id);

    // Decrement concurrent runs - now in finally{} but also here for success path
    quotaIncremented = false;
    await serviceClient.rpc('update_workspace_quota', {
      p_workspace_id: input.workspace_id,
      p_decrement_concurrent: true
    });

    console.log('[creative-init] Job completed successfully:', job.id);

    return new Response(
      JSON.stringify({
        success: true,
        job_id: job.id,
        status: qcoResult.approved ? 'ready_for_render' : 'needs_manual_review',
        approval_id: approval?.id,
        copywriting_preview: {
          hooks: copywriting.hooks,
          ctas: copywriting.ctas
        },
        qco: qcoResult,
        cost_estimate: costEstimate
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[creative-init] Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } finally {
    // CRITICAL: Always decrement concurrent_runs to prevent quota leak
    if (quotaIncremented && workspaceId && serviceClient) {
      try {
        await serviceClient.rpc('update_workspace_quota', {
          p_workspace_id: workspaceId,
          p_decrement_concurrent: true
        });
        console.log('[creative-init] Quota decremented in finally');
      } catch (cleanupError) {
        console.error('[creative-init] Failed to decrement quota:', cleanupError);
      }
    }
  }
});

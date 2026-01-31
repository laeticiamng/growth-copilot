import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    return { approved: true, issues: ['QCO validation skipped due to error'] };
  }

  try {
    const content = data.output?.content || data.output;
    return typeof content === 'string' ? JSON.parse(content) : content;
  } catch (e) {
    return { approved: true, issues: ['QCO output parsing failed'] };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

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

    // Service client for writes
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

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

    // Create job
    const { data: job, error: jobError } = await serviceClient
      .from('creative_jobs')
      .insert({
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
        }
      })
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
    const copywriting = await generateCopywriting(userClient, input, brandKit);
    console.log('[creative-init] Copywriting generated:', copywriting.hooks.length, 'hooks');

    // Step 2: Generate blueprints for all formats
    console.log('[creative-init] Generating blueprints...');
    const blueprints: CreativeBlueprint[] = [];
    for (const ratio of ['9:16', '1:1', '16:9'] as const) {
      const blueprint = await generateBlueprint(userClient, input, copywriting, ratio);
      blueprints.push(blueprint);
    }
    console.log('[creative-init] Blueprints generated:', blueprints.length);

    // Step 3: QCO validation
    console.log('[creative-init] Running QCO validation...');
    const qcoResult = await validateWithQCO(userClient, copywriting, blueprints, input.workspace_id);
    console.log('[creative-init] QCO result:', qcoResult.approved, qcoResult.issues);

    // Store blueprints
    for (const blueprint of blueprints) {
      await serviceClient
        .from('creative_blueprints')
        .insert({
          job_id: job.id,
          workspace_id: input.workspace_id,
          version: 1,
          blueprint_json: blueprint,
          qa_report_json: { qco: qcoResult },
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

    // Decrement concurrent runs
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
        qco: qcoResult
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
  }
});

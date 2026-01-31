import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_QA_ITERATIONS = 2;

interface QARequest {
  job_id: string;
  workspace_id: string;
}

interface QACheckResult {
  passed: boolean;
  issues: QAIssue[];
  score: number;
}

interface QAIssue {
  code: string;
  severity: 'critical' | 'warning' | 'info';
  description: string;
  suggestion?: string;
  affected_format?: string;
}

// Ad Quality Gate checks
function runQualityGate(
  blueprints: Array<Record<string, unknown>>,
  copywriting: Record<string, unknown>
): QACheckResult {
  const issues: QAIssue[] = [];
  let score = 100;

  for (const bp of blueprints) {
    const blueprint = bp.blueprint_json as Record<string, unknown>;
    const aspectRatio = blueprint.aspect_ratio as string;
    const scenes = blueprint.scenes as Array<Record<string, unknown>> || [];

    // Check 1: Safe zones
    const safeZoneLimits = {
      '9:16': { topSafe: 150, bottomSafe: 200 },
      '1:1': { topSafe: 80, bottomSafe: 80 },
      '16:9': { topSafe: 60, bottomSafe: 80 }
    };

    for (const scene of scenes) {
      const textOverlay = scene.text_overlay as Record<string, unknown>;
      if (textOverlay) {
        // Check if safe_zone flag is set
        if (!textOverlay.safe_zone) {
          issues.push({
            code: 'SAFE_ZONE_MISSING',
            severity: 'critical',
            description: `Text overlay in ${aspectRatio} scene ${scene.scene_id} not marked as safe zone compliant`,
            suggestion: 'Adjust text position to respect platform safe zones',
            affected_format: aspectRatio
          });
          score -= 15;
        }

        // Check text length (max 2 lines ~ 60 chars)
        const text = textOverlay.text as string || '';
        if (text.length > 60) {
          issues.push({
            code: 'TEXT_TOO_LONG',
            severity: 'warning',
            description: `Text in ${aspectRatio} exceeds recommended length (${text.length} chars)`,
            suggestion: 'Reduce text to max 60 characters for mobile readability',
            affected_format: aspectRatio
          });
          score -= 10;
        }
      }
    }

    // Check 2: CTA visibility
    const ctaPlacement = blueprint.cta_placement as Record<string, unknown>;
    if (!ctaPlacement || !ctaPlacement.timing) {
      issues.push({
        code: 'CTA_MISSING',
        severity: 'critical',
        description: `No CTA placement defined for ${aspectRatio}`,
        suggestion: 'Add CTA in the last 3 seconds of the video',
        affected_format: aspectRatio
      });
      score -= 20;
    }

    // Check 3: Duration validation
    const duration = blueprint.duration_seconds as number;
    if (duration < 5 || duration > 60) {
      issues.push({
        code: 'INVALID_DURATION',
        severity: 'warning',
        description: `Duration ${duration}s is outside optimal range (5-60s) for ${aspectRatio}`,
        affected_format: aspectRatio
      });
      score -= 5;
    }

    // Check 4: Subtitle coverage
    const subtitles = blueprint.subtitles as Array<Record<string, unknown>> || [];
    if (subtitles.length === 0) {
      issues.push({
        code: 'NO_SUBTITLES',
        severity: 'warning',
        description: `No subtitles defined for ${aspectRatio} - accessibility concern`,
        suggestion: 'Add subtitles for better engagement and accessibility',
        affected_format: aspectRatio
      });
      score -= 5;
    } else {
      // Check subtitle timing coverage
      let coveredDuration = 0;
      for (const sub of subtitles) {
        coveredDuration += ((sub.end as number) - (sub.start as number));
      }
      const coverage = coveredDuration / duration;
      if (coverage < 0.5) {
        issues.push({
          code: 'LOW_SUBTITLE_COVERAGE',
          severity: 'info',
          description: `Subtitles only cover ${Math.round(coverage * 100)}% of ${aspectRatio} video`,
          affected_format: aspectRatio
        });
        score -= 3;
      }
    }

    // Check 5: Scene transitions (9:16 specific)
    if (aspectRatio === '9:16') {
      for (let i = 0; i < scenes.length - 1; i++) {
        const currentEnd = scenes[i].end_time as number;
        const nextStart = scenes[i + 1].start_time as number;
        if (nextStart - currentEnd > 0.5) {
          issues.push({
            code: 'SCENE_GAP',
            severity: 'info',
            description: `Gap detected between scenes ${i + 1} and ${i + 2} in 9:16 format`,
            suggestion: 'Consider adding transition or reducing gap',
            affected_format: '9:16'
          });
          score -= 2;
        }
      }
    }
  }

  // Check copywriting
  const hooks = copywriting.hooks as string[] || [];
  const ctas = copywriting.ctas as string[] || [];

  // Check hook length
  for (const hook of hooks) {
    if (hook.split(' ').length > 10) {
      issues.push({
        code: 'HOOK_TOO_LONG',
        severity: 'warning',
        description: `Hook "${hook.substring(0, 30)}..." exceeds 10 words`,
        suggestion: 'Keep hooks under 8-10 words for impact'
      });
      score -= 5;
    }
  }

  // Check CTA actionability
  const actionVerbs = ['découvrez', 'obtenez', 'essayez', 'commencez', 'réservez', 'téléchargez', 'inscrivez', 'profitez'];
  for (const cta of ctas) {
    const hasAction = actionVerbs.some(v => cta.toLowerCase().includes(v));
    if (!hasAction) {
      issues.push({
        code: 'WEAK_CTA',
        severity: 'info',
        description: `CTA "${cta}" may lack action verb`,
        suggestion: 'Use strong action verbs: Découvrez, Obtenez, Essayez...'
      });
      score -= 2;
    }
  }

  // Filter critical issues
  const criticalIssues = issues.filter(i => i.severity === 'critical');
  const passed = criticalIssues.length === 0 && score >= 70;

  return {
    passed,
    issues,
    score: Math.max(0, score)
  };
}

// Generate corrected blueprint using AI
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function correctBlueprint(
  supabase: any,
  blueprint: Record<string, unknown>,
  issues: QAIssue[],
  workspaceId: string
): Promise<Record<string, unknown>> {
  const issueDescriptions = issues
    .filter(i => i.affected_format === blueprint.aspect_ratio || !i.affected_format)
    .map(i => `- ${i.code}: ${i.description}${i.suggestion ? ` (${i.suggestion})` : ''}`)
    .join('\n');

  const systemPrompt = `Tu es un expert en correction de blueprints vidéo publicitaires.
Corrige le blueprint fourni en résolvant les problèmes identifiés.
Conserve la structure JSON exacte, modifie uniquement les valeurs nécessaires.`;

  const userPrompt = `Corrige ce blueprint:

PROBLÈMES À RÉSOUDRE:
${issueDescriptions}

BLUEPRINT ACTUEL:
${JSON.stringify(blueprint, null, 2)}

Réponds UNIQUEMENT avec le blueprint JSON corrigé, même structure.`;

  const { data, error } = await supabase.functions.invoke('ai-gateway', {
    body: {
      agent_name: 'creative_blueprint_agent',
      purpose: 'blueprint_correction',
      workspace_id: workspaceId,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' }
    }
  });

  if (error) {
    console.error('[creative-qa] Blueprint correction error:', error);
    return blueprint; // Return original if correction fails
  }

  try {
    const content = data.output?.content || data.output;
    return typeof content === 'string' ? JSON.parse(content) : content;
  } catch (e) {
    console.error('[creative-qa] Failed to parse corrected blueprint:', e);
    return blueprint;
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

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    const { job_id, workspace_id }: QARequest = await req.json();

    console.log('[creative-qa] Running QA for job:', job_id);

    // Fetch job
    const { data: job, error: jobError } = await serviceClient
      .from('creative_jobs')
      .select('*')
      .eq('id', job_id)
      .eq('workspace_id', workspace_id)
      .single();

    if (jobError || !job) {
      return new Response(
        JSON.stringify({ error: 'Job not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check iteration limit
    const currentIterations = job.qa_iterations || 0;
    if (currentIterations >= MAX_QA_ITERATIONS) {
      console.log('[creative-qa] Max iterations reached, marking for manual review');
      
      await serviceClient
        .from('creative_jobs')
        .update({
          status: 'needs_manual_review',
          error_message: `QA failed after ${MAX_QA_ITERATIONS} correction attempts. Manual review required.`
        })
        .eq('id', job_id);

      return new Response(
        JSON.stringify({
          success: false,
          status: 'needs_manual_review',
          message: 'Max QA iterations reached',
          iterations: currentIterations
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch blueprints
    const { data: blueprints } = await serviceClient
      .from('creative_blueprints')
      .select('*')
      .eq('job_id', job_id)
      .order('version', { ascending: false });

    if (!blueprints || blueprints.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No blueprints found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get latest version for each aspect ratio
    const latestBlueprints = new Map<string, Record<string, unknown>>();
    for (const bp of blueprints) {
      const ratio = (bp.blueprint_json as Record<string, unknown>).aspect_ratio as string;
      if (!latestBlueprints.has(ratio)) {
        latestBlueprints.set(ratio, bp);
      }
    }

    // Fetch copywriting
    const { data: copyAsset } = await serviceClient
      .from('creative_assets')
      .select('meta_json')
      .eq('job_id', job_id)
      .eq('asset_type', 'copy_pack')
      .single();

    const copywriting = copyAsset?.meta_json || {};

    // Run QA checks
    console.log('[creative-qa] Running quality gate checks...');
    const qaResult = runQualityGate(Array.from(latestBlueprints.values()), copywriting);

    console.log('[creative-qa] QA Result:', {
      passed: qaResult.passed,
      score: qaResult.score,
      issues: qaResult.issues.length
    });

    if (qaResult.passed) {
      // QA passed, update job status
      await serviceClient
        .from('creative_jobs')
        .update({
          status: 'queued', // Ready for rendering
          output_json: {
            ...(job.output_json as Record<string, unknown> || {}),
            qa_passed: true,
            qa_score: qaResult.score,
            qa_iterations: currentIterations
          }
        })
        .eq('id', job_id);

      // Update blueprints with QA report
      for (const [, bp] of latestBlueprints) {
        await serviceClient
          .from('creative_blueprints')
          .update({
            qa_report_json: qaResult,
            is_approved: true
          })
          .eq('id', (bp as Record<string, unknown>).id);
      }

      console.log('[creative-qa] QA passed, ready for render');

      return new Response(
        JSON.stringify({
          success: true,
          passed: true,
          score: qaResult.score,
          issues: qaResult.issues,
          iterations: currentIterations
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // QA failed, attempt correction
    console.log('[creative-qa] QA failed, attempting correction...');

    const correctedBlueprints: Array<Record<string, unknown>> = [];

    for (const [ratio, bp] of latestBlueprints) {
      const currentBlueprint = (bp as Record<string, unknown>).blueprint_json as Record<string, unknown>;
      const relevantIssues = qaResult.issues.filter(
        i => i.affected_format === ratio || !i.affected_format
      );

      if (relevantIssues.length > 0) {
        const corrected = await correctBlueprint(
          userClient,
          currentBlueprint,
          relevantIssues,
          workspace_id
        );
        correctedBlueprints.push({
          ...bp,
          blueprint_json: corrected,
          version: ((bp as Record<string, unknown>).version as number) + 1
        });
      } else {
        correctedBlueprints.push(bp as Record<string, unknown>);
      }
    }

    // Store corrected blueprints
    const newVersion = currentIterations + 2; // version starts at 1
    for (const bp of correctedBlueprints) {
      await serviceClient
        .from('creative_blueprints')
        .insert({
          job_id,
          workspace_id,
          version: newVersion,
          blueprint_json: bp.blueprint_json,
          qa_report_json: qaResult,
          is_approved: false
        });
    }

    // Update job iteration count
    await serviceClient
      .from('creative_jobs')
      .update({
        qa_iterations: currentIterations + 1,
        output_json: {
          ...(job.output_json as Record<string, unknown> || {}),
          qa_passed: false,
          qa_score: qaResult.score,
          qa_issues: qaResult.issues
        }
      })
      .eq('id', job_id);

    // Log action
    await serviceClient
      .from('action_log')
      .insert({
        workspace_id,
        site_id: job.site_id,
        actor_type: 'agent',
        action_type: 'creative_qa',
        action_category: 'creative',
        description: `QA iteration ${currentIterations + 1}: ${qaResult.issues.length} issues found, score ${qaResult.score}`,
        details: {
          job_id,
          passed: false,
          score: qaResult.score,
          issues: qaResult.issues.map(i => i.code),
          iteration: currentIterations + 1
        },
        is_automated: true
      });

    console.log('[creative-qa] Correction applied, iteration', currentIterations + 1);

    return new Response(
      JSON.stringify({
        success: true,
        passed: false,
        score: qaResult.score,
        issues: qaResult.issues,
        iterations: currentIterations + 1,
        corrected: true,
        next_action: currentIterations + 1 < MAX_QA_ITERATIONS ? 're-run QA' : 'manual review required'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[creative-qa] Error:', error);
    const message = error instanceof Error ? error.message : 'QA check failed';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

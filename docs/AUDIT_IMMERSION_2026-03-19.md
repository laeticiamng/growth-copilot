# Audit immersion 2026 — Growth OS

> Date : 2026-03-19  
> Positionnement demandé : principal product engineer + creative technologist + experience director  
> Objectif : faire évoluer Growth OS d'une logique majoritairement 2D/gamification 2025 vers une expérience 2026 plus premium, immersive, émotionnelle et vivante, sans jamais dégrader la clarté métier, la vitesse, la conversion ni l'accessibilité.

---

## 1. Résumé exécutif

Growth OS possède déjà une base produit solide, modulaire et très exploitable pour une montée en gamme expérientielle.

### Ce qui est fort aujourd'hui
- L'architecture métier est riche, réelle, et non “fausse démo” : workspaces, services, rôles, audit log, approvals, runs, KPI, onboarding, facturation, Launch OS, agents, intégrations, pages départementales.
- La plateforme est clairement structurée autour d'un shell dashboard, d'un catalogue de pages, d'un ensemble conséquent de hooks métier et d'une couche Supabase/Edge Functions déjà industrialisée.
- Le design system possède déjà des tokens premium “dark glass / gradient / glow”, donc il existe une base visuelle exploitable pour aller vers une immersion mesurée plutôt que repartir de zéro.
- Les flows critiques restent lisibles et très productifs : cockpit, setup, intégrations, billing, audit/compliance, reports.

### Ce qui limite la perception “2026 premium immersive”
- L'expérience reste principalement assemblée en **cartes + badges + progress bars + KPIs + listes d'actions**. C'est propre, mais encore très “SaaS 2025”.
- L'immersion actuelle est surtout cosmétique : gradients, pulses, glows, quelques animations, emojis et halo backgrounds. Il n'existe pas encore de véritable **moteur d'expérience** séparé du métier.
- Les pages sont nombreuses mais le langage d'interaction est assez homogène et plat : même structure header → cards → stats → CTA sur des contextes pourtant émotionnellement très différents.
- Les moments à fort potentiel narratif (onboarding, premiers runs, Launch OS, chat agent, research, décisions) ne sont pas encore traités comme des **moments de présence**.

### Recommandation tranchée
Ne pas faire une “refonte 3D”.  
Il faut construire un **Experience Runtime** progressif au-dessus du produit existant, avec 3 niveaux :
1. **2D premium utilitaire** pour tous les parcours critiques.
2. **Ambient immersion** transverse partout : profondeur, lumière, micro-parallaxe, réactions d'état, sound cues optionnels, motion sémantique.
3. **Situational immersion** sur les moments à forte valeur émotionnelle : onboarding, launch, décision, découverte, activation agent, résultats.

La meilleure zone pour une **signature scene 2026** n'est pas le billing ni l'audit ; c'est **Launch OS** puis, en second, le **premier setup / first value moment**.

---

## 2. Diagnostic de la plateforme actuelle

## 2.1 Lecture structurelle

### Architecture observée
- Frontend React 18 + TypeScript + Vite + Tailwind + shadcn/ui + TanStack Query + React Router + i18next.
- Backend Supabase/Lovable : base de données métier, RLS, Edge Functions, orchestration IA, Stripe, OAuth, monitoring.
- Application dense : shell dashboard, pages publiques, pages dashboard, providers métiers, hooks spécialisés, modules agents, Launch OS, reporting, gouvernance.

### Signal produit important
Growth OS n'est pas un simple “marketing site + dashboard”. C'est un **workspace opératoire multi-domaines** avec une vraie profondeur métier. Cela justifie une architecture d'expérience séparée du domaine : le produit est assez riche pour supporter une scénographie sans tomber dans l'effet gadget.

---

## 2.2 Forces produit/UX actuelles

### A. Base métier robuste
- Workspace + RBAC + service gating + audit + approvals + evidence bundles = socle sérieux.
- Les pages critiques sont déjà pensées pour l'exploitation quotidienne.
- L'usage de hooks spécialisés matérialise bien les domaines métier.

### B. Ébauche d'identité premium déjà en place
- Dark UI, glass, gradients, glow, variants de cards, badges, pulses, skeletons, status dots.
- Le hero landing et certains dashboards cherchent déjà une sensation plus “premium software”.

### C. Accessibilité et clarté encore prioritaires
- Skip links sur les pages clés.
- Lazy-loading des routes lourdes.
- Séparation public / protected / service-gated.
- Composants UI réutilisables et cohérents.

---

## 2.3 Faiblesses expérientielles actuelles

### A. Langage d'interface trop uniforme
Même des moments très différents utilisent le même vocabulaire visuel :
- header + sous-titre
- bandes de KPI
- cartes quadrillées
- badges de statut
- progress bars
- CTA standard

Résultat :
- bonne lisibilité,
- mais faible sensation de progression vécue,
- faible dramatisation des moments importants,
- faible mémoire émotionnelle.

### B. Gamification encore très “affichée”
On observe plusieurs patterns 2025 classiques :
- score numérique,
- badges,
- barres de progression,
- statuts codés couleur,
- cartes d'étapes,
- quick launchers.

Tout cela fonctionne, mais reste davantage **déclaratif** qu'**expérientiel**.

### C. Pas de couche renderer/experience autonome
Le rendu expérientiel est actuellement dissous dans les pages et composants. Il manque :
- un orchestrateur de scène,
- des états d'ambiance transverses,
- un système de surfaces/lights/depth,
- un moteur de transitions contextuelles,
- une couche d'événements sensoriels facultatifs.

### D. Le premium est encore “digital froid”
L'ambiance est plus techno-neon que “premium cocooning”.  
Le design actuel évoque la performance et le contrôle, mais moins :
- la chaleur,
- l'enveloppement,
- la respiration,
- la matérialité douce,
- la sérénité haut de gamme.

---

## 2.4 Diagnostic par zones fonctionnelles

### Landing / marketing public
**État actuel**
- Forte densité de sections marketing.
- Hero avec halos, gradients et CTA URL-driven.
- Rassurance, comparaison, pricing, FAQ, témoignages.

**Lecture**
- Solide pour la conversion.
- Encore très sectionnée / scroll SaaS classique.
- L'émotion premium pourrait monter sans nuire à la lisibilité via une mise en scène plus cinématographique du hero et des transitions de sections.

**Verdict**
- Garder une base 2D premium.
- Ajouter seulement une immersion légère à modérée sur hero, preview et preuve produit.

### Cockpit exécutif
**État actuel**
- Très fonctionnel : semaphores, actions prioritaires, quick launchers, approvals, health score, historique.
- C'est le centre d'exploitation quotidien.

**Lecture**
- Doit rester extrêmement performant et lisible.
- Aujourd'hui la logique est puissante mais visuellement “dashboard tile based”.
- L'immersion doit ici rester ambiante, pas spectaculaire.

**Verdict**
- Excellent candidat pour une **ambient immersion** transverse, pas pour une scène 3D forte.

### Onboarding public + setup wizard
**État actuel**
- Parcours à étapes, cartes, progress bar, services, objectifs, paiement, résumé.
- Setup wizard dashboard en 3 étapes simples.

**Lecture**
- C'est le meilleur endroit pour transformer la progression “affichée” en progression “ressentie”.
- Aujourd'hui le produit explique la montée en valeur ; demain il doit la faire ressentir.

**Verdict**
- Candidat majeur pour **immersion modérée à forte**, avec scènes de révélation très ciblées.

### Launch OS
**État actuel**
- C'est la zone la plus proche d'une logique expérientielle : readiness, décisions, mémoire de campagne, projets, états, cards de projet.
- Le domaine porte déjà une dramaturgie naturelle : préparer, valider, lancer, monitorer.

**Lecture**
- C'est le meilleur terrain pour une signature scene.
- Le produit y possède déjà un récit latent : tension → readiness → launch → post-launch.

**Verdict**
- Zone idéale pour la **signature immersive scene n°1**.

### Intégrations / billing / audit / access review / status / logs
**État actuel**
- Pages de configuration et de gouvernance très orientées utilité.

**Lecture**
- Ici, la 3D ou la mise en scène forte serait contre-productive.
- On peut apporter du premium via matière, lumière, états de connexion, transitions et feedbacks subtils.

**Verdict**
- Rester surtout en **2D premium** avec micro-immersion.

### Agents / research / agent chat
**État actuel**
- Fort potentiel de présence mais rendu encore classique.
- Les agents sont listés comme entités, le chat reste un chat UI standard.

**Lecture**
- Très bon terrain pour créer une sensation de présence non gadget : respiration de l'agent, attention, écoute, état cognitif, sourcing, confidence.

**Verdict**
- Immersion modérée, orientée présence et intelligence, pas scène décorative.

---

## 3. Grille d'immersion par page / flow

## Échelle
- **0 = utilitaire pur** : rester 2D premium.
- **1 = micro-immersion** : profondeur, motion léger, feedback vivant, matière, lumières.
- **2 = immersion modérée** : mise en scène contextuelle, transitions spatialisées légères, environnement sensible.
- **3 = scène immersive forte / expérience signature**.

| Zone | Niveau | Décision | Pourquoi |
|---|---:|---|---|
| Landing shell global | 1 | 2D premium + ambience | Conversion prioritaire, garder clarté et vitesse. |
| Hero landing | 2 | Mise en scène immersive légère | Moment d'entrée émotionnel et de désir. |
| Product preview / demo teaser | 2 | Révélation spatialisée | Permet de vendre la valeur perçue sans bruit. |
| Pricing / FAQ / legal public | 0 | Rester sobre | Pages rationnelles, friction à minimiser. |
| Auth | 0 | 2D premium | Rapidité et confiance. |
| Onboarding public | 2 | Progression vécue | Fait monter l'engagement et la conversion. |
| Setup wizard dashboard | 2 | Rituel d'activation | Excellent first-value moment. |
| Cockpit exécutif | 1 | Ambient immersion | Usage quotidien, lisibilité critique. |
| Quick launchers / first run | 2 | Activation contextualisée | Peut transformer un clic en “déclenchement”. |
| Runs history / reports | 1 | Feedback vivant | Donner de la matérialité aux résultats. |
| Agents directory | 1 | Présence légère | Humaniser sans théâtraliser. |
| Agent chat | 2 | Présence conversationnelle | Doit sembler habité, attentif, fiable. |
| Research / intelligence | 2 | Exploration guidée | Domaine propice à découverte, pistes, tensions. |
| Launch OS home | 2 | Immersion orchestrée | Base idéale pour pilotage narratif. |
| Launch type selector | 3 | Signature scene | Moment de projection et d'intention. |
| Launch project / readiness / decisions | 3 | Signature scene | Tension, arbitrage, révélation, validation. |
| SEO / Content / Ads / CRO / Social | 1 | Ambient immersion | Pages de travail intensif, rester efficaces. |
| HR / Legal / Services catalog | 0-1 | Sobre + premium | Domaine administratif et fonctionnel. |
| Integrations | 1 | États connectifs vivants | Le vivant doit refléter le système, pas distraire. |
| Billing | 0 | Utilitaire premium | Confiance, lisibilité, vitesse. |
| Audit log / access review / diagnostics / ops | 0 | Utilitaire pur | Précision et contrôle avant tout. |
| Mobile shell global | 0-1 | Immersion très contenue | Budget perf et clarté prioritaires. |

### Signature scenes recommandées
1. **Launch OS — Launch Type / Readiness / Decision Center**.
2. **Onboarding / Setup — First activation scene**.
3. Optionnel plus tard : **Agent Presence layer** sur chat/research.

---

## 4. Architecture cible

## 4.1 Principe directeur
Conserver le domaine métier et séparer totalement la mise en scène.

### Cible logique
1. **Domain Layer**
   - données métier, règles, services, permissions, workflows,
   - hooks métier existants,
   - clients Supabase/Edge Functions,
   - analytics métier.

2. **Experience State Layer**
   - état transverse de contexte : focus, intent, urgency, completion, confidence, scene mode,
   - préférences utilisateur : reduced motion, audio on/off, power mode,
   - capabilities device : WebGPU/WebGL/CSS-only.

3. **Renderer / Experience Layer**
   - ambient renderer global,
   - scene renderer local,
   - tokens de profondeur, lumière, surfaces, motion,
   - transitions et comportements atmosphériques.

4. **Interaction Engine**
   - feedback environnemental,
   - états d'objets,
   - événements contextuels,
   - scènes/transitions,
   - règles de narration légère.

5. **Instrumentation Layer**
   - analytics UX,
   - performance metrics,
   - flags d'expérience,
   - A/B tests immersion vs baseline.

---

## 4.2 Proposition technique concrète

### Dossiers cibles
```txt
src/
  domain/
    workspace/
    launch/
    agents/
    billing/
    governance/
  experience/
    runtime/
      ExperienceProvider.tsx
      experience-store.ts
      capability-detection.ts
      reduced-motion.ts
    ambient/
      AmbientCanvas.tsx
      AmbientLayer.tsx
      AmbientPresets.ts
      depth-tokens.ts
      light-presets.ts
    scenes/
      launch-os/
      onboarding/
      agent-presence/
    interaction/
      event-bus.ts
      scene-controller.ts
      feedback-engine.ts
      sound-engine.ts
    motion/
      transitions.ts
      timelines.ts
      spring-presets.ts
    accessibility/
      immersive-fallback.ts
      announcements.ts
  ui/
    surfaces/
    overlays/
    status/
```

### Runtime recommandé
- **React + TypeScript** conservé.
- **Framer Motion** ou Motion One pour les transitions fines 2D/2.5D.
- **React Three Fiber** uniquement pour 1 à 2 scènes signature très cadrées.
- **Drei** pour utilitaires de scène.
- **WebGL canvas optionnel**, jamais bloquant.
- **Fallback CSS-only** sur devices modestes ou reduced-motion.
- **WebGPU non requis** au lancement ; prévoir capability detection mais baser le MVP sur CSS + Canvas/WebGL.

### Règle d'implémentation
Le domaine ne connaît jamais le renderer immersif.  
Les pages métier publient des **intentions d'expérience** :
- `scene = launch_readiness`
- `mood = focused_confident`
- `intensity = low | medium | high`
- `feedback = success_reveal`

Le renderer traduit ces intentions selon les capacités device et les préférences utilisateur.

---

## 4.3 État commun recommandé

### Experience store minimal
```ts
interface ExperienceState {
  mode: 'flat' | 'ambient' | 'immersive';
  intensity: 0 | 1 | 2 | 3;
  sceneId?: string;
  mood: 'calm' | 'focused' | 'anticipation' | 'resolution' | 'alert';
  soundEnabled: boolean;
  reducedMotion: boolean;
  powerSaver: boolean;
  capabilities: {
    webgl: boolean;
    webgpu: boolean;
    lowEndDevice: boolean;
  };
}
```

### Events métier → expérience
- `workspace.connected`
- `site.created`
- `integration.authorized`
- `agent.run.started`
- `agent.run.completed`
- `approval.pending`
- `approval.resolved`
- `launch.readiness.changed`
- `decision.required`
- `report.generated`

Chaque event peut déclencher :
- changement de lumière,
- vibration visuelle légère,
- expansion de surface,
- apparition d'un repère,
- transition de couche,
- cue audio discret si activé.

---

## 5. Système de design expérientiel 2026

## 5.1 Doctrine générale

### Ce que doit ressentir l'utilisateur
- calme compétent,
- profondeur maîtrisée,
- intelligence en veille,
- chaleur premium,
- progression fluide,
- densité sans lourdeur.

### Signature “premium cocooning”
- noirs profonds adoucis, pas noirs agressifs,
- surfaces chaudes, mates, légèrement diffuses,
- reflets contrôlés, jamais “gaming RGB”,
- halos feutrés,
- cinétique lente et précise,
- transitions en continuité plutôt qu'en coupure,
- accent lumineux réservé aux moments importants.

---

## 5.2 Règles 2D / profondeur / 3D

### Quand rester en 2D pure
- billing,
- audit,
- access review,
- settings,
- logs,
- tableaux analytiques denses,
- formulaires à haute friction cognitive.

### Quand utiliser profondeur sans vraie 3D
- cockpit,
- landing hero,
- integrations,
- reports,
- catalogues d'agents,
- écrans de découverte.

**Techniques**
- multi-layer backgrounds,
- parallax légère,
- shadow depth states,
- surface elevation dynamique,
- focus cones,
- lighting shifts sur hover/focus/selection.

### Quand utiliser une vraie scène 3D / spatialisée
Seulement si elle :
- aide à comprendre une progression,
- incarne un état métier,
- sert un moment d'engagement fort,
- reste facultative,
- possède une équivalence fonctionnelle 2D.

**Donc :** Launch OS oui ; billing non.

---

## 5.3 Traduction 2D → immersive

| Logique 2025 | Traduction 2026 |
|---|---|
| Étape UI | Zone, chambre, station, couche d'activation |
| Badge | Révélation visuelle, sceau allumé, état activé |
| Pop-up | Panneau contextuel ancré dans l'espace UI |
| Progress bar | Environnement qui s'ouvre, se clarifie, se stabilise |
| Score | Niveau d'énergie, de netteté, de disponibilité, d'accès |
| KPI card | Instrument de lecture vivant avec matière et inertie subtile |
| Quiz linéaire | Exploration guidée avec choix contextualisés |
| Success toast | Réponse lumineuse + ancrage local + confirmation texte |
| Pending status | Tension douce, pulsation ou zone en suspens |
| Approval queue | Portes en attente / éléments gelés à débloquer |

---

## 5.4 Motion design rules

### Motion autorisé
- 120–240 ms pour micro-réactions UI,
- 280–420 ms pour transitions de contexte,
- 600–1200 ms pour reveals de scène,
- easing douces, jamais “snappy gaming” partout,
- motion asymétrique : entrée plus douce, sortie plus rapide.

### Motion interdit
- loops visibles permanentes sur tout l'écran,
- parallax forte qui gêne la lecture,
- mouvements décoratifs sans signal métier,
- accélérations théâtrales sur pages utilitaires,
- effets différents selon chaque module sans doctrine commune.

---

## 5.5 Light design rules

- Lumière de base : diffuse, feutrée, latérale ou arrière.
- Accent light : réservée à l'action, à la validation, à la découverte.
- Alert light : plus froide ou plus contrastée, jamais criarde.
- Les changements de statut doivent être perçus d'abord par structure/texte/couleur accessible, puis enrichis par lumière.

---

## 5.6 Son et ambiance

### Oui, mais optionnel
- soft click spatial,
- validation douce,
- ouverture/reveal légère,
- ambiance très discrète sur scènes signature.

### Jamais obligatoire
- audio par défaut intrusif,
- dépendance du son pour comprendre une action,
- boucle sonore continue en usage productif.

---

## 6. Composants et modules à créer / refactorer

## 6.1 Modules transverses à créer

### P0
- `ExperienceProvider`
- `useExperience()`
- `CapabilityDetector`
- `ReducedMotionGuard`
- `AmbientLayer`
- `SceneSlot`
- `ExperienceEventBridge`
- `FeedbackPulse`
- `DepthSurface`
- `LightHalo`
- `ContextTransition`

### P1
- `PresenceBadge` (agents, runs, integrations)
- `EnvironmentalProgress`
- `ImmersiveStepFlow`
- `DecisionSpotlight`
- `ResultRevealPanel`
- `SoundToggle` + `sound-engine`

### P2
- `LaunchOSSignatureScene`
- `OnboardingActivationScene`
- `AgentPresenceLayer`
- `AmbientAudioBus`

---

## 6.2 Composants existants à refactorer en priorité

### Cockpit
- `WelcomeCard`
- `ExecutiveSummary`
- `QuickLaunchers`
- `BusinessHealthScore`
- `DepartmentSemaphores`
- `RunsHistory`

### Onboarding / Setup
- page `/onboarding`
- page `/dashboard/setup`
- page `/dashboard/guide`

### Launch OS
- `LaunchOSHome`
- `LaunchTypeSelector`
- `LaunchProject`
- `DecisionCenter`

### Agents / research
- page `/dashboard/agents`
- page `/dashboard/agent/:slug`
- `SmartResearchHub`

---

## 7. Plan de migration incrémental

## Phase 0 — Baseline / garde-fous
- Mesurer LCP, INP, CLS, TTI sur landing, dashboard home, onboarding, Launch OS.
- Définir budgets perf mobile/desktop.
- Introduire feature flags d'expérience.
- Introduire capability detection.
- Créer fallback reduced motion / low power.

## Phase 1 — Ambient immersion globale
- Refondre les tokens visuels vers une palette plus cocooning.
- Ajouter `AmbientLayer` global non bloquant.
- Uniformiser les surfaces : profondeur, halos, réactions au focus, transitions de route plus douces.
- Remplacer certains badges / progress par retours d'état plus sensibles.

## Phase 2 — First value moments
- Refaire onboarding public.
- Refaire setup wizard.
- Transformer le premier run en séquence d'activation contextualisée.

## Phase 3 — Signature scene Launch OS
- Créer une scène de sélection de type de lancement.
- Créer une scène readiness/decision avec spatialisation légère.
- Garder une vue 2D fonctionnelle équivalente et instantanément accessible.

## Phase 4 — Presence layer agents
- Humaniser la perception des agents et de la recherche.
- Ajouter état cognitif, sourcing, confidence, attention focus.

## Phase 5 — Optimisation / industrialisation
- A/B tests sur conversion et activation.
- Ajustement intensité par device.
- Documentation interne “Immersion Doctrine”.

---

## 8. Tickets priorisés avec critères d'acceptation

## P0 — Fondations

### Ticket P0.1 — Introduire l'Experience Runtime
**Objectif** : séparer domaine et expérience.

**À faire**
- Créer `src/experience/runtime`.
- Ajouter provider global.
- Exposer store d'état d'expérience.
- Brancher route changes + events métier.

**Critères d'acceptation**
- Aucun hook métier existant n'importe le renderer immersif.
- Le dashboard fonctionne à l'identique avec `mode=flat`.
- Les préférences reduced-motion et low-power neutralisent les effets non essentiels.

### Ticket P0.2 — Capability detection + fallback
**À faire**
- Détecter WebGL/WebGPU/reduced-motion/low-end heuristics.
- Choisir automatiquement `flat`, `ambient` ou `immersive-lite`.

**Critères d'acceptation**
- Aucun écran critique ne dépend d'une capacité graphique avancée.
- Sur device modeste, l'UI reste complète et lisible.

### Ticket P0.3 — Ambient layer global
**À faire**
- Ajouter background layers, halos, depth gradients, parallax mineure.
- Route transitions cohérentes.

**Critères d'acceptation**
- Pas de baisse mesurable significative sur les parcours critiques.
- L'effet peut être désactivé par flag global.

---

## P1 — Expérience différenciante immédiate

### Ticket P1.1 — Refaire le hero en “premium cocooning”
**Critères d'acceptation**
- Le hero gagne en chaleur et profondeur sans perdre le CTA principal.
- L'input URL reste prioritaire visuellement.
- Pas d'augmentation sensible du temps d'interaction.

### Ticket P1.2 — Transformer l'onboarding en progression vécue
**Critères d'acceptation**
- Chaque étape modifie l'ambiance / profondeur / clarté de l'espace.
- Une version reduced-motion conserve exactement la même compréhension.
- Le taux de complétion n'est pas dégradé.

### Ticket P1.3 — Refaire Setup Wizard comme rituel d'activation
**Critères d'acceptation**
- Site, intégration et premier run produisent des feedbacks environnementaux distincts.
- Les CTA restent immédiatement identifiables.
- La séquence complète reste faisable au clavier.

### Ticket P1.4 — Cockpit ambient upgrade
**Critères d'acceptation**
- Le cockpit gagne en profondeur et hiérarchie vivante.
- Les quick launchers et états critiques ont des feedbacks sémantiques.
- Aucun widget n'est plus lent à charger qu'avant de manière sensible.

---

## P2 — Signature immersive

### Ticket P2.1 — Launch OS signature scene
**Critères d'acceptation**
- Le launch type selector existe en version immersive + fallback 2D.
- La scène exprime readiness, tension et résolution.
- L'utilisateur peut désactiver ou bypasser la scène.

### Ticket P2.2 — Decision Center immersif
**Critères d'acceptation**
- Les décisions ont une mise en tension claire puis une résolution lisible.
- Les conséquences d'un choix deviennent visibles sans ambiguïté.
- Toutes les décisions restent possibles au clavier et sans motion.

### Ticket P2.3 — Agent presence layer
**Critères d'acceptation**
- Le chat donne une sensation de présence sans anthropomorphisme excessif.
- Les sources, confiance et statut restent plus lisibles qu'avant.

---

## 9. Garde-fous performance, accessibilité et compatibilité

## Performance
- Budget JS additionnel initial : strictement plafonné sur shell global.
- Canvas/3D uniquement lazy-loaded dans les scènes de niveau 2-3.
- Sur mobile : 30–45 fps acceptable pour scènes ponctuelles, jamais au détriment de l'input latency.
- Désactivation automatique des couches immersives sur batterie faible / low-end si nécessaire.

## Accessibilité
- `prefers-reduced-motion` respecté partout.
- Pas d'information transmise uniquement par animation, profondeur ou audio.
- Contraste et focus states restent prioritaires sur l'ambiance.
- Navigation clavier complète, y compris en mode immersif.
- Les scènes doivent toujours avoir une version DOM lisible et sémantique.

## Compatibilité
- Baseline : CSS + DOM + SVG.
- Enhancement : Motion.
- Enhancement avancé : Canvas/WebGL.
- WebGPU : pure opportunité future, pas prérequis.

---

## 10. Risques, compromis, fallback

## Risques
- tomber dans une surcharge sensorielle incompatible avec la densité métier,
- multiplier les patterns d'expérience sans doctrine commune,
- créer une dette technique si l'expérience est codée page par page,
- casser la performance mobile,
- brouiller les priorités d'action par excès de mise en scène.

## Compromis recommandés
- Mieux vaut **2 scènes signature excellentes** que 20 écrans pseudo-immersifs.
- Mieux vaut **profondeur crédible** que “fausse 3D” partout.
- Mieux vaut **audio optionnel très discret** qu'habillage sonore constant.
- Mieux vaut **transitions contextuelles** que composants spectaculaires isolés.

## Fallback obligatoire
Chaque expérience de niveau 2 ou 3 doit avoir :
- une version flat premium,
- une version reduced motion,
- une version low-end mobile,
- la même compréhension métier et la même capacité d'action.

---

## 11. Recommandation finale tranchée

### Ma recommandation nette
Oui, la plateforme doit évoluer vers une expérience 2026 plus immersive.  
Mais **non**, elle ne doit surtout pas devenir un produit “3D-first”.

### Le bon cap
- **Conserver 80 à 85 % du produit en 2D premium haute qualité**.
- **Déployer 100 % du produit avec une ambient immersion discrète**.
- **Concentrer la vraie immersion forte sur 2 moments signatures maximum**.

### Priorité absolue
1. Créer la **couche d'expérience séparée**.
2. Refondre **onboarding + setup** en progression vécue.
3. Faire de **Launch OS** la grande signature émotionnelle du produit.

### Pourquoi c'est la meilleure stratégie
Parce qu'elle :
- respecte le sérieux métier de Growth OS,
- améliore la désirabilité premium,
- crée une différence 2026 tangible,
- protège les performances,
- protège l'accessibilité,
- évite la 3D gadget,
- rend l'expérience mémorable sans sacrifier l'utilité.

**Conclusion** : la plateforme a déjà le fond pour devenir remarquable. Le chantier n'est pas une refonte d'interface ; c'est la création d'un **système d'expérience immersive mesurée**, industrialisable, progressif et gouverné par le métier.

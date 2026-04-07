import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  GraduationCap, 
  Award, 
  Briefcase, 
  Languages, 
  Target,
  Brain,
  Zap,
  CheckCircle,
  Star,
  BookOpen,
  Code,
  BarChart3,
  Shield,
  Users,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AGENT_PROFILES } from "./agent-profiles-data";

// Get profile by agent ID
// eslint-disable-next-line react-refresh/only-export-components
export function getAgentProfile(agentId: string): AgentProfile | undefined {
  return AGENT_PROFILES[agentId];
}

interface AgentProfileDialogProps {
  agentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AgentProfileDialog({ agentId, open, onOpenChange }: AgentProfileDialogProps) {
  const profile = agentId ? AGENT_PROFILES[agentId] : undefined;
  
  if (!profile) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold">{profile.name}</DialogTitle>
              <DialogDescription className="text-base mt-1">
                {profile.role} • {profile.department}
              </DialogDescription>
              <Badge className="mt-2">{profile.specialty}</Badge>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-180px)] pr-4">
          <div className="space-y-6">
            {/* Formation */}
            <section>
              <h3 className="flex items-center gap-2 font-semibold text-lg mb-3">
                <GraduationCap className="w-5 h-5 text-primary" />
                Formation
              </h3>
              <div className="p-4 rounded-xl bg-muted/50 border">
                <p className="font-medium">{profile.education.degree}</p>
                <p className="text-sm text-muted-foreground">
                  {profile.education.school} • Promotion {profile.education.year}
                </p>
              </div>
            </section>

            {/* Certifications */}
            <section>
              <h3 className="flex items-center gap-2 font-semibold text-lg mb-3">
                <Award className="w-5 h-5 text-amber-500" />
                Certifications
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.certifications.map((cert, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {cert}
                  </Badge>
                ))}
              </div>
            </section>

            {/* Langues */}
            <section>
              <h3 className="flex items-center gap-2 font-semibold text-lg mb-3">
                <Languages className="w-5 h-5 text-blue-500" />
                Langues
              </h3>
              <div className="flex flex-wrap gap-3">
                {profile.languages.map((lang, i) => (
                  <div key={i} className="px-3 py-1.5 rounded-lg bg-muted/50 border text-sm">
                    <span className="font-medium">{lang.name}</span>
                    <span className="text-muted-foreground"> • {lang.level}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Compétences Clés */}
            <section>
              <h3 className="flex items-center gap-2 font-semibold text-lg mb-3">
                <Target className="w-5 h-5 text-emerald-500" />
                Compétences Clés
              </h3>
              <div className="space-y-3">
                {profile.coreSkills.map((skill, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-muted-foreground">{skill.level}%</span>
                    </div>
                    <Progress value={skill.level} className="h-2" />
                  </div>
                ))}
              </div>
            </section>

            {/* Compétences Techniques */}
            <section>
              <h3 className="flex items-center gap-2 font-semibold text-lg mb-3">
                <Code className="w-5 h-5 text-slate-500" />
                Compétences Techniques
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.technicalSkills.map((skill, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </section>

            {/* Soft Skills */}
            <section>
              <h3 className="flex items-center gap-2 font-semibold text-lg mb-3">
                <Users className="w-5 h-5 text-pink-500" />
                Soft Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.softSkills.map((skill, i) => (
                  <Badge key={i} variant="secondary" className="text-xs bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300">
                    {skill}
                  </Badge>
                ))}
              </div>
            </section>

            {/* Domaines d'Expertise */}
            <section>
              <h3 className="flex items-center gap-2 font-semibold text-lg mb-3">
                <Star className="w-5 h-5 text-yellow-500" />
                Domaines d'Expertise
              </h3>
              <ul className="space-y-2">
                {profile.expertise.map((exp, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Sparkles className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                    {exp}
                  </li>
                ))}
              </ul>
            </section>

            {/* Expérience */}
            <section>
              <h3 className="flex items-center gap-2 font-semibold text-lg mb-3">
                <Briefcase className="w-5 h-5 text-indigo-500" />
                Expérience
              </h3>
              <p className="text-sm text-muted-foreground">{profile.experience}</p>
            </section>

            {/* Méthodologies */}
            <section>
              <h3 className="flex items-center gap-2 font-semibold text-lg mb-3">
                <BookOpen className="w-5 h-5 text-teal-500" />
                Méthodologies
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.methodology.map((method, i) => (
                  <Badge key={i} variant="outline" className="text-xs border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300">
                    {method}
                  </Badge>
                ))}
              </div>
            </section>

            {/* Outils */}
            <section>
              <h3 className="flex items-center gap-2 font-semibold text-lg mb-3">
                <Zap className="w-5 h-5 text-orange-500" />
                Outils Maîtrisés
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.tools.map((tool, i) => (
                  <span key={i} className="px-2 py-1 text-xs rounded-md bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                    {tool}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

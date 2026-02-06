import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, CheckCircle, AlertTriangle, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getIntlLocale } from "@/lib/date-locale";

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline?: string;
  priority: 'high' | 'medium' | 'low';
}

interface GoalsProgressProps {
  goals?: Goal[];
  loading?: boolean;
}

export function GoalsProgress({ goals = [], loading = false }: GoalsProgressProps) {
  const { i18n } = useTranslation();
  const defaultGoals: Goal[] = [
    {
      id: '1',
      title: 'Trafic organique mensuel',
      target: 10000,
      current: 6500,
      unit: 'visites',
      deadline: '2026-03-31',
      priority: 'high',
    },
    {
      id: '2',
      title: 'Taux de conversion',
      target: 3,
      current: 2.1,
      unit: '%',
      deadline: '2026-02-28',
      priority: 'high',
    },
    {
      id: '3',
      title: 'Leads qualifiés',
      target: 50,
      current: 28,
      unit: 'leads',
      deadline: '2026-02-28',
      priority: 'medium',
    },
  ];

  const displayGoals = goals.length > 0 ? goals : defaultGoals;

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-amber-500";
    return "bg-destructive";
  };

  const getPriorityBadge = (priority: Goal['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">Prioritaire</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-xs">Important</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs">Normal</Badge>;
    }
  };

  const formatDeadline = (deadline?: string) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    const now = new Date();
    const daysLeft = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return { text: 'Échéance dépassée', urgent: true };
    if (daysLeft === 0) return { text: "Aujourd'hui", urgent: true };
    if (daysLeft <= 7) return { text: `${daysLeft}j restants`, urgent: true };
    return { text: `${daysLeft}j restants`, urgent: false };
  };

  if (loading) {
    return (
      <Card variant="feature">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Objectifs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-2 bg-muted rounded w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="feature">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Objectifs
        </CardTitle>
        <CardDescription>Progression vers vos objectifs stratégiques</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {displayGoals.map((goal) => {
          const progress = Math.min(100, (goal.current / goal.target) * 100);
          const isComplete = progress >= 100;
          const deadline = formatDeadline(goal.deadline);

          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isComplete ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : deadline?.urgent ? (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Target className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="font-medium text-sm">{goal.title}</span>
                </div>
                {getPriorityBadge(goal.priority)}
              </div>
              
              <div className="flex items-center gap-3">
                <Progress 
                  value={progress} 
                  className={`h-2 flex-1 ${getProgressColor(progress)}`}
                />
                <span className="text-sm font-medium min-w-[80px] text-right">
                  {goal.current.toLocaleString(getIntlLocale(i18n.language))} / {goal.target.toLocaleString(getIntlLocale(i18n.language))} {goal.unit}
                </span>
              </div>

              {deadline && (
                <div className={`flex items-center gap-1 text-xs ${deadline.urgent ? 'text-amber-500' : 'text-muted-foreground'}`}>
                  <Calendar className="w-3 h-3" />
                  {deadline.text}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

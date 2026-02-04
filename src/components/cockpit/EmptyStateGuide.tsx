import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { Link } from "react-router-dom";

interface Step {
  id: string;
  title: string;
  description: string;
  link: string;
  completed: boolean;
}

interface EmptyStateGuideProps {
  title: string;
  description: string;
  steps: Step[];
}

export function EmptyStateGuide({ title, description, steps }: EmptyStateGuideProps) {
  const completedCount = steps.filter(s => s.completed).length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <Card className="border-dashed border-2 border-muted-foreground/30">
      <CardContent className="py-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-2xl">🚀</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground max-w-md mx-auto">{description}</p>
        </div>

        <div className="max-w-md mx-auto mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progression</span>
            <span className="font-medium">{completedCount}/{steps.length}</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>

        <div className="space-y-3 text-left max-w-md mx-auto">
          {steps.map((step, index) => (
            <Link key={step.id} to={step.link}>
              <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                step.completed 
                  ? 'bg-primary/5 text-muted-foreground' 
                  : 'bg-secondary/50 hover:bg-secondary cursor-pointer'
              }`}>
                {step.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm ${step.completed ? 'line-through' : ''}`}>
                    {index + 1}. {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                </div>
                {!step.completed && <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

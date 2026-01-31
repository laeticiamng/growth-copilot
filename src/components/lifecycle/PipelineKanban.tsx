import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  GripVertical, 
  Mail, 
  Phone, 
  MoreHorizontal,
  Plus,
  User,
  DollarSign,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Lead {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  status: string;
  score: number | null;
}

interface Deal {
  id: string;
  title: string;
  lead_id: string;
  stage_id: string | null;
  value: number | null;
  probability: number | null;
}

interface Stage {
  id: string;
  name: string;
  position: number;
  color: string;
}

interface PipelineKanbanProps {
  stages: Stage[];
  deals: Deal[];
  leads: Lead[];
  onMoveCard: (dealId: string, newStageId: string) => Promise<void>;
  onAddDeal?: (stageId: string) => void;
}

// Color mapping for consistent stage colors
const stageColors: Record<string, { bg: string; border: string; text: string }> = {
  "bg-blue-500": { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-600" },
  "bg-yellow-500": { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-600" },
  "bg-orange-500": { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-600" },
  "bg-green-500": { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-600" },
  "bg-purple-500": { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-600" },
  "bg-primary": { bg: "bg-primary/10", border: "border-primary/30", text: "text-primary" },
};

function DealCard({ deal, lead, onMove, stages }: { 
  deal: Deal; 
  lead: Lead | undefined;
  onMove: (dealId: string, stageId: string) => void;
  stages: Stage[];
}) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", deal.id);
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        "group bg-card border rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all",
        "hover:shadow-md hover:border-primary/30",
        isDragging && "opacity-50 scale-95"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-4 h-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{deal.title}</p>
          {lead && (
            <p className="text-sm text-muted-foreground truncate flex items-center gap-1 mt-1">
              <User className="w-3 h-3" />
              {lead.name}
            </p>
          )}
          {deal.value && (
            <p className="text-sm font-semibold text-green-600 flex items-center gap-1 mt-1">
              <DollarSign className="w-3 h-3" />
              {deal.value.toLocaleString()}€
            </p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {stages.filter(s => s.id !== deal.stage_id).map(stage => (
              <DropdownMenuItem 
                key={stage.id}
                onClick={() => onMove(deal.id, stage.id)}
              >
                Déplacer vers {stage.name}
              </DropdownMenuItem>
            ))}
            {lead?.email && (
              <DropdownMenuItem>
                <Mail className="w-4 h-4 mr-2" />
                Envoyer un email
              </DropdownMenuItem>
            )}
            {lead?.phone && (
              <DropdownMenuItem>
                <Phone className="w-4 h-4 mr-2" />
                Appeler
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {deal.probability !== null && (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${deal.probability}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{deal.probability}%</span>
        </div>
      )}
    </div>
  );
}

function StageColumn({ 
  stage, 
  deals, 
  leads, 
  onMoveCard, 
  stages,
  onAddDeal,
}: {
  stage: Stage;
  deals: Deal[];
  leads: Lead[];
  onMoveCard: (dealId: string, stageId: string) => Promise<void>;
  stages: Stage[];
  onAddDeal?: (stageId: string) => void;
}) {
  const [isOver, setIsOver] = useState(false);
  const colors = stageColors[stage.color] || stageColors["bg-primary"];

  const stageDeals = deals.filter(d => d.stage_id === stage.id);
  const totalValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const dealId = e.dataTransfer.getData("text/plain");
    if (dealId) {
      await onMoveCard(dealId, stage.id);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col min-w-[280px] max-w-[320px] rounded-lg border transition-colors",
        colors.border,
        isOver && "ring-2 ring-primary ring-offset-2"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className={cn("p-3 rounded-t-lg", colors.bg)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className={cn("font-semibold", colors.text)}>{stage.name}</h3>
            <Badge variant="secondary" className="text-xs">
              {stageDeals.length}
            </Badge>
          </div>
          {onAddDeal && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => onAddDeal(stage.id)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
        {totalValue > 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            {totalValue.toLocaleString()}€
          </p>
        )}
      </div>

      {/* Cards */}
      <div className="flex-1 p-2 space-y-2 min-h-[200px] bg-muted/30">
        {stageDeals.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Aucun deal
          </div>
        ) : (
          stageDeals.map(deal => (
            <DealCard
              key={deal.id}
              deal={deal}
              lead={leads.find(l => l.id === deal.lead_id)}
              onMove={onMoveCard}
              stages={stages}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function PipelineKanban({ stages, deals, leads, onMoveCard, onAddDeal }: PipelineKanbanProps) {
  // Default stages if none configured
  const defaultStages: Stage[] = stages.length > 0 ? stages : [
    { id: "new", name: "Nouveaux", position: 0, color: "bg-blue-500" },
    { id: "contacted", name: "Contactés", position: 1, color: "bg-yellow-500" },
    { id: "qualified", name: "Qualifiés", position: 2, color: "bg-orange-500" },
    { id: "won", name: "Gagnés", position: 3, color: "bg-green-500" },
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
      {defaultStages
        .sort((a, b) => a.position - b.position)
        .map(stage => (
          <StageColumn
            key={stage.id}
            stage={stage}
            deals={deals}
            leads={leads}
            onMoveCard={onMoveCard}
            stages={defaultStages}
            onAddDeal={onAddDeal}
          />
        ))}
    </div>
  );
}

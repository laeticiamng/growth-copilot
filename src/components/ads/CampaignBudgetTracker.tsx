import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Calendar,
  Target,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { differenceInDays, format, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";

interface Campaign {
  id: string;
  name: string;
  platform: "google" | "meta" | "linkedin" | "tiktok";
  budgetMonthly: number;
  spent: number;
  conversions: number;
  cpa: number;
  targetCpa?: number;
  status: "active" | "paused" | "limited" | "overspend";
}

interface CampaignBudgetTrackerProps {
  campaigns?: Campaign[];
  currency?: string;
  onViewDetails?: (campaignId: string) => void;
}

const DEMO_CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    name: "Acquisition - Search Brand",
    platform: "google",
    budgetMonthly: 3000,
    spent: 1850,
    conversions: 45,
    cpa: 41.11,
    targetCpa: 50,
    status: "active",
  },
  {
    id: "2",
    name: "Retargeting - Abandons panier",
    platform: "meta",
    budgetMonthly: 1500,
    spent: 1420,
    conversions: 28,
    cpa: 50.71,
    targetCpa: 45,
    status: "limited",
  },
  {
    id: "3",
    name: "Notoriété - Vidéo branding",
    platform: "meta",
    budgetMonthly: 2000,
    spent: 2150,
    conversions: 12,
    cpa: 179.17,
    status: "overspend",
  },
];

export function CampaignBudgetTracker({ 
  campaigns = DEMO_CAMPAIGNS, 
  currency = "€",
  onViewDetails,
}: CampaignBudgetTrackerProps) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;
  const daysPassed = differenceInDays(now, monthStart) + 1;
  const monthProgress = (daysPassed / daysInMonth) * 100;

  const totalBudget = campaigns.reduce((sum, c) => sum + c.budgetMonthly, 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const overallCpa = totalConversions > 0 ? totalSpent / totalConversions : 0;

  const getSpendProgress = (campaign: Campaign) => {
    return (campaign.spent / campaign.budgetMonthly) * 100;
  };

  const getPlatformColor = (platform: Campaign['platform']) => {
    switch (platform) {
      case 'google':
        return 'bg-blue-500';
      case 'meta':
        return 'bg-indigo-500';
      case 'linkedin':
        return 'bg-sky-600';
      case 'tiktok':
        return 'bg-pink-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Actif</Badge>;
      case 'paused':
        return <Badge variant="secondary">En pause</Badge>;
      case 'limited':
        return <Badge variant="secondary">Budget limité</Badge>;
      case 'overspend':
        return <Badge variant="destructive">Dépassement</Badge>;
      default:
        return null;
    }
  };

  const getCpaIndicator = (campaign: Campaign) => {
    if (!campaign.targetCpa) return null;
    const diff = ((campaign.cpa - campaign.targetCpa) / campaign.targetCpa) * 100;
    if (diff <= -10) {
      return <TrendingDown className="w-4 h-4 text-green-500" />;
    } else if (diff >= 10) {
      return <TrendingUp className="w-4 h-4 text-destructive" />;
    }
    return null;
  };

  return (
    <Card variant="feature">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Suivi des budgets publicitaires
            </CardTitle>
            <CardDescription>
              {format(now, 'MMMM yyyy', { locale: fr })} • Jour {daysPassed}/{daysInMonth}
            </CardDescription>
          </div>
          <Badge variant="outline">
            <Calendar className="w-3 h-3 mr-1" />
            {Math.round(monthProgress)}% du mois
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Global summary */}
        <div className="grid grid-cols-4 gap-4 p-4 rounded-lg bg-secondary/50">
          <div>
            <p className="text-sm text-muted-foreground">Budget total</p>
            <p className="text-xl font-bold">{totalBudget.toLocaleString()}{currency}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Dépensé</p>
            <p className="text-xl font-bold">{totalSpent.toLocaleString()}{currency}</p>
            <p className="text-xs text-muted-foreground">
              {Math.round((totalSpent / totalBudget) * 100)}% du budget
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Conversions</p>
            <p className="text-xl font-bold">{totalConversions}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">CPA moyen</p>
            <p className="text-xl font-bold">{overallCpa.toFixed(2)}{currency}</p>
          </div>
        </div>

        {/* Campaign list */}
        <div className="space-y-3">
          {campaigns.map((campaign) => {
            const spendProgress = getSpendProgress(campaign);
            const isOverspend = spendProgress > 100;
            const isNearLimit = spendProgress > 80 && spendProgress <= 100;
            
            return (
              <div
                key={campaign.id}
                className={`p-4 rounded-lg border ${
                  isOverspend ? 'border-destructive/50 bg-destructive/5' :
                  isNearLimit ? 'border-amber-500/50 bg-amber-500/5' :
                  'bg-secondary/30'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getPlatformColor(campaign.platform)}`} />
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{campaign.platform}</p>
                    </div>
                  </div>
                  {getStatusBadge(campaign.status)}
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span>
                      {campaign.spent.toLocaleString()}{currency} / {campaign.budgetMonthly.toLocaleString()}{currency}
                    </span>
                    <span className={isOverspend ? 'text-destructive font-medium' : ''}>
                      {Math.round(spendProgress)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(100, spendProgress)} 
                    className={`h-2 ${isOverspend ? '[&>div]:bg-destructive' : ''}`}
                  />
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">
                      {campaign.conversions} conv.
                    </span>
                    <span className="flex items-center gap-1">
                      CPA: {campaign.cpa.toFixed(2)}{currency}
                      {getCpaIndicator(campaign)}
                      {campaign.targetCpa && (
                        <span className="text-xs text-muted-foreground">
                          (cible: {campaign.targetCpa}{currency})
                        </span>
                      )}
                    </span>
                  </div>
                  
                  {onViewDetails && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7"
                      onClick={() => onViewDetails(campaign.id)}
                    >
                      Détails
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
                
                {isOverspend && (
                  <div className="flex items-center gap-2 mt-3 p-2 rounded bg-destructive/10 text-destructive text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    Dépassement de {(campaign.spent - campaign.budgetMonthly).toLocaleString()}{currency}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {campaigns.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucune campagne configurée</p>
            <p className="text-sm">Connectez vos comptes publicitaires pour voir vos budgets</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

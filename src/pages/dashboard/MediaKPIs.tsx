import { useState, useEffect, useMemo } from "react";
import { useMedia } from "@/hooks/useMedia";
import { useWorkspace } from "@/hooks/useWorkspace";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Eye,
  Clock,
  ThumbsUp,
  MessageSquare,
  Users,
  MousePointer,
  Mail,
  Loader2,
  BarChart3,
  AlertCircle
} from "lucide-react";
import { format, subDays } from "date-fns";
import { KPICard, KPIChart, ExportButton, calculateTrend, formatDuration } from "@/components/kpi";

interface KPI {
  id: string;
  date: string;
  source: string;
  views: number;
  watch_time_minutes: number;
  likes: number;
  comments: number;
  shares: number;
  subscribers_gained: number;
  ctr: number | null;
  streams: number;
  smart_link_clicks: number;
  email_signups: number;
  metrics_json: Record<string, unknown>;
}

export default function MediaKPIs() {
  const { assets, selectedAsset, setSelectedAsset } = useMedia();
  const { currentWorkspace } = useWorkspace();
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    if (!selectedAsset || !currentWorkspace) {
      setKpis([]);
      return;
    }

    const fetchKPIs = async () => {
      setLoading(true);
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const startDate = subDays(new Date(), days).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('media_kpis_daily')
        .select('*')
        .eq('media_asset_id', selectedAsset.id)
        .gte('date', startDate)
        .order('date', { ascending: true });

      if (!error && data) {
        setKpis(data as unknown as KPI[]);
      }
      setLoading(false);
    };

    fetchKPIs();
  }, [selectedAsset, currentWorkspace, dateRange]);

  // Calculate totals and real trends
  const { totals, trends, avgCtr } = useMemo(() => {
    const currentPeriod = kpis;
    const midpoint = Math.floor(currentPeriod.length / 2);
    const firstHalf = currentPeriod.slice(0, midpoint);
    const secondHalf = currentPeriod.slice(midpoint);

    const sumMetric = (arr: KPI[], key: keyof KPI) => 
      arr.reduce((acc, k) => acc + (Number(k[key]) || 0), 0);

    const calcTotals = {
      views: sumMetric(currentPeriod, 'views'),
      watchTime: sumMetric(currentPeriod, 'watch_time_minutes'),
      likes: sumMetric(currentPeriod, 'likes'),
      comments: sumMetric(currentPeriod, 'comments'),
      shares: sumMetric(currentPeriod, 'shares'),
      subscribers: sumMetric(currentPeriod, 'subscribers_gained'),
      streams: sumMetric(currentPeriod, 'streams'),
      clicks: sumMetric(currentPeriod, 'smart_link_clicks'),
      emails: sumMetric(currentPeriod, 'email_signups'),
    };

    const calcTrends = {
      views: calculateTrend(sumMetric(secondHalf, 'views'), sumMetric(firstHalf, 'views')),
      watchTime: calculateTrend(sumMetric(secondHalf, 'watch_time_minutes'), sumMetric(firstHalf, 'watch_time_minutes')),
      likes: calculateTrend(sumMetric(secondHalf, 'likes'), sumMetric(firstHalf, 'likes')),
      comments: calculateTrend(sumMetric(secondHalf, 'comments'), sumMetric(firstHalf, 'comments')),
      subscribers: calculateTrend(sumMetric(secondHalf, 'subscribers_gained'), sumMetric(firstHalf, 'subscribers_gained')),
      streams: calculateTrend(sumMetric(secondHalf, 'streams'), sumMetric(firstHalf, 'streams')),
      clicks: calculateTrend(sumMetric(secondHalf, 'smart_link_clicks'), sumMetric(firstHalf, 'smart_link_clicks')),
      emails: calculateTrend(sumMetric(secondHalf, 'email_signups'), sumMetric(firstHalf, 'email_signups')),
    };

    const ctrValues = currentPeriod.filter(k => k.ctr !== null).map(k => k.ctr as number);
    const ctrAvg = ctrValues.length > 0 ? ctrValues.reduce((a, b) => a + b, 0) / ctrValues.length : 0;

    return { totals: calcTotals, trends: calcTrends, avgCtr: ctrAvg };
  }, [kpis]);

  // Chart data
  const chartData = useMemo(() => kpis.map(kpi => ({
    date: format(new Date(kpi.date), 'MMM d'),
    views: kpi.views || 0,
    watchTime: kpi.watch_time_minutes || 0,
    likes: kpi.likes || 0,
    clicks: kpi.smart_link_clicks || 0,
    comments: kpi.comments || 0,
  })), [kpis]);

  // Export data
  const exportData = useMemo(() => kpis.map(kpi => ({
    date: kpi.date,
    views: kpi.views,
    watch_time_minutes: kpi.watch_time_minutes,
    likes: kpi.likes,
    comments: kpi.comments,
    shares: kpi.shares,
    subscribers_gained: kpi.subscribers_gained,
    ctr: kpi.ctr,
    streams: kpi.streams,
    smart_link_clicks: kpi.smart_link_clicks,
    email_signups: kpi.email_signups,
  })), [kpis]);

  const isYouTube = selectedAsset?.platform.startsWith('youtube_');
  const isSpotify = selectedAsset?.platform.startsWith('spotify_');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Media KPIs</h1>
          <p className="text-muted-foreground">
            Track performance metrics for your media content
          </p>
        </div>

        <div className="flex items-center gap-3">
          {kpis.length > 0 && (
            <ExportButton 
              data={exportData} 
              filename={`kpis-${selectedAsset?.title || 'media'}-${dateRange}`} 
            />
          )}
          
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={selectedAsset?.id || ''} 
            onValueChange={(id) => setSelectedAsset(assets.find(a => a.id === id) || null)}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select media asset" />
            </SelectTrigger>
            <SelectContent>
              {assets.map((asset) => (
                <SelectItem key={asset.id} value={asset.id}>
                  {asset.title || 'Untitled'} - {asset.platform}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedAsset ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Select a Media Asset</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              Choose a media asset to view its performance metrics and KPIs.
            </p>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : kpis.length === 0 ? (
        <Card className="bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-8 h-8 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Data Yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              KPI data will appear here once synced. For YouTube, connect with YouTube Analytics API. 
              For Spotify, public stats are limited - consider using Spotify for Artists data export.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <KPICard 
              icon={Eye} 
              label="Views" 
              value={totals.views} 
              trend={trends.views}
            />
            {isYouTube && (
              <KPICard 
                icon={Clock} 
                label="Watch Time" 
                value={formatDuration(totals.watchTime)}
                trend={trends.watchTime}
              />
            )}
            <KPICard 
              icon={ThumbsUp} 
              label="Likes" 
              value={totals.likes}
              trend={trends.likes}
            />
            <KPICard 
              icon={MessageSquare} 
              label="Comments" 
              value={totals.comments}
              trend={trends.comments}
            />
            {isYouTube && (
              <KPICard 
                icon={Users} 
                label="Subscribers" 
                value={`+${totals.subscribers}`}
                trend={trends.subscribers}
              />
            )}
            {isSpotify && (
              <KPICard 
                icon={Eye} 
                label="Streams" 
                value={totals.streams}
                trend={trends.streams}
              />
            )}
            <KPICard 
              icon={MousePointer} 
              label="Smart Link Clicks" 
              value={totals.clicks}
              trend={trends.clicks}
            />
            <KPICard 
              icon={Mail} 
              label="Email Signups" 
              value={totals.emails}
              trend={trends.emails}
            />
            {isYouTube && avgCtr > 0 && (
              <KPICard 
                icon={MousePointer} 
                label="Avg CTR" 
                value={`${avgCtr.toFixed(1)}%`}
                trend={avgCtr > 5 ? 10 : -5}
              />
            )}
          </div>

          {/* Charts */}
          <Tabs defaultValue="views" className="space-y-4">
            <TabsList>
              <TabsTrigger value="views">Views</TabsTrigger>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="conversions">Conversions</TabsTrigger>
            </TabsList>

            <TabsContent value="views">
              <KPIChart
                title="Views Over Time"
                description="Daily view count for the selected period"
                data={chartData}
                dataKey="views"
                type="area"
              />
            </TabsContent>

            <TabsContent value="engagement">
              <KPIChart
                title="Engagement Metrics"
                description="Likes over time"
                data={chartData}
                dataKey="likes"
                type="line"
              />
            </TabsContent>

            <TabsContent value="conversions">
              <KPIChart
                title="Smart Link Performance"
                description="Clicks on your smart link page"
                data={chartData}
                dataKey="clicks"
                type="area"
                color="hsl(var(--accent))"
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

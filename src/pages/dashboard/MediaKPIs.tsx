import { useState, useEffect } from "react";
import { useMedia } from "@/hooks/useMedia";
import { useWorkspace } from "@/hooks/useWorkspace";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown,
  Eye,
  Clock,
  ThumbsUp,
  MessageSquare,
  Share2,
  Users,
  MousePointer,
  Mail,
  Loader2,
  BarChart3,
  AlertCircle
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format, subDays } from "date-fns";

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

  // Calculate totals and trends
  const totals = kpis.reduce((acc, kpi) => ({
    views: acc.views + (kpi.views || 0),
    watchTime: acc.watchTime + (kpi.watch_time_minutes || 0),
    likes: acc.likes + (kpi.likes || 0),
    comments: acc.comments + (kpi.comments || 0),
    shares: acc.shares + (kpi.shares || 0),
    subscribers: acc.subscribers + (kpi.subscribers_gained || 0),
    streams: acc.streams + (kpi.streams || 0),
    clicks: acc.clicks + (kpi.smart_link_clicks || 0),
    emails: acc.emails + (kpi.email_signups || 0),
  }), { views: 0, watchTime: 0, likes: 0, comments: 0, shares: 0, subscribers: 0, streams: 0, clicks: 0, emails: 0 });

  // Calculate CTR average
  const ctrValues = kpis.filter(k => k.ctr !== null).map(k => k.ctr as number);
  const avgCtr = ctrValues.length > 0 ? ctrValues.reduce((a, b) => a + b, 0) / ctrValues.length : 0;

  // Chart data
  const chartData = kpis.map(kpi => ({
    date: format(new Date(kpi.date), 'MMM d'),
    views: kpi.views || 0,
    watchTime: kpi.watch_time_minutes || 0,
    likes: kpi.likes || 0,
    clicks: kpi.smart_link_clicks || 0,
  }));

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
              value={totals.views.toLocaleString()} 
              trend={10}
            />
            {isYouTube && (
              <KPICard 
                icon={Clock} 
                label="Watch Time" 
                value={`${Math.round(totals.watchTime / 60)}h`}
                trend={5}
              />
            )}
            <KPICard 
              icon={ThumbsUp} 
              label="Likes" 
              value={totals.likes.toLocaleString()}
              trend={15}
            />
            <KPICard 
              icon={MessageSquare} 
              label="Comments" 
              value={totals.comments.toLocaleString()}
              trend={-2}
            />
            {isYouTube && (
              <KPICard 
                icon={Users} 
                label="Subscribers" 
                value={`+${totals.subscribers}`}
                trend={8}
              />
            )}
            {isSpotify && (
              <KPICard 
                icon={Eye} 
                label="Streams" 
                value={totals.streams.toLocaleString()}
                trend={12}
              />
            )}
            <KPICard 
              icon={MousePointer} 
              label="Smart Link Clicks" 
              value={totals.clicks.toLocaleString()}
              trend={20}
            />
            <KPICard 
              icon={Mail} 
              label="Email Signups" 
              value={totals.emails.toLocaleString()}
              trend={25}
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
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Views Over Time</CardTitle>
                  <CardDescription>
                    Daily view count for the selected period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="views" 
                          stroke="hsl(var(--primary))" 
                          fill="hsl(var(--primary)/0.2)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="engagement">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Engagement Metrics</CardTitle>
                  <CardDescription>
                    Likes over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="likes" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="conversions">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Smart Link Performance</CardTitle>
                  <CardDescription>
                    Clicks on your smart link page
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="clicks" 
                          stroke="hsl(var(--accent))" 
                          fill="hsl(var(--accent)/0.2)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

interface KPICardProps {
  icon: typeof Eye;
  label: string;
  value: string;
  trend?: number;
}

function KPICard({ icon: Icon, label, value, trend }: KPICardProps) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          {trend !== undefined && (
            <Badge variant="outline" className={trend >= 0 ? 'text-primary' : 'text-destructive'}>
              {trend >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {Math.abs(trend)}%
            </Badge>
          )}
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
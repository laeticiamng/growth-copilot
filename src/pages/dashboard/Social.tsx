import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Calendar,
  Plus,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  RefreshCw,
  Download,
  Sparkles,
} from "lucide-react";

const socialAccounts = [
  { platform: "Instagram", connected: true, followers: "12.4K", icon: Instagram },
  { platform: "Facebook", connected: true, followers: "8.2K", icon: Facebook },
  { platform: "LinkedIn", connected: false, followers: "-", icon: Linkedin },
  { platform: "Twitter/X", connected: false, followers: "-", icon: Twitter },
];

const scheduledPosts = [
  {
    id: 1,
    content: "🚀 Nouveau guide SEO 2026 disponible ! Découvrez les 10 tendances...",
    platforms: ["Instagram", "Facebook"],
    scheduledFor: "26 Jan, 10:00",
    type: "Carrousel",
    status: "scheduled",
  },
  {
    id: 2,
    content: "💡 Astuce du jour : Comment optimiser votre fiche Google Business...",
    platforms: ["Instagram"],
    scheduledFor: "27 Jan, 14:00",
    type: "Reel",
    status: "scheduled",
  },
  {
    id: 3,
    content: "🎯 Case study : +150% de trafic organique en 6 mois pour notre client...",
    platforms: ["LinkedIn", "Facebook"],
    scheduledFor: "28 Jan, 09:00",
    type: "Post",
    status: "draft",
  },
];

const repurposeIdeas = [
  { source: "Guide SEO 2026 (blog)", outputs: ["5 carrousels IG", "3 reels", "10 tweets", "1 LinkedIn long"] },
  { source: "Webinar CRO (vidéo)", outputs: ["8 shorts", "2 carrousels", "15 citations"] },
];

const recentPerformance = [
  { post: "10 erreurs SEO à éviter", reach: "4.5K", likes: 234, comments: 18, shares: 42 },
  { post: "Avant/Après audit technique", reach: "6.2K", likes: 456, comments: 34, shares: 89 },
  { post: "Tips Google Ads", reach: "3.1K", likes: 123, comments: 8, shares: 21 },
];

export default function Social() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Social Distribution</h1>
          <p className="text-muted-foreground">
            Calendrier social et distribution de contenu
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter calendrier
          </Button>
          <Button variant="hero">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau post
          </Button>
        </div>
      </div>

      {/* Connected accounts */}
      <div className="grid sm:grid-cols-4 gap-4">
        {socialAccounts.map((account, i) => {
          const Icon = account.icon;
          return (
            <Card key={i} variant={account.connected ? "feature" : "default"} className={!account.connected ? "opacity-60" : ""}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${account.connected ? "bg-primary/10" : "bg-muted"}`}>
                    <Icon className={`w-5 h-5 ${account.connected ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <p className="font-medium">{account.platform}</p>
                    {account.connected ? (
                      <p className="text-sm text-muted-foreground">{account.followers} followers</p>
                    ) : (
                      <Button variant="link" className="p-0 h-auto text-sm">Connecter</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList>
          <TabsTrigger value="calendar">Calendrier</TabsTrigger>
          <TabsTrigger value="repurpose">Repurpose</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Posts planifiés
                  </CardTitle>
                  <CardDescription>Cette semaine</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Générer avec IA
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {scheduledPosts.map((post) => (
                <div key={post.id} className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50">
                  <div className="flex-shrink-0 mt-1">
                    {post.status === "scheduled" ? (
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {post.platforms.map((p) => (
                        <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                      ))}
                      <Badge variant="secondary" className="text-xs">{post.type}</Badge>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium">{post.scheduledFor}</p>
                    <Badge variant={post.status === "scheduled" ? "gradient" : "outline"} className="mt-1">
                      {post.status === "scheduled" ? "Planifié" : "Brouillon"}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repurpose" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Repurpose Engine
              </CardTitle>
              <CardDescription>
                Transformez 1 contenu long en 10+ micro-contenus
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {repurposeIdeas.map((idea, i) => (
                <div key={i} className="p-4 rounded-lg bg-secondary/50">
                  <p className="font-medium mb-2">{idea.source}</p>
                  <div className="flex flex-wrap gap-2">
                    {idea.outputs.map((output, j) => (
                      <Badge key={j} variant="outline" className="text-xs">{output}</Badge>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" className="mt-3">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Générer les contenus
                  </Button>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un contenu source
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <CardTitle>Performance récente</CardTitle>
              <CardDescription>Engagement sur vos derniers posts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPerformance.map((post, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{post.post}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        {post.reach}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4 text-pink-500" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4 text-primary" />
                        {post.comments}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="w-4 h-4 text-green-500" />
                        {post.shares}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <CardTitle>Export & Checklists</CardTitle>
              <CardDescription>
                Si les permissions API ne sont pas disponibles, exportez votre calendrier
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Exporter en CSV
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Exporter en iCal
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Télécharger les assets
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

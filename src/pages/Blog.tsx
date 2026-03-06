import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SEOHead } from "@/components/SEOHead";
import {
  Search, ArrowRight, Calendar, Clock, Tag, User,
  TrendingUp, Target, BarChart3, Megaphone, Bot
} from "lucide-react";

interface BlogPost {
  slug: string;
  title: Record<string, string>;
  excerpt: Record<string, string>;
  category: string;
  author: string;
  date: string;
  readTime: number;
  tags: string[];
  featured?: boolean;
}

const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-39-ai-agents-replace-company-team",
    title: { fr: "Comment 39 agents IA remplacent une équipe entreprise entière", en: "How 39 AI Agents Replace an Entire Company Team" },
    excerpt: { fr: "Découvrez comment une équipe de 39 agents IA spécialisés peut automatiser 90% des tâches d'une entreprise B2B.", en: "Discover how a team of 39 specialized AI agents can automate 90% of a B2B company's tasks." },
    category: "growth",
    author: "Équipe Growth OS",
    date: "2026-01-15",
    readTime: 8,
    tags: ["IA", "marketing", "automatisation"],
    featured: true,
  },
  {
    slug: "roi-growth-automation",
    title: { fr: "ROI de l'automatisation Growth : chiffres et méthodologie", en: "Growth Automation ROI: Numbers and Methodology" },
    excerpt: { fr: "Analyse complète du retour sur investissement de l'automatisation growth avec des données réelles de nos clients.", en: "Complete analysis of growth automation ROI with real client data." },
    category: "analytics",
    author: "Équipe Growth OS",
    date: "2026-01-08",
    readTime: 10,
    tags: ["ROI", "analytics", "growth"],
  },
  {
    slug: "seo-automation-complete-guide",
    title: { fr: "Guide complet : automatiser son SEO avec l'IA en 2026", en: "Complete Guide: Automating SEO with AI in 2026" },
    excerpt: { fr: "De l'audit technique au contenu optimisé, comment l'IA révolutionne chaque étape du SEO.", en: "From technical audit to optimized content, how AI revolutionizes every step of SEO." },
    category: "seo",
    author: "Équipe Growth OS",
    date: "2025-12-20",
    readTime: 12,
    tags: ["SEO", "IA", "audit", "contenu"],
  },
  {
    slug: "approval-system-ai-governance",
    title: { fr: "Système d'approbation : garder le contrôle sur vos agents IA", en: "Approval System: Keeping Control Over Your AI Agents" },
    excerpt: { fr: "Comment le système d'approbation de Growth OS garantit la sécurité tout en maximisant l'efficacité de vos agents.", en: "How Growth OS's approval system ensures security while maximizing agent efficiency." },
    category: "security",
    author: "Équipe Growth OS",
    date: "2025-12-10",
    readTime: 7,
    tags: ["gouvernance", "sécurité", "approbation"],
  },
  {
    slug: "11-departments-explained",
    title: { fr: "Les 11 départements de Growth OS expliqués", en: "Growth OS's 11 Departments Explained" },
    excerpt: { fr: "Présentation détaillée de chaque département, ses agents, et comment ils travaillent ensemble pour votre croissance.", en: "Detailed presentation of each department, its agents, and how they work together for your growth." },
    category: "growth",
    author: "Équipe Growth OS",
    date: "2025-11-28",
    readTime: 9,
    tags: ["départements", "agents", "organisation"],
  },
  {
    slug: "lead-scoring-ai",
    title: { fr: "Lead scoring IA : qualifier vos prospects automatiquement", en: "AI Lead Scoring: Automatically Qualify Your Prospects" },
    excerpt: { fr: "Découvrez comment l'agent Sales Accelerator utilise le machine learning pour scorer et prioriser vos leads.", en: "Discover how the Sales Accelerator agent uses machine learning to score and prioritize your leads." },
    category: "sales",
    author: "Équipe Growth OS",
    date: "2025-11-20",
    readTime: 6,
    tags: ["lead scoring", "sales", "AI"],
  },
  {
    slug: "social-media-automation",
    title: { fr: "Automatiser vos réseaux sociaux sans perdre l'authenticité", en: "Automate Your Social Media Without Losing Authenticity" },
    excerpt: { fr: "L'agent Social Media Manager planifie, génère et publie du contenu tout en gardant votre ton de voix.", en: "The Social Media Manager agent plans, generates and publishes content while keeping your tone of voice." },
    category: "social",
    author: "Équipe Growth OS",
    date: "2025-11-05",
    readTime: 6,
    tags: ["social media", "automation", "content"],
  },
];

const CATEGORIES = [
  { id: "all", labelFr: "Tous", labelEn: "All" },
  { id: "growth", labelFr: "Growth", labelEn: "Growth" },
  { id: "seo", labelFr: "SEO", labelEn: "SEO" },
  { id: "content", labelFr: "Contenu", labelEn: "Content" },
  { id: "sales", labelFr: "Commercial", labelEn: "Sales" },
  { id: "analytics", labelFr: "Analytics", labelEn: "Analytics" },
  { id: "social", labelFr: "Social", labelEn: "Social" },
  { id: "security", labelFr: "Sécurité", labelEn: "Security" },
];

export default function Blog() {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith("fr") ? "fr" : "en";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesSearch =
      !searchQuery ||
      post.title[lang].toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt[lang].toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === "all" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPost = BLOG_POSTS.find((p) => p.featured);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: lang === "fr" ? "Blog Growth OS" : "Growth OS Blog",
    description: lang === "fr"
      ? "Articles et guides sur le growth hacking, l'automatisation IA et la croissance d'entreprise."
      : "Articles and guides on growth hacking, AI automation and business growth.",
  };

  return (
    <>
      <SEOHead
        title="Blog"
        description={
          lang === "fr"
            ? "Articles et guides sur le growth hacking et l'automatisation IA."
            : "Articles and guides on growth hacking and AI automation."
        }
        canonical="/blog"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container mx-auto px-4 relative text-center">
            <Badge variant="agent" className="mb-4">Blog</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {lang === "fr" ? "Insights & " : "Insights & "}
              <span className="gradient-text">Growth</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {lang === "fr"
                ? "Articles, guides et stratégies pour automatiser votre croissance avec l'IA."
                : "Articles, guides and strategies to automate your growth with AI."}
            </p>
          </div>
        </section>

        {/* Search & Filter */}
        <section className="py-6 border-b border-border/50 sticky top-0 z-30 bg-background/95 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={lang === "fr" ? "Rechercher un article..." : "Search an article..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {CATEGORIES.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {lang === "fr" ? cat.labelFr : cat.labelEn}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Post */}
        {featuredPost && selectedCategory === "all" && !searchQuery && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <Card className="overflow-hidden border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
                <CardContent className="p-8 md:p-12">
                  <Badge variant="gradient" className="mb-4">
                    {lang === "fr" ? "Article vedette" : "Featured"}
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    {featuredPost.title[lang]}
                  </h2>
                  <p className="text-muted-foreground mb-6 max-w-2xl">
                    {featuredPost.excerpt[lang]}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" /> {featuredPost.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {featuredPost.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {featuredPost.readTime} min
                    </span>
                  </div>
                  <Link to={`/blog/${featuredPost.slug}`}>
                    <Button variant="hero">
                      {lang === "fr" ? "Lire l'article" : "Read article"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Posts Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts
                .filter((p) => !p.featured || searchQuery || selectedCategory !== "all")
                .map((post, index) => (
                <Link key={post.slug} to={`/blog/${post.slug}`}>
                <Card
                  className="overflow-hidden hover:border-primary/30 transition-all duration-300 group animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-6">
                    <Badge variant="outline" className="mb-3 text-xs">
                      {CATEGORIES.find((c) => c.id === post.category)?.[lang === "fr" ? "labelFr" : "labelEn"] || post.category}
                    </Badge>
                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title[lang]}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {post.excerpt[lang]}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" /> {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {post.readTime} min
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                </Link>
              ))}
            </div>
            {filteredPosts.length === 0 && (
              <div className="text-center py-16">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {lang === "fr" ? "Aucun article trouvé" : "No articles found"}
                </h3>
                <p className="text-muted-foreground">
                  {lang === "fr" ? "Essayez de modifier vos critères." : "Try adjusting your criteria."}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">
              {lang === "fr" ? "Restez informé" : "Stay informed"}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              {lang === "fr"
                ? "Recevez les derniers articles et stratégies growth directement dans votre boîte mail."
                : "Get the latest articles and growth strategies directly in your inbox."}
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <Input placeholder={lang === "fr" ? "votre@email.com" : "your@email.com"} type="email" />
              <Button variant="hero">
                {lang === "fr" ? "S'abonner" : "Subscribe"}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

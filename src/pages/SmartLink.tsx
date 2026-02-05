import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Youtube, 
  Music, 
  Apple, 
  CloudRain, 
  Music2,
  Loader2,
  ExternalLink,
  Mail,
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SmartLinkData {
  id: string;
  workspace_id: string;
  slug: string;
  title: string | null;
  artist_name: string | null;
  thumbnail_url: string | null;
  embed_html: string | null;
  platform: string;
  links: Array<{
    platform: string;
    label: string;
    url: string;
    icon: string;
    color: string;
  }>;
  show_email_capture: boolean;
  email_capture_text: string;
  background_color: string;
  text_color: string;
  accent_color: string;
}

const platformIcons: Record<string, typeof Youtube> = {
  youtube: Youtube,
  spotify: Music,
  apple_music: Apple,
  apple: Apple,
  soundcloud: CloudRain,
  deezer: Music2,
  tidal: Music2,
  amazon_music: Music2,
  music: Music2,
};

export default function SmartLinkPage() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const [data, setData] = useState<SmartLinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchSmartLink = async () => {
      setLoading(true);
      try {
        const response = await supabase.functions.invoke('smart-link', {
          body: {}
        });

        // For now, fetch directly from database as fallback
        const { data: asset, error } = await supabase
          .from('media_assets')
          .select('*')
          .eq('smart_link_slug', slug)
          .single();

        if (error || !asset) {
          console.error('Smart link not found');
          setLoading(false);
          return;
        }

        const config = (asset.smart_link_config || {}) as Record<string, any>;
        const links = config.links || {};

        // Build platform links
        const platformLinks: SmartLinkData['links'] = [];
        
        if (asset.platform === 'youtube_video' || asset.platform === 'youtube_channel') {
          platformLinks.push({
            platform: 'youtube',
            label: 'YouTube',
            url: asset.url,
            icon: 'youtube',
            color: '#FF0000'
          });
        }
        
        if (asset.platform.startsWith('spotify_')) {
          platformLinks.push({
            platform: 'spotify',
            label: 'Spotify',
            url: asset.url,
            icon: 'spotify',
            color: '#1DB954'
          });
        }

        if (links.apple_music) {
          platformLinks.push({
            platform: 'apple_music',
            label: 'Apple Music',
            url: links.apple_music,
            icon: 'apple',
            color: '#FA243C'
          });
        }

        if (links.deezer) {
          platformLinks.push({
            platform: 'deezer',
            label: 'Deezer',
            url: links.deezer,
            icon: 'music',
            color: '#FF0092'
          });
        }

        if (links.soundcloud) {
          platformLinks.push({
            platform: 'soundcloud',
            label: 'SoundCloud',
            url: links.soundcloud,
            icon: 'soundcloud',
            color: '#FF5500'
          });
        }

        setData({
          id: asset.id,
          slug: asset.smart_link_slug!,
          title: asset.title,
          artist_name: asset.artist_name,
          thumbnail_url: asset.thumbnail_url,
          embed_html: asset.embed_html,
          platform: asset.platform,
          links: platformLinks,
        workspace_id: asset.workspace_id,
          show_email_capture: config.show_email_capture || false,
          email_capture_text: config.email_capture_text || 'Get notified about new releases',
          background_color: config.background_color || '#1a1a2e',
          text_color: config.text_color || '#ffffff',
          accent_color: config.accent_color || '#4a90d9'
        });
      } catch (error) {
        console.error('Error fetching smart link:', error);
      }
      setLoading(false);
    };

    fetchSmartLink();
  }, [slug]);

  const handleLinkClick = async (platform: string, url: string) => {
    // Track click
    const urlParams = new URLSearchParams(window.location.search);
    
    await supabase.from('smart_link_clicks').insert({
      media_asset_id: data?.id,
      platform,
      referrer: document.referrer,
      utm_source: urlParams.get('utm_source'),
      utm_medium: urlParams.get('utm_medium'),
      utm_campaign: urlParams.get('utm_campaign'),
      country: null, // Would need IP geolocation
      device: /mobile/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
    });

    // Open link
    window.open(url, '_blank');
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !consent || !data) return;

    setSubmitting(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      
      const { error } = await supabase.from('smart_link_emails').insert({
        media_asset_id: data.id,
        workspace_id: data.workspace_id,
        email,
        consent_given: consent,
        utm_source: urlParams.get('utm_source'),
        utm_medium: urlParams.get('utm_medium'),
        utm_campaign: urlParams.get('utm_campaign')
      });

      if (!error) {
        setEmailSubmitted(true);
        toast({
          title: 'Subscribed!',
          description: "You'll be notified about new releases",
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to subscribe',
        variant: 'destructive',
      });
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1a1a2e' }}>
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1a1a2e' }}>
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-2">Link Not Found</h1>
          <p className="text-white/60">This smart link doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ 
        backgroundColor: data.background_color,
        color: data.text_color
      }}
    >
      <div className="w-full max-w-md space-y-6">
        {/* Cover Art */}
        {data.thumbnail_url && (
          <div className="aspect-square w-full max-w-[300px] mx-auto rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src={data.thumbnail_url} 
              alt={data.title || 'Cover'} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Title & Artist */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">{data.title || 'Untitled'}</h1>
          {data.artist_name && (
            <p className="text-lg opacity-80">{data.artist_name}</p>
          )}
        </div>

        {/* Platform Links */}
        <div className="space-y-3">
          {data.links.map((link) => {
            const Icon = platformIcons[link.icon] || Music2;
            
            return (
              <Button
                key={link.platform}
                variant="outline"
                className="w-full h-14 text-base justify-start gap-4 border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10"
                style={{ color: data.text_color }}
                onClick={() => handleLinkClick(link.platform, link.url)}
              >
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: link.color }}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="flex-1 text-left">{link.label}</span>
                <ExternalLink className="w-4 h-4 opacity-50" />
              </Button>
            );
          })}
        </div>

        {/* Email Capture */}
        {data.show_email_capture && !emailSubmitted && (
          <Card className="bg-white/10 border-white/20">
            <CardContent className="pt-4">
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <p className="text-sm text-center opacity-80">
                  {data.email_capture_text}
                </p>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  required
                />
                <div className="flex items-start gap-2">
                  <Checkbox 
                    id="consent" 
                    checked={consent}
                    onCheckedChange={(checked) => setConsent(checked === true)}
                    className="border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-black"
                  />
                  <label htmlFor="consent" className="text-xs opacity-70 leading-tight">
                    I agree to receive emails about new releases and updates. You can unsubscribe at any time.
                  </label>
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  style={{ backgroundColor: data.accent_color }}
                  disabled={!email || !consent || submitting}
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Subscribe
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {emailSubmitted && (
          <div className="text-center py-4">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2" style={{ color: data.accent_color }} />
            <p className="text-sm opacity-80">Thanks for subscribing!</p>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs opacity-50">
          Powered by Growth OS
        </p>
      </div>
    </div>
  );
}
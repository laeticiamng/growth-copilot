import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Palette, MessageSquare, Target, Ban, Award, Shield, Save, Loader2, Plus, X, AlertCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSites } from "@/hooks/useSites";
import { useToast } from "@/hooks/use-toast";

interface BrandKitData {
  tone_of_voice: string;
  target_audience: string;
  style_guidelines: string;
  values: string[];
  forbidden_words: string[];
  allowed_claims: string[];
  available_proofs: string[];
  usp: string[];
  competitors: string[];
}

const defaultBrandKit: BrandKitData = {
  tone_of_voice: "", target_audience: "", style_guidelines: "",
  values: [], forbidden_words: [], allowed_claims: [], available_proofs: [], usp: [], competitors: [],
};

const BrandKit = () => {
  const { t } = useTranslation();
  const { currentSite } = useSites();
  const { toast } = useToast();
  const [brandKit, setBrandKit] = useState<BrandKitData>(defaultBrandKit);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newItems, setNewItems] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchBrandKit = async () => {
      if (!currentSite) { setLoading(false); return; }
      setLoading(true);
      const { data } = await supabase.from('brand_kit').select('*').eq('site_id', currentSite.id).single();
      if (data) {
        setBrandKit({
          tone_of_voice: data.tone_of_voice || "", target_audience: data.target_audience || "",
          style_guidelines: data.style_guidelines || "", values: (data.values as string[]) || [],
          forbidden_words: (data.forbidden_words as string[]) || [], allowed_claims: (data.allowed_claims as string[]) || [],
          available_proofs: (data.available_proofs as string[]) || [], usp: (data.usp as string[]) || [],
          competitors: (data.competitors as string[]) || [],
        });
      }
      setLoading(false);
    };
    fetchBrandKit();
  }, [currentSite]);

  const handleSave = async () => {
    if (!currentSite) return;
    setSaving(true);
    const { error } = await supabase.from('brand_kit').upsert({
      site_id: currentSite.id, workspace_id: currentSite.workspace_id,
      tone_of_voice: brandKit.tone_of_voice, target_audience: brandKit.target_audience,
      style_guidelines: brandKit.style_guidelines, values: brandKit.values,
      forbidden_words: brandKit.forbidden_words, allowed_claims: brandKit.allowed_claims,
      available_proofs: brandKit.available_proofs, usp: brandKit.usp, competitors: brandKit.competitors,
    }, { onConflict: 'site_id' });
    setSaving(false);
    if (error) {
      toast({ title: t("modules.brandKit.errorSaving"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("modules.brandKit.saved"), description: t("modules.brandKit.savedDesc") });
    }
  };

  const addItem = (field: keyof BrandKitData) => {
    const value = newItems[field]?.trim();
    if (!value) return;
    setBrandKit(prev => ({ ...prev, [field]: [...(prev[field] as string[]), value] }));
    setNewItems(prev => ({ ...prev, [field]: "" }));
  };

  const removeItem = (field: keyof BrandKitData, index: number) => {
    setBrandKit(prev => ({ ...prev, [field]: (prev[field] as string[]).filter((_, i) => i !== index) }));
  };

  if (!currentSite) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t("modules.brandKit.title")}</h1>
          <p className="text-muted-foreground">{t("modules.brandKit.subtitle")}</p>
        </div>
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-4 py-6">
            <AlertCircle className="w-6 h-6 text-destructive" />
            <p dangerouslySetInnerHTML={{ __html: t("modules.brandKit.selectSiteFirst") }} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("modules.brandKit.title")}</h1>
          <p className="text-muted-foreground">{t("modules.brandKit.subtitleFull")}</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {t("modules.brandKit.save")}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="feature">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              {t("modules.brandKit.toneVoice")}
            </CardTitle>
            <CardDescription>{t("modules.brandKit.toneVoiceDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t("modules.brandKit.toneOfVoice")}</Label>
              <Textarea placeholder={t("modules.brandKit.toneOfVoicePlaceholder")} value={brandKit.tone_of_voice} onChange={(e) => setBrandKit({ ...brandKit, tone_of_voice: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>{t("modules.brandKit.targetAudience")}</Label>
              <Textarea placeholder={t("modules.brandKit.targetAudiencePlaceholder")} value={brandKit.target_audience} onChange={(e) => setBrandKit({ ...brandKit, target_audience: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>{t("modules.brandKit.styleGuidelines")}</Label>
              <Textarea placeholder={t("modules.brandKit.styleGuidelinesPlaceholder")} value={brandKit.style_guidelines} onChange={(e) => setBrandKit({ ...brandKit, style_guidelines: e.target.value })} className="mt-1" />
            </div>
          </CardContent>
        </Card>

        <Card variant="feature">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              {t("modules.brandKit.valuesUSP")}
            </CardTitle>
            <CardDescription>{t("modules.brandKit.valuesUSPDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t("modules.brandKit.brandValues")}</Label>
              <div className="flex gap-2 mt-1">
                <Input placeholder={t("modules.brandKit.addValue")} value={newItems.values || ""} onChange={(e) => setNewItems({ ...newItems, values: e.target.value })} onKeyDown={(e) => e.key === "Enter" && addItem("values")} />
                <Button variant="outline" size="icon" onClick={() => addItem("values")}><Plus className="w-4 h-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {brandKit.values.map((value, i) => (
                  <Badge key={i} variant="secondary" className="pr-1">{value}<button onClick={() => removeItem("values", i)} className="ml-1 hover:text-destructive"><X className="w-3 h-3" /></button></Badge>
                ))}
              </div>
            </div>
            <div>
              <Label>{t("modules.brandKit.uniqueValueProps")}</Label>
              <div className="flex gap-2 mt-1">
                <Input placeholder={t("modules.brandKit.addUSP")} value={newItems.usp || ""} onChange={(e) => setNewItems({ ...newItems, usp: e.target.value })} onKeyDown={(e) => e.key === "Enter" && addItem("usp")} />
                <Button variant="outline" size="icon" onClick={() => addItem("usp")}><Plus className="w-4 h-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {brandKit.usp.map((item, i) => (
                  <Badge key={i} variant="outline" className="pr-1">{item}<button onClick={() => removeItem("usp", i)} className="ml-1 hover:text-destructive"><X className="w-3 h-3" /></button></Badge>
                ))}
              </div>
            </div>
            <div>
              <Label>{t("modules.brandKit.competitorsLabel")}</Label>
              <div className="flex gap-2 mt-1">
                <Input placeholder={t("modules.brandKit.addCompetitor")} value={newItems.competitors || ""} onChange={(e) => setNewItems({ ...newItems, competitors: e.target.value })} onKeyDown={(e) => e.key === "Enter" && addItem("competitors")} />
                <Button variant="outline" size="icon" onClick={() => addItem("competitors")}><Plus className="w-4 h-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {brandKit.competitors.map((item, i) => (
                  <Badge key={i} variant="destructive" className="pr-1">{item}<button onClick={() => removeItem("competitors", i)} className="ml-1"><X className="w-3 h-3" /></button></Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="feature">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ban className="w-5 h-5 text-destructive" />
              {t("modules.brandKit.forbiddenWords")}
            </CardTitle>
            <CardDescription>{t("modules.brandKit.forbiddenWordsDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input placeholder={t("modules.brandKit.addForbiddenWord")} value={newItems.forbidden_words || ""} onChange={(e) => setNewItems({ ...newItems, forbidden_words: e.target.value })} onKeyDown={(e) => e.key === "Enter" && addItem("forbidden_words")} />
              <Button variant="outline" size="icon" onClick={() => addItem("forbidden_words")}><Plus className="w-4 h-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {brandKit.forbidden_words.map((word, i) => (
                <Badge key={i} variant="destructive" className="pr-1">{word}<button onClick={() => removeItem("forbidden_words", i)} className="ml-1"><X className="w-3 h-3" /></button></Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card variant="feature">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              {t("modules.brandKit.claimsProofs")}
            </CardTitle>
            <CardDescription>{t("modules.brandKit.claimsProofsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t("modules.brandKit.allowedClaims")}</Label>
              <div className="flex gap-2 mt-1">
                <Input placeholder={t("modules.brandKit.addClaim")} value={newItems.allowed_claims || ""} onChange={(e) => setNewItems({ ...newItems, allowed_claims: e.target.value })} onKeyDown={(e) => e.key === "Enter" && addItem("allowed_claims")} />
                <Button variant="outline" size="icon" onClick={() => addItem("allowed_claims")}><Plus className="w-4 h-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {brandKit.allowed_claims.map((claim, i) => (
                  <Badge key={i} variant="success" className="pr-1">{claim}<button onClick={() => removeItem("allowed_claims", i)} className="ml-1"><X className="w-3 h-3" /></button></Badge>
                ))}
              </div>
            </div>
            <div>
              <Label>{t("modules.brandKit.availableProofs")}</Label>
              <div className="flex gap-2 mt-1">
                <Input placeholder={t("modules.brandKit.addProof")} value={newItems.available_proofs || ""} onChange={(e) => setNewItems({ ...newItems, available_proofs: e.target.value })} onKeyDown={(e) => e.key === "Enter" && addItem("available_proofs")} />
                <Button variant="outline" size="icon" onClick={() => addItem("available_proofs")}><Plus className="w-4 h-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {brandKit.available_proofs.map((proof, i) => (
                  <Badge key={i} variant="outline" className="pr-1"><Award className="w-3 h-3 mr-1" />{proof}<button onClick={() => removeItem("available_proofs", i)} className="ml-1 hover:text-destructive"><X className="w-3 h-3" /></button></Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BrandKit;

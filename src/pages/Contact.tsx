import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SEOHead } from "@/components/SEOHead";
import { Mail, MessageCircle, BookOpen, Send, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

type ContactFormValues = z.infer<typeof contactFormSchema>;
const contactFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.enum(["bug", "question", "billing", "feature", "other"]),
  message: z.string().min(10),
});

export default function Contact() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const subjectLabels: Record<string, string> = {
    bug: t("pages.contact.subjectBug"),
    question: t("pages.contact.subjectQuestion"),
    billing: t("pages.contact.subjectBilling"),
    feature: t("pages.contact.subjectFeature"),
    other: t("pages.contact.subjectOther"),
  };

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: user?.user_metadata?.full_name || "", email: user?.email || "", subject: undefined, message: "" },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("send-contact-form", { body: data });
      if (error) throw error;
      setIsSuccess(true);
      toast.success(t("pages.contact.successToast"));
      form.reset();
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error(t("pages.contact.errorToast"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactCards = [
    { icon: Mail, title: "Email", description: t("pages.contact.emailDesc"), action: "contact@emotionscare.com", href: "mailto:contact@emotionscare.com", color: "text-blue-500", bgColor: "bg-blue-500/10" },
    { icon: MessageCircle, title: t("pages.contact.liveChat"), description: t("pages.contact.liveChatDesc"), action: t("pages.contact.openChat"), onClick: () => { if (typeof window !== "undefined" && (window as any).$crisp) { (window as any).$crisp.push(["do", "chat:open"]); } }, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
    { icon: BookOpen, title: "Documentation", description: t("pages.contact.docsDesc"), action: t("pages.contact.viewGuide"), href: "/dashboard/guide", isInternal: true, color: "text-purple-500", bgColor: "bg-purple-500/10" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Contact" description={t("pages.contact.seoDesc")} canonical="/contact"
        structuredData={{ "@context": "https://schema.org", "@type": "ContactPage", "name": "Contact Growth OS", "description": t("pages.contact.schemaDesc") }} />
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("pages.contact.title")}</h1>
          <p className="text-lg text-muted-foreground">{t("pages.contact.subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
          {contactCards.map((card) => {
            const Icon = card.icon;
            const CardWrapper = card.href ? (card.isInternal ? Link : "a") : "button";
            const cardProps = card.href ? (card.isInternal ? { to: card.href } : { href: card.href }) : { onClick: card.onClick, type: "button" as const };
            return (
              <CardWrapper key={card.title} {...(cardProps as any)} className="block group">
                <Card className="h-full transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                  <CardHeader className="text-center">
                    <div className={`w-12 h-12 rounded-xl ${card.bgColor} flex items-center justify-center mx-auto mb-3`}>
                      <Icon className={`w-6 h-6 ${card.color}`} />
                    </div>
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <span className="text-sm font-medium text-primary group-hover:underline">{card.action}</span>
                  </CardContent>
                </Card>
              </CardWrapper>
            );
          })}
        </div>

        <div className="max-w-xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>{t("pages.contact.formTitle")}</CardTitle>
              <CardDescription>{t("pages.contact.formDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {isSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{t("pages.contact.successTitle")}</h3>
                  <p className="text-muted-foreground mb-6">{t("pages.contact.successDesc")}</p>
                  <Button variant="outline" onClick={() => setIsSuccess(false)}>{t("pages.contact.sendAnother")}</Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("pages.contact.name")}</FormLabel>
                          <FormControl><Input placeholder={t("pages.contact.namePlaceholder")} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl><Input type="email" placeholder={t("pages.contact.emailPlaceholder")} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="subject" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("pages.contact.subject")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder={t("pages.contact.subjectPlaceholder")} /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(subjectLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="message" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl><Textarea placeholder={t("pages.contact.messagePlaceholder")} className="min-h-[120px] resize-none" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("pages.contact.sending")}</>) : (<><Send className="w-4 h-4 mr-2" />{t("pages.contact.send")}</>)}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

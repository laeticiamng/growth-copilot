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
import {
  Mail,
  MessageCircle,
  BookOpen,
  Send,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type ContactFormValues = z.infer<typeof contactFormSchema>;

const contactFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.enum(["bug", "question", "billing", "feature", "other"]),
  message: z.string().min(10),
});

export default function Contact() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === "en";
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const subjectLabels = isEn
    ? {
        bug: "🐛 Report a bug",
        question: "❓ General question",
        billing: "💳 Billing",
        feature: "💡 Feature request",
        other: "📝 Other",
      }
    : {
        bug: "🐛 Signaler un bug",
        question: "❓ Question générale",
        billing: "💳 Facturation",
        feature: "💡 Demande de fonctionnalité",
        other: "📝 Autre",
      };

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: user?.user_metadata?.full_name || "",
      email: user?.email || "",
      subject: undefined,
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("send-contact-form", {
        body: data,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success(isEn ? "Message sent successfully!" : "Message envoyé avec succès !");
      form.reset();
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error(isEn ? "Error sending message. Please try again." : "Erreur lors de l'envoi. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactCards = [
    {
      icon: Mail,
      title: "Email",
      description: isEn ? "Response within 24 business hours" : "Réponse sous 24h ouvrées",
      action: "contact@emotionscare.com",
      href: "mailto:contact@emotionscare.com",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: MessageCircle,
      title: isEn ? "Live chat" : "Chat en direct",
      description: isEn ? "Chat with us in the bottom right" : "Discutez avec nous en bas à droite",
      action: isEn ? "Open chat" : "Ouvrir le chat",
      onClick: () => {
        if (typeof window !== "undefined" && (window as any).$crisp) {
          (window as any).$crisp.push(["do", "chat:open"]);
        }
      },
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      icon: BookOpen,
      title: "Documentation",
      description: isEn ? "Guides and tutorials" : "Guides et tutoriels",
      action: isEn ? "View guide" : "Consulter le guide",
      href: "/dashboard/guide",
      isInternal: true,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Contact"
        description={isEn 
          ? "Contact the Growth OS team. Responsive customer support, technical assistance and answers within 24h."
          : "Contactez l'équipe Growth OS. Support client réactif, assistance technique et réponses à vos questions sous 24h."
        }
        canonical="/contact"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": "Contact Growth OS",
          "description": isEn ? "Contact form and support" : "Formulaire de contact et support"
        }}
      />
      <Navbar />

      <main className="container mx-auto px-4 py-24">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {isEn ? "Need help?" : "Besoin d'aide ?"}
          </h1>
          <p className="text-lg text-muted-foreground">
            {isEn ? "Our team responds within 24 hours" : "Notre équipe vous répond sous 24h"}
          </p>
        </div>

        {/* Contact cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
          {contactCards.map((card) => {
            const Icon = card.icon;
            const CardWrapper = card.href
              ? card.isInternal
                ? Link
                : "a"
              : "button";

            const cardProps = card.href
              ? card.isInternal
                ? { to: card.href }
                : { href: card.href }
              : { onClick: card.onClick, type: "button" as const };

            return (
              <CardWrapper
                key={card.title}
                {...(cardProps as any)}
                className="block group"
              >
                <Card className="h-full transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                  <CardHeader className="text-center">
                    <div
                      className={`w-12 h-12 rounded-xl ${card.bgColor} flex items-center justify-center mx-auto mb-3`}
                    >
                      <Icon className={`w-6 h-6 ${card.color}`} />
                    </div>
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <span className="text-sm font-medium text-primary group-hover:underline">
                      {card.action}
                    </span>
                  </CardContent>
                </Card>
              </CardWrapper>
            );
          })}
        </div>

        {/* Contact form */}
        <div className="max-w-xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>{isEn ? "Send us a message" : "Envoyez-nous un message"}</CardTitle>
              <CardDescription>
                {isEn 
                  ? "Describe your request and we'll get back to you quickly"
                  : "Décrivez votre demande et nous vous répondrons rapidement"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {isEn ? "Message sent!" : "Message envoyé !"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {isEn 
                      ? "We'll get back to you as soon as possible."
                      : "Nous vous répondrons dans les plus brefs délais."
                    }
                  </p>
                  <Button variant="outline" onClick={() => setIsSuccess(false)}>
                    {isEn ? "Send another message" : "Envoyer un autre message"}
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{isEn ? "Name" : "Nom"}</FormLabel>
                            <FormControl>
                              <Input placeholder={isEn ? "Your name" : "Votre nom"} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder={isEn ? "your@email.com" : "votre@email.com"}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{isEn ? "Subject" : "Sujet"}</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={isEn ? "Select a subject" : "Sélectionnez un sujet"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(subjectLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={isEn ? "Describe your request..." : "Décrivez votre demande..."}
                              className="min-h-[120px] resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {isEn ? "Sending..." : "Envoi en cours..."}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          {isEn ? "Send" : "Envoyer"}
                        </>
                      )}
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

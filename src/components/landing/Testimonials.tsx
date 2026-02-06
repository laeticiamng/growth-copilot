/**
 * Testimonials Section - Social proof with customer quotes
 */
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-500 fill-yellow-500" : "text-muted"
        }`}
        aria-hidden="true"
      />
    ))}
  </div>
);

export function Testimonials() {
  const { t } = useTranslation();

  const testimonials = [
    { key: "t1", initials: "LM", rating: 5, avatarGradient: "bg-gradient-to-br from-primary/20 to-accent/20" },
    { key: "t2", initials: "SB", rating: 5, avatarGradient: "bg-gradient-to-br from-chart-3/20 to-primary/20" },
    { key: "t3", initials: "MD", rating: 5, avatarGradient: "bg-gradient-to-br from-accent/20 to-chart-5/20" },
  ];

  return (
    <section className="py-20 bg-card/30" id="testimonials">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("landing.testimonials.title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("landing.testimonials.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((item) => (
            <Card
              key={item.key}
              className="bg-card border-border/50 hover:border-primary/30 transition-colors"
            >
              <CardContent className="p-6">
                <StarRating rating={item.rating} />
                
                <blockquote className="mt-4 mb-6 text-muted-foreground">
                  "{t(`landing.testimonials.${item.key}.quote`)}"
                </blockquote>

                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className={`${item.avatarGradient} text-primary text-sm font-semibold`}>
                      {item.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{t(`landing.testimonials.${item.key}.name`)}</p>
                    <p className="text-xs text-muted-foreground">
                      {t(`landing.testimonials.${item.key}.role`)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t(`landing.testimonials.${item.key}.company`)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

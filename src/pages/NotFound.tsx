import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, SearchX } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-30" />
        <div className="absolute inset-0 radial-overlay" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-60 h-60 bg-accent/10 rounded-full blur-3xl" />

        <div className="relative z-10 text-center px-4 max-w-lg mx-auto">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-8">
            <SearchX className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-7xl font-bold gradient-text mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-8">
            {t("pages.notFound.description")}
          </p>
          <Link to="/">
            <Button variant="hero" size="lg">
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t("pages.notFound.backHome")}
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;

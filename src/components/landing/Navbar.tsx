import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Zap, Menu, X } from "lucide-react";
import { useState } from "react";
import { LanguageToggle } from "@/components/LanguageToggle";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "#features", label: t("landing.navbar.features") },
    { href: "#departments", label: t("landing.navbar.departments") },
    { href: "#tools", label: t("landing.tools.title") },
    { href: "#pricing", label: t("landing.navbar.pricing") },
  ];

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Growth OS</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={(e) => handleSmoothScroll(e, link.href)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <LanguageToggle />
            <Link to="/auth">
              <Button variant="ghost" size="sm">{t("landing.navbar.login")}</Button>
            </Link>
            <Link to="/auth">
              <Button variant="gradient" size="sm">{t("landing.navbar.getStarted")}</Button>
            </Link>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <LanguageToggle />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <button className="p-2 hover:bg-secondary rounded-lg transition-colors"
                  aria-label={isOpen ? t("landing.navbar.ariaMenuClose") : t("landing.navbar.ariaMenuOpen")}>
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-primary-foreground" />
                    </div>
                    Growth OS
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-8">
                  {navLinks.map((link) => (
                    <a key={link.href} href={link.href} onClick={(e) => handleSmoothScroll(e, link.href)}
                      className="text-base text-muted-foreground hover:text-foreground transition-colors py-3 border-b border-border/30">
                      {link.label}
                    </a>
                  ))}
                  <div className="flex flex-col gap-3 pt-4">
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">{t("landing.navbar.login")}</Button>
                    </Link>
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button variant="gradient" className="w-full">{t("landing.navbar.getStarted")}</Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}

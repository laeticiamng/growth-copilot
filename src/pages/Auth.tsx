import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Loader2, Zap, ArrowLeft, Mail, KeyRound, User, Building2 } from "lucide-react";

export default function Auth() {
  const { t, i18n } = useTranslation();
  // isEn removed — all texts now use t()
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  const tabParam = searchParams.get("tab");
  
  const [activeTab, setActiveTab] = useState<string>(tabParam === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "apple" | null>(null);
  const [errors, setErrors] = useState<{ 
    email?: string; 
    password?: string; 
    confirmPassword?: string;
    fullName?: string;
    companyName?: string;
  }>({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  const { signIn, signUp, resetPassword, updatePassword, user, session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Translations
  const txt = {
    invalidEmail: t("authPage.invalidEmail"),
    minChars: t("authPage.minChars"),
    min2Chars: t("authPage.min2Chars"),
    passwordsMismatch: t("authPage.passwordsMismatch"),
    loginFailed: t("authPage.loginFailed"),
    wrongCredentials: t("authPage.wrongCredentials"),
    confirmEmail: t("authPage.confirmEmail"),
    welcome: t("authPage.welcome"),
    loginSuccess: t("authPage.loginSuccess"),
    signupFailed: t("authPage.signupFailed"),
    accountExists: t("authPage.accountExists"),
    passwordMin: t("authPage.passwordMin"),
    accountCreated: t("authPage.accountCreated"),
    checkEmail: t("authPage.checkEmail"),
    error: t("authPage.error"),
    socialFailed: t("authPage.socialFailed"),
    unexpectedError: t("authPage.unexpectedError"),
    cannotSendReset: t("authPage.cannotSendReset"),
    emailSent: t("authPage.emailSent"),
    checkInbox: t("authPage.checkInbox"),
    cannotUpdate: t("authPage.cannotUpdate"),
    passwordUpdated: t("authPage.passwordUpdated"),
    canNowLogin: t("authPage.canNowLogin"),
    newPassword: t("authPage.newPassword"),
    chooseNewPassword: t("authPage.chooseNewPassword"),
    confirm: t("authPage.confirm"),
    confirmNewPassword: t("authPage.confirmNewPassword"),
    updatePassword: t("authPage.updatePassword"),
    updating: t("authPage.updating"),
    forgotPassword: t("authPage.forgotPassword"),
    enterEmailReset: t("authPage.enterEmailReset"),
    recoveryEmailSent: t("authPage.recoveryEmailSent"),
    checkInboxReset: t("authPage.checkInboxReset"),
    backToLogin: t("authPage.backToLogin"),
    sendLink: t("authPage.sendLink"),
    sending: t("authPage.sending"),
    accessAccount: t("authPage.accessAccount"),
    loginOrSignup: t("authPage.loginOrSignup"),
    login: t("authPage.loginTab"),
    signup: t("authPage.signupTab"),
    emailPlaceholder: t("authPage.emailPlaceholder"),
    forgotPasswordLink: t("authPage.forgotPasswordLink"),
    signInBtn: t("authPage.signInBtn"),
    signingIn: t("authPage.signingIn"),
    or: t("authPage.or"),
    continueWithGoogle: t("authPage.continueWithGoogle"),
    continueWithApple: t("authPage.continueWithApple"),
    fullName: t("authPage.fullName"),
    namePlaceholder: t("authPage.namePlaceholder"),
    companyName: t("authPage.companyName"),
    companyPlaceholder: t("authPage.companyPlaceholder"),
    createAccount: t("authPage.createAccount"),
    creating: t("authPage.creating"),
    confirmPasswordLabel: t("authPage.confirmPasswordLabel"),
    confirmPasswordPlaceholder: t("authPage.confirmPasswordPlaceholder"),
    backToHome: t("authPage.backToHome"),
    terms: t("authPage.terms"),
    privacy: t("authPage.privacy"),
    byContin: t("authPage.byContinuing"),
    and: t("authPage.and"),
  };

  const emailSchema = z.string().email(txt.invalidEmail);
  const passwordSchema = z.string().min(8, txt.minChars);
  const nameSchema = z.string().min(2, txt.min2Chars);

  useEffect(() => {
    if (mode === "reset" && session) {
      setShowForgotPassword(false);
    }
  }, [mode, session]);

  useEffect(() => {
    if (user && mode !== "reset") {
      navigate("/dashboard");
    }
  }, [user, navigate, mode]);

  useEffect(() => {
    setErrors({});
  }, [activeTab]);

  const validateSignInForm = () => {
    const newErrors: typeof errors = {};
    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }
    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.password = e.errors[0].message;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignUpForm = () => {
    const newErrors: typeof errors = {};
    try {
      nameSchema.parse(fullName.trim());
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.fullName = e.errors[0].message;
      }
    }
    try {
      nameSchema.parse(companyName.trim());
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.companyName = e.errors[0].message;
      }
    }
    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }
    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.password = e.errors[0].message;
      }
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = txt.passwordsMismatch;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignInForm()) return;
    
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    
    if (error) {
      let message = txt.loginFailed;
      if (error.message.includes("Invalid login credentials")) {
        message = txt.wrongCredentials;
      } else if (error.message.includes("Email not confirmed")) {
        message = txt.confirmEmail;
      }
      toast({ title: txt.error, description: message, variant: "destructive" });
    } else {
      toast({ title: txt.welcome, description: txt.loginSuccess });
      navigate("/dashboard");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignUpForm()) return;
    
    setLoading(true);
    const { error } = await signUp(email, password);
    setLoading(false);
    
    if (error) {
      let message = txt.signupFailed;
      if (error.message.includes("User already registered")) {
        message = txt.accountExists;
      } else if (error.message.includes("Password")) {
        message = txt.passwordMin;
      }
      toast({ title: txt.error, description: message, variant: "destructive" });
    } else {
      const siteUrl = searchParams.get("url");
      localStorage.setItem("signup_data", JSON.stringify({
        fullName: fullName.trim(),
        companyName: companyName.trim(),
        email: email,
        ...(siteUrl ? { siteUrl } : {}),
      }));
      toast({ title: txt.accountCreated, description: txt.checkEmail });
    }
  };

  const handleSocialLogin = async (provider: "google" | "apple") => {
    setSocialLoading(provider);
    try {
      const { error } = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (error) {
        toast({
          title: txt.error,
          description: `${txt.socialFailed} ${provider === "google" ? "Google" : "Apple"}`,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("[Auth] Social login error:", err);
      toast({ title: txt.error, description: txt.unexpectedError, variant: "destructive" });
    } finally {
      setSocialLoading(null);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      emailSchema.parse(email);
    } catch {
      setErrors({ email: txt.invalidEmail });
      return;
    }
    
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    
    if (error) {
      toast({ title: txt.error, description: txt.cannotSendReset, variant: "destructive" });
    } else {
      setResetEmailSent(true);
      toast({ title: txt.emailSent, description: txt.checkInbox });
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: txt.passwordsMismatch });
      return;
    }
    try {
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors({ password: err.errors[0].message });
        return;
      }
    }
    
    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);
    
    if (error) {
      toast({ title: txt.error, description: txt.cannotUpdate, variant: "destructive" });
    } else {
      toast({ title: txt.passwordUpdated, description: txt.canNowLogin });
      navigate("/dashboard");
    }
  };

  // Password reset mode
  if (mode === "reset" && session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
        <div className="absolute inset-0 hero-grid opacity-30" />
        <div className="absolute inset-0 radial-overlay" />
        <div className="w-full max-w-md relative z-10">
          <Card variant="glass" className="fade-in-up">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="p-2 rounded-lg gradient-bg">
                  <KeyRound className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
              <CardTitle className="text-xl">{txt.newPassword}</CardTitle>
              <CardDescription>{txt.chooseNewPassword}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">{txt.newPassword}</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder={txt.minChars}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={errors.password ? "border-destructive" : ""}
                  />
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-new-password">{txt.confirm}</Label>
                  <Input
                    id="confirm-new-password"
                    type="password"
                    placeholder={txt.confirmNewPassword}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={errors.confirmPassword ? "border-destructive" : ""}
                  />
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                </div>
                <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                  {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{txt.updating}</>
                  ) : (
                    txt.updatePassword
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Forgot password view
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
        <div className="absolute inset-0 hero-grid opacity-30" />
        <div className="absolute inset-0 radial-overlay" />
        <div className="w-full max-w-md relative z-10">
          <button 
            onClick={() => setShowForgotPassword(false)} 
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />{txt.backToLogin}
          </button>
          <Card variant="glass" className="fade-in-up">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="p-2 rounded-lg gradient-bg">
                  <Mail className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
              <CardTitle className="text-xl">{txt.forgotPassword}</CardTitle>
              <CardDescription>
                {resetEmailSent ? txt.recoveryEmailSent : txt.enterEmailReset}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {resetEmailSent ? (
                <div className="text-center space-y-4">
                  <div className="p-4 rounded-lg bg-primary/10 text-primary">
                    <Mail className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">{txt.checkInboxReset}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => { setResetEmailSent(false); setShowForgotPassword(false); }}
                  >
                    {txt.backToLogin}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder={txt.emailPlaceholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                  <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                    {loading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{txt.sending}</>
                    ) : (
                      txt.sendLink
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main auth view
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 hero-grid opacity-30" />
      <div className="absolute inset-0 radial-overlay" />
      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />{txt.backToHome}
        </Link>
        <Card variant="glass" className="fade-in-up">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="p-2 rounded-lg gradient-bg">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold">Growth OS</span>
            </div>
            <CardTitle className="text-xl">{txt.accessAccount}</CardTitle>
            <CardDescription>{txt.loginOrSignup}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">{txt.login}</TabsTrigger>
                <TabsTrigger value="signup">{txt.signup}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder={txt.emailPlaceholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="signin-password">{t("authPage.password")}</Label>
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-xs text-primary hover:underline"
                      >
                        {txt.forgotPasswordLink}
                      </button>
                    </div>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={errors.password ? "border-destructive" : ""}
                    />
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>
                  <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                    {loading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{txt.signingIn}</>
                    ) : (
                      txt.signInBtn
                    )}
                  </Button>

                  <div className="relative my-4">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                      {txt.or}
                    </span>
                  </div>

                  <div className="grid gap-2">
                    <Button type="button" variant="outline" className="w-full" onClick={() => handleSocialLogin("google")} disabled={socialLoading !== null}>
                      {socialLoading === "google" ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      )}
                      {txt.continueWithGoogle}
                    </Button>
                    <Button type="button" variant="outline" className="w-full" onClick={() => handleSocialLogin("apple")} disabled={socialLoading !== null}>
                      {socialLoading === "apple" ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                        </svg>
                      )}
                      {txt.continueWithApple}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-fullname">{txt.fullName}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-fullname"
                        type="text"
                        placeholder={txt.namePlaceholder}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={`pl-10 ${errors.fullName ? "border-destructive" : ""}`}
                      />
                    </div>
                    {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-company">{txt.companyName}</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-company"
                        type="text"
                        placeholder={txt.companyPlaceholder}
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className={`pl-10 ${errors.companyName ? "border-destructive" : ""}`}
                      />
                    </div>
                    {errors.companyName && <p className="text-sm text-destructive">{errors.companyName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder={txt.emailPlaceholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{t("authPage.password")}</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder={txt.minChars}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={errors.password ? "border-destructive" : ""}
                    />
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">{txt.confirmPasswordLabel}</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder={txt.confirmPasswordPlaceholder}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={errors.confirmPassword ? "border-destructive" : ""}
                    />
                    {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                  </div>
                  
                  <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                    {loading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{txt.creating}</>
                    ) : (
                      txt.createAccount
                    )}
                  </Button>

                  <div className="relative my-4">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                      {txt.or}
                    </span>
                  </div>

                  <div className="grid gap-2">
                    <Button type="button" variant="outline" className="w-full" onClick={() => handleSocialLogin("google")} disabled={socialLoading !== null}>
                      {socialLoading === "google" ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      )}
                      {txt.continueWithGoogle}
                    </Button>
                    <Button type="button" variant="outline" className="w-full" onClick={() => handleSocialLogin("apple")} disabled={socialLoading !== null}>
                      {socialLoading === "apple" ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                        </svg>
                      )}
                      {txt.continueWithApple}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
            
            <p className="text-xs text-center text-muted-foreground mt-6">
              {txt.byContin}{" "}
              <Link to="/terms" className="text-primary hover:underline">{txt.terms}</Link>
              {" "}{txt.and}{" "}
              <Link to="/privacy" className="text-primary hover:underline">{txt.privacy}</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

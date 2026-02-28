/**
 * P2 — Chat avec un Agent /dashboard/agent/:slug
 * Real AI responses via ai-gateway edge function
 */
import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Bot,
  Send,
  Loader2,
  CheckCircle2,
  Info,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAgentBySlug, getDepartmentBySlug } from "@/data/agents-catalog";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  id: string;
  role: "agent" | "user";
  content: string;
  timestamp: Date;
}

function buildGreeting(agentName: string, role: string, deptName: string, lang: string): string {
  if (lang === "fr") {
    return `Bonjour ! Je suis ${agentName}, ${role} du département ${deptName}. Comment puis-je vous aider aujourd'hui ?`;
  }
  return `Hello! I'm ${agentName}, ${role} in the ${deptName} department. How can I help you today?`;
}

function buildSystemPrompt(agent: any, department: any, lang: string): string {
  return `You are ${agent.persona.name}, an AI agent with the role "${agent.role.en}" in the ${department.name.en} department of a Growth OS platform.

Your capabilities include: ${agent.capabilities.join(", ")}.
Your risk level is: ${agent.riskLevel}.
${agent.requiresApproval ? "You require approval for actions." : "You can act autonomously on low-risk tasks."}

Respond in ${lang === "fr" ? "French" : "English"}.
Be helpful, specific, and actionable. Reference your specific domain expertise.
Keep responses concise but informative. Use markdown formatting when helpful.`;
}

export default function AgentChat() {
  const { slug } = useParams<{ slug: string }>();
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith("fr") ? "fr" : "en";
  const { currentWorkspace } = useWorkspace();
  const wsId = currentWorkspace?.id;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const agent = getAgentBySlug(slug || "");
  const department = agent ? getDepartmentBySlug(agent.departmentSlug) : null;

  // Send initial greeting
  useEffect(() => {
    if (agent && department && messages.length === 0) {
      setMessages([
        {
          id: "greeting",
          role: "agent",
          content: buildGreeting(agent.persona.name, agent.role[lang], department.name[lang], lang),
          timestamp: new Date(),
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent, department, lang]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping || !agent || !department) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsTyping(true);

    try {
      if (!wsId) throw new Error("No workspace");

      // Build conversation context for the AI
      const conversationHistory = messages
        .filter(m => m.id !== "greeting")
        .map(m => `${m.role === "user" ? "User" : "Agent"}: ${m.content}`)
        .join("\n");

      const { data, error } = await supabase.functions.invoke("ai-gateway", {
        body: {
          workspace_id: wsId,
          agent_name: agent.slug,
          purpose: "analysis" as const,
          input: {
            system_prompt: buildSystemPrompt(agent, department, lang),
            user_prompt: conversationHistory
              ? `Previous conversation:\n${conversationHistory}\n\nUser: ${currentInput}`
              : currentInput,
          },
        },
      });

      if (error) throw error;

      // The ai-gateway returns an artifact with a summary
      const responseText = data?.artifact?.summary
        || data?.summary
        || (lang === "fr" ? "Je traite votre demande. Veuillez réessayer." : "I'm processing your request. Please try again.");

      const agentMessage: ChatMessage = {
        id: `agent-${Date.now()}`,
        role: "agent",
        content: responseText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentMessage]);
    } catch (err: any) {
      console.error("AgentChat error:", err);
      // Fallback message
      const fallback: ChatMessage = {
        id: `agent-${Date.now()}`,
        role: "agent",
        content: lang === "fr"
          ? "Désolé, je rencontre un problème technique. Veuillez réessayer dans quelques instants."
          : "Sorry, I'm experiencing a technical issue. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallback]);
      toast.error(err.message || "Error");
    } finally {
      setIsTyping(false);
    }
  };

  if (!agent || !department) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Bot className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">
          {lang === "fr" ? "Agent introuvable" : "Agent not found"}
        </h2>
        <Link to="/dashboard">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {lang === "fr" ? "Retour au dashboard" : "Back to dashboard"}
          </Button>
        </Link>
      </div>
    );
  }

  const suggestedQuestions = lang === "fr"
    ? [
        "Montre-moi ton dernier rapport",
        "Quelles sont tes recommandations ?",
        "Lance une nouvelle analyse",
      ]
    : [
        "Show me your latest report",
        "What are your recommendations?",
        "Run a new analysis",
      ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Agent Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-border">
        <Link to={`/dashboard/dept/${agent.departmentSlug}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white"
          style={{ backgroundColor: agent.color }}
        >
          {agent.persona.initials}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold">{agent.persona.name}</h1>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground">
            {agent.role[lang]} — {department.name[lang]}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {agent.requiresApproval && (
            <Badge variant="outline" className="text-amber-500 border-amber-500/20">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {lang === "fr" ? "Approbation requise" : "Approval required"}
            </Badge>
          )}
          <Badge
            variant="outline"
            className={cn(
              agent.riskLevel === "low" ? "text-emerald-500" : agent.riskLevel === "medium" ? "text-amber-500" : "text-red-500"
            )}
          >
            {lang === "fr" ? "Risque" : "Risk"}: {agent.riskLevel}
          </Badge>
        </div>
      </div>

      {/* Agent Info Bar */}
      <div className="flex items-center gap-3 py-3 px-4 bg-secondary/30 rounded-lg my-3">
        <Info className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          {lang === "fr"
            ? `${agent.persona.name} est un agent IA du département ${department.name[lang]}. Les réponses sont générées par IA.`
            : `${agent.persona.name} is an AI agent from the ${department.name[lang]} department. Responses are AI-generated.`}
        </p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 py-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3 max-w-[85%]",
              message.role === "user" ? "ml-auto flex-row-reverse" : ""
            )}
          >
            {message.role === "agent" ? (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                style={{ backgroundColor: agent.color }}
              >
                {agent.persona.initials}
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary flex-shrink-0">
                {lang === "fr" ? "Vous" : "You"}
              </div>
            )}
            <div
              className={cn(
                "rounded-2xl px-4 py-3",
                message.role === "agent"
                  ? "bg-secondary/50 border border-border/50"
                  : "bg-primary/10 border border-primary/20"
              )}
            >
              {message.role === "agent" ? (
                <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm leading-relaxed">{message.content}</p>
              )}
              <span className="text-[10px] text-muted-foreground/60 mt-1 block">
                {message.timestamp.toLocaleTimeString(lang === "fr" ? "fr-FR" : "en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
              style={{ backgroundColor: agent.color }}
            >
              {agent.persona.initials}
            </div>
            <div className="bg-secondary/50 border border-border/50 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 pb-3">
          {suggestedQuestions.map((q, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => {
                setInput(q);
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
            >
              <Zap className="w-3 h-3 mr-1" />
              {q}
            </Button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 pt-3 border-t border-border">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={
            lang === "fr"
              ? `Écrivez à ${agent.persona.name}...`
              : `Write to ${agent.persona.name}...`
          }
          disabled={isTyping}
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={!input.trim() || isTyping} size="icon">
          {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>

      <p className="text-center text-[10px] text-muted-foreground/60 py-2">
        &copy; 2026 EmotionsCare SASU — {lang === "fr" ? "Tous droits réservés" : "All rights reserved"}
      </p>
    </div>
  );
}

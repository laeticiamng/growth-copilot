/**
 * P2 — Chat avec un Agent /dashboard/agent/:slug
 * Interface de conversation avec un agent spécifique
 * Réponses pré-scriptées contextuelles par agent
 */
import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
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
import { getAgentGreeting, getAgentResponses } from "@/data/mock-dashboard";

interface ChatMessage {
  id: string;
  role: "agent" | "user";
  content: string;
  timestamp: Date;
}

export default function AgentChat() {
  const { slug } = useParams<{ slug: string }>();
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith("fr") ? "fr" : "en";
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [responseIndex, setResponseIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const agent = getAgentBySlug(slug || "");
  const department = agent ? getDepartmentBySlug(agent.departmentSlug) : null;
  const greeting = getAgentGreeting(slug || "");
  const responses = getAgentResponses(slug || "");

  // Send initial greeting
  useEffect(() => {
    if (agent && messages.length === 0) {
      setMessages([
        {
          id: "greeting",
          role: "agent",
          content: greeting[lang],
          timestamp: new Date(),
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent, lang]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate agent typing and responding
    setTimeout(() => {
      const response = responses[responseIndex % responses.length];
      const agentMessage: ChatMessage = {
        id: `agent-${Date.now()}`,
        role: "agent",
        content: response[lang],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentMessage]);
      setIsTyping(false);
      setResponseIndex((prev) => prev + 1);
    }, 1500 + Math.random() * 1000);
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

  const AgentIcon = agent.icon;

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
              agent.riskLevel === "low"
                ? "text-emerald-500"
                : agent.riskLevel === "medium"
                ? "text-amber-500"
                : "text-red-500"
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
            ? `${agent.persona.name} est un agent IA du département ${department.name[lang]}. Les réponses sont des démonstrations contextuelles.`
            : `${agent.persona.name} is an AI agent from the ${department.name[lang]} department. Responses are contextual demonstrations.`}
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
              <p className="text-sm leading-relaxed">{message.content}</p>
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
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {/* Footer */}
      <p className="text-center text-[10px] text-muted-foreground/60 py-2">
        &copy; 2026 EmotionsCare SASU — {lang === "fr" ? "Tous droits réservés" : "All rights reserved"}
      </p>
    </div>
  );
}

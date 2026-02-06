import { useConversation } from "@elevenlabs/react";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Phone, PhoneOff, Volume2, VolumeX, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface VoiceAssistantProps {
  className?: string;
  agentId?: string;
}

export function VoiceAssistant({ className, agentId }: VoiceAssistantProps) {
  const { t } = useTranslation();
  const { currentWorkspace } = useWorkspace();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<string>("");

  const conversation = useConversation({
    onConnect: () => {
      console.log("[VoiceAssistant] Connected to agent");
      toast.success(t("components.voice.connected"));
    },
    onDisconnect: () => {
      console.log("[VoiceAssistant] Disconnected from agent");
      setTranscript("");
    },
    onMessage: (message) => {
      console.log("[VoiceAssistant] Message:", message);
      const msg = message as unknown as Record<string, unknown>;
      if (msg.user_transcription_event) {
        const event = msg.user_transcription_event as { user_transcript?: string };
        setTranscript(`${t("components.voice.you")} ${event.user_transcript || ''}`);
      } else if (msg.agent_response_event) {
        const event = msg.agent_response_event as { agent_response?: string };
        setTranscript(`${t("components.voice.assistant")} ${event.agent_response || ''}`);
      }
    },
    onError: (error) => {
      console.error("[VoiceAssistant] Error:", error);
      toast.error(t("components.voice.connectionError"));
    },
  });

  const startConversation = useCallback(async () => {
    if (!currentWorkspace?.id) {
      toast.error(t("components.voice.noWorkspace"));
      return;
    }

    setIsConnecting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const { data, error } = await supabase.functions.invoke("elevenlabs-conversation-token", {
        body: { 
          workspace_id: currentWorkspace.id,
          agent_id: agentId 
        },
      });

      if (error) throw error;

      if (!data?.token) {
        throw new Error("No token received");
      }

      await conversation.startSession({
        conversationToken: data.token,
        connectionType: "webrtc",
      });
    } catch (error) {
      console.error("[VoiceAssistant] Failed to start:", error);
      if ((error as Error).name === 'NotAllowedError') {
        toast.error(t("components.voice.micDenied"));
      } else {
        toast.error(t("components.voice.startError"));
      }
    } finally {
      setIsConnecting(false);
    }
  }, [conversation, currentWorkspace?.id, agentId, t]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
    toast.info(t("components.voice.ended"));
  }, [conversation, t]);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  const isConnected = conversation.status === "connected";
  const isSpeaking = conversation.isSpeaking;

  if (!currentWorkspace) return null;

  return (
    <Card className={cn("bg-gradient-to-br from-background to-muted/30 border-primary/20", className)}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-4">
          <Badge 
            variant={isConnected ? "default" : "secondary"}
            className={cn(
              "text-xs",
              isConnected && "bg-primary/20 text-primary border-primary/30"
            )}
          >
            {isConnected ? (isSpeaking ? t("components.voice.listening") : t("components.voice.speakNow")) : t("components.voice.disconnected")}
          </Badge>

          <div className={cn(
            "relative w-24 h-24 rounded-full flex items-center justify-center",
            "transition-all duration-500",
            isConnected 
              ? "bg-gradient-to-br from-primary to-primary/60" 
              : "bg-muted"
          )}>
            {isSpeaking && (
              <>
                <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                <div className="absolute inset-2 rounded-full bg-primary/20 animate-pulse" />
              </>
            )}
            
            {isConnecting ? (
              <Loader2 className="h-10 w-10 text-primary-foreground animate-spin" />
            ) : isConnected ? (
              <Volume2 className={cn(
                "h-10 w-10 text-primary-foreground",
                isSpeaking && "animate-pulse"
              )} />
            ) : (
              <Sparkles className="h-10 w-10 text-muted-foreground" />
            )}
          </div>

          {transcript && (
            <div className="w-full max-w-xs text-center">
              <p className="text-sm text-muted-foreground truncate">{transcript}</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            {isConnected ? (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleMute}
                  className={cn(isMuted && "bg-destructive/10 border-destructive/30")}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={stopConversation}
                  className="gap-2"
                >
                  <PhoneOff className="h-5 w-5" />
                  {t("components.voice.end")}
                </Button>
              </>
            ) : (
              <Button
                size="lg"
                onClick={startConversation}
                disabled={isConnecting}
                className="gap-2 bg-gradient-to-r from-primary to-primary/80"
              >
                {isConnecting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Phone className="h-5 w-5" />
                )}
                {isConnecting ? t("components.voice.connecting") : t("components.voice.talkTo")}
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center max-w-xs">
            {isConnected 
              ? t("components.voice.helpConnected")
              : t("components.voice.helpDisconnected")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

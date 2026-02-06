import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, X, Copy, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { getIntlLocale } from "@/lib/date-locale";

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: unknown;
}

interface ConsoleLogsViewerProps {
  maxLogs?: number;
}

export function ConsoleLogsViewer({ maxLogs = 100 }: ConsoleLogsViewerProps) {
  const { i18n } = useTranslation();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<string | null>(null);

  // Intercept console methods
  useEffect(() => {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalDebug = console.debug;

    const addLog = (level: LogEntry['level'], args: unknown[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      setLogs(prev => {
        const newLogs = [...prev, {
          id: `${Date.now()}-${Math.random()}`,
          timestamp: new Date(),
          level,
          message,
          data: args.length > 1 ? args : args[0],
        }];
        return newLogs.slice(-maxLogs);
      });
    };

    console.log = (...args) => {
      originalLog.apply(console, args);
      addLog('info', args);
    };

    console.warn = (...args) => {
      originalWarn.apply(console, args);
      addLog('warn', args);
    };

    console.error = (...args) => {
      originalError.apply(console, args);
      addLog('error', args);
    };

    console.debug = (...args) => {
      originalDebug.apply(console, args);
      addLog('debug', args);
    };

    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      console.debug = originalDebug;
    };
  }, [maxLogs]);

  const filteredLogs = filter 
    ? logs.filter(log => log.level === filter)
    : logs;

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return 'text-destructive';
      case 'warn': return 'text-amber-500';
      case 'debug': return 'text-muted-foreground';
      default: return 'text-foreground';
    }
  };

  const getLevelBadge = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return 'destructive';
      case 'warn': return 'secondary';
      case 'debug': return 'outline';
      default: return 'default';
    }
  };

  const copyLogs = () => {
    const text = filteredLogs.map(log => 
      `[${log.timestamp.toISOString()}] [${log.level.toUpperCase()}] ${log.message}`
    ).join('\n');
    navigator.clipboard.writeText(text);
    toast.success('Logs copiés dans le presse-papiers');
  };

  const clearLogs = () => {
    setLogs([]);
    toast.success('Logs effacés');
  };

  return (
    <Card variant="feature">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" />
            Console Logs
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {['info', 'warn', 'error', 'debug'].map((level) => (
              <Button
                key={level}
                variant={filter === level ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(filter === level ? null : level)}
                className="text-xs px-2"
              >
                {level}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={copyLogs}>
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={clearLogs}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] bg-secondary/30 rounded-lg p-3 font-mono text-xs">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun log à afficher
            </div>
          ) : (
            <div className="space-y-1">
              {filteredLogs.map((log) => (
                <div key={log.id} className={`flex items-start gap-2 ${getLevelColor(log.level)}`}>
                  <span className="text-muted-foreground shrink-0">
                    {log.timestamp.toLocaleTimeString(getIntlLocale(i18n.language))}
                  </span>
                  <Badge 
                    variant={getLevelBadge(log.level) as any} 
                    className="text-[10px] px-1 py-0 shrink-0"
                  >
                    {log.level.toUpperCase()}
                  </Badge>
                  <span className="break-all">{log.message}</span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

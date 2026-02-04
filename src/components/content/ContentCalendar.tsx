import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  FileText,
  Video,
  ImageIcon,
  Mic,
  Send,
  Edit,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { fr } from "date-fns/locale";

interface ContentItem {
  id: string;
  title: string;
  type: "article" | "video" | "social" | "email" | "podcast";
  date: Date;
  status: "draft" | "scheduled" | "published" | "review";
  platform?: string;
  author?: string;
}

interface ContentCalendarProps {
  content?: ContentItem[];
  onAddContent?: (date: Date) => void;
  onEditContent?: (contentId: string) => void;
}

const DEMO_CONTENT: ContentItem[] = [
  {
    id: "1",
    title: "Guide SEO 2026",
    type: "article",
    date: new Date(),
    status: "scheduled",
    platform: "Blog",
  },
  {
    id: "2",
    title: "Webinaire automation",
    type: "video",
    date: addDays(new Date(), 2),
    status: "draft",
    platform: "YouTube",
  },
  {
    id: "3",
    title: "Newsletter mensuelle",
    type: "email",
    date: addDays(new Date(), 5),
    status: "review",
  },
  {
    id: "4",
    title: "Post LinkedIn",
    type: "social",
    date: addDays(new Date(), 1),
    status: "scheduled",
    platform: "LinkedIn",
  },
];

export function ContentCalendar({ 
  content = DEMO_CONTENT, 
  onAddContent, 
  onEditContent 
}: ContentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const getContentForDate = (date: Date) => {
    return content.filter(item => isSameDay(item.date, date));
  };

  const getTypeIcon = (type: ContentItem['type']) => {
    switch (type) {
      case 'article':
        return <FileText className="w-3 h-3" />;
      case 'video':
        return <Video className="w-3 h-3" />;
      case 'social':
        return <Send className="w-3 h-3" />;
      case 'email':
        return <Send className="w-3 h-3" />;
      case 'podcast':
        return <Mic className="w-3 h-3" />;
      default:
        return <FileText className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: ContentItem['status']) => {
    switch (status) {
      case 'published':
        return 'bg-green-500';
      case 'scheduled':
        return 'bg-blue-500';
      case 'review':
        return 'bg-amber-500';
      case 'draft':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusBadge = (status: ContentItem['status']) => {
    switch (status) {
      case 'published':
        return <Badge variant="success" className="text-xs">Publié</Badge>;
      case 'scheduled':
        return <Badge variant="secondary" className="text-xs">Planifié</Badge>;
      case 'review':
        return <Badge variant="outline" className="text-xs">En revue</Badge>;
      case 'draft':
        return <Badge variant="outline" className="text-xs">Brouillon</Badge>;
      default:
        return null;
    }
  };

  const renderDays = () => {
    const days = [];
    let day = calendarStart;
    
    while (day <= calendarEnd) {
      const currentDay = day;
      const dayContent = getContentForDate(day);
      const isCurrentMonth = isSameMonth(day, currentMonth);
      const isToday = isSameDay(day, new Date());
      const isSelected = selectedDate && isSameDay(day, selectedDate);
      
      days.push(
        <div
          key={day.toString()}
          className={`min-h-[100px] p-1 border-b border-r cursor-pointer transition-colors ${
            !isCurrentMonth ? 'bg-muted/30 text-muted-foreground' :
            isSelected ? 'bg-primary/10' :
            'hover:bg-secondary/50'
          }`}
          onClick={() => setSelectedDate(currentDay)}
        >
          <div className={`flex items-center justify-between p-1 ${
            isToday ? 'bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center' : ''
          }`}>
            <span className="text-sm font-medium">
              {format(day, 'd')}
            </span>
            {dayContent.length > 0 && !isToday && (
              <span className="text-xs text-muted-foreground">
                {dayContent.length}
              </span>
            )}
          </div>
          
          <div className="space-y-1 mt-1">
            {dayContent.slice(0, 2).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-secondary/80 truncate"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditContent?.(item.id);
                }}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(item.status)}`} />
                {getTypeIcon(item.type)}
                <span className="truncate">{item.title}</span>
              </div>
            ))}
            {dayContent.length > 2 && (
              <p className="text-xs text-muted-foreground px-1">
                +{dayContent.length - 2} autres
              </p>
            )}
          </div>
        </div>
      );
      
      day = addDays(day, 1);
    }
    
    return days;
  };

  const selectedDateContent = selectedDate ? getContentForDate(selectedDate) : [];

  return (
    <Card variant="feature">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Calendrier éditorial
            </CardTitle>
            <CardDescription>
              Planification et suivi de vos contenus
            </CardDescription>
          </div>
          {onAddContent && (
            <Button variant="outline" size="sm" onClick={() => onAddContent(selectedDate || new Date())}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          )}
        </div>
        
        {/* Month navigation */}
        <div className="flex items-center justify-between pt-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className="font-semibold capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: fr })}
          </h3>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 border-l border-t rounded-lg overflow-hidden">
          {renderDays()}
        </div>
        
        {/* Selected date details */}
        {selectedDate && (
          <div className="mt-4 p-4 rounded-lg bg-secondary/50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">
                {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
              </h4>
              {onAddContent && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onAddContent(selectedDate)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              )}
            </div>
            
            {selectedDateContent.length > 0 ? (
              <div className="space-y-2">
                {selectedDateContent.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-background cursor-pointer hover:bg-secondary/50"
                    onClick={() => onEditContent?.(item.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        item.type === 'article' ? 'bg-blue-500/10 text-blue-500' :
                        item.type === 'video' ? 'bg-red-500/10 text-red-500' :
                        item.type === 'social' ? 'bg-purple-500/10 text-purple-500' :
                        'bg-gray-500/10 text-gray-500'
                      }`}>
                        {getTypeIcon(item.type)}
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.platform || item.type}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucun contenu planifié
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

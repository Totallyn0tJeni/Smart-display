import { GlassCard } from "@/components/GlassCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, LayoutGrid, List } from "lucide-react";

interface CalendarAppProps {
  onClose: () => void;
}

export function CalendarApp({ onClose }: CalendarAppProps) {
  // Use a simple, authenticated-compatible Google Calendar embed URL
  // The 'src' should ideally be the user's primary calendar once they sign in
  const baseUrl = `https://calendar.google.com/calendar/u/0/embed?showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=0&showCalendars=1&bgcolor=%23ffffff`;

  const VIEWS = [
    { id: "MONTH", label: "Month", icon: LayoutGrid },
    { id: "WEEK", label: "Week", icon: CalendarIcon },
    { id: "AGENDA", label: "Agenda", icon: List },
  ];

  return (
    <div className="w-full h-full flex flex-col p-8 gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <CalendarIcon className="w-8 h-8 text-blue-400" /> My Schedule
        </h2>
        <p className="text-sm text-white/60 italic">Sign in to your Google account in the window below to see your events</p>
      </div>
      
      <Tabs defaultValue="MONTH" className="flex-1 flex flex-col min-h-0">
        <TabsList className="bg-white/5 border-white/10 w-fit p-1 h-12 mb-4">
          {VIEWS.map((view) => (
            <TabsTrigger key={view.id} value={view.id} className="px-6 data-[state=active]:bg-white/10 text-white flex items-center gap-2">
              <view.icon className="w-4 h-4" />
              {view.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {VIEWS.map((view) => (
          <TabsContent key={view.id} value={view.id} className="flex-1 min-h-0 focus-visible:outline-none">
            <GlassCard variant="panel" className="w-full h-full overflow-hidden p-1 bg-white/90">
              <iframe 
                src={`${baseUrl}&mode=${view.id}`}
                style={{ border: 0 }} 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no"
                className="w-full h-full rounded-2xl filter contrast-100"
              ></iframe>
            </GlassCard>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

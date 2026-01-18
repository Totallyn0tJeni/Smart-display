import { GlassCard } from "@/components/GlassCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, LayoutGrid, List, FileText } from "lucide-react";

interface CalendarAppProps {
  onClose: () => void;
}

export function CalendarApp({ onClose }: CalendarAppProps) {
  const baseUrl = `https://calendar.google.com/calendar/embed?showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=0&showCalendars=1&bgcolor=%23ffffff`;

  return (
    <div className="w-full h-full flex flex-col p-8 gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <CalendarIcon className="w-8 h-8 text-blue-400" /> My Schedule
        </h2>
        <div className="text-right">
          <p className="text-sm text-white font-medium bg-blue-600/20 px-3 py-1 rounded-full border border-blue-400/30">
            Click "Sign In" at the top right of the calendar to see your events
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="MONTH" className="flex-1 flex flex-col min-h-0">
        <TabsList className="bg-white/5 border-white/10 w-fit p-1 h-12 mb-4">
          <TabsTrigger value="MONTH" className="px-6 data-[state=active]:bg-white/10 text-white flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" /> Month
          </TabsTrigger>
          <TabsTrigger value="WEEK" className="px-6 data-[state=active]:bg-white/10 text-white flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" /> Week
          </TabsTrigger>
          <TabsTrigger value="AGENDA" className="px-6 data-[state=active]:bg-white/10 text-white flex items-center gap-2">
            <List className="w-4 h-4" /> Agenda
          </TabsTrigger>
          <TabsTrigger value="NOTION" className="px-6 data-[state=active]:bg-white/10 text-white flex items-center gap-2">
            <FileText className="w-4 h-4" /> Notion
          </TabsTrigger>
        </TabsList>

        <TabsContent value="MONTH" className="flex-1 min-h-0 mt-0 focus-visible:outline-none">
          <GlassCard variant="panel" className="w-full h-full overflow-hidden p-1 bg-white/90">
            <iframe 
              src={`${baseUrl}&mode=MONTH`}
              style={{ border: 0 }} 
              width="100%" 
              height="100%" 
              frameBorder="0" 
              scrolling="no"
              allow="token-attribution; identity-credentials-get"
              className="w-full h-full rounded-2xl filter contrast-100"
            />
          </GlassCard>
        </TabsContent>

        <TabsContent value="WEEK" className="flex-1 min-h-0 mt-0 focus-visible:outline-none">
          <GlassCard variant="panel" className="w-full h-full overflow-hidden p-1 bg-white/90">
            <iframe 
              src={`${baseUrl}&mode=WEEK`}
              style={{ border: 0 }} 
              width="100%" 
              height="100%" 
              frameBorder="0" 
              scrolling="no"
              allow="token-attribution; identity-credentials-get"
              className="w-full h-full rounded-2xl filter contrast-100"
            />
          </GlassCard>
        </TabsContent>

        <TabsContent value="AGENDA" className="flex-1 min-h-0 mt-0 focus-visible:outline-none">
          <GlassCard variant="panel" className="w-full h-full overflow-hidden p-1 bg-white/90">
            <iframe 
              src={`${baseUrl}&mode=AGENDA`}
              style={{ border: 0 }} 
              width="100%" 
              height="100%" 
              frameBorder="0" 
              scrolling="no"
              allow="token-attribution; identity-credentials-get"
              className="w-full h-full rounded-2xl filter contrast-100"
            />
          </GlassCard>
        </TabsContent>

        <TabsContent value="NOTION" className="flex-1 min-h-0 mt-0 focus-visible:outline-none">
          <GlassCard variant="panel" className="w-full h-full overflow-hidden bg-white/5 border-white/10">
            <iframe 
              src="https://www.notion.so/3fbf4377980141fc9a03bdaf648af504" 
              width="100%" 
              height="100%" 
              frameBorder="0" 
              className="w-full h-full rounded-2xl"
            />
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

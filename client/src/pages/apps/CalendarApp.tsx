import { GlassCard } from "@/components/GlassCard";

interface CalendarAppProps {
  onClose: () => void;
}

export function CalendarApp({ onClose }: CalendarAppProps) {
  // Using a public holiday calendar as a demo
  const calendarUrl = "https://calendar.google.com/calendar/embed?src=en.usa%23holiday%40group.v.calendar.google.com&ctz=America%2FNew_York&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=0&showCalendars=0&mode=MONTH&bgcolor=%23ffffff";

  return (
    <div className="w-full h-full flex flex-col p-8">
      <div className="flex-1 w-full max-w-6xl mx-auto flex flex-col gap-6">
        <h2 className="text-3xl font-display text-white mb-2">Schedule</h2>
        
        <GlassCard variant="panel" className="flex-1 w-full overflow-hidden p-1 bg-white/80">
          <iframe 
            src={calendarUrl} 
            style={{ border: 0 }} 
            width="100%" 
            height="100%" 
            frameBorder="0" 
            scrolling="no"
            className="w-full h-full rounded-2xl filter contrast-100 grayscale-[0.2]"
          ></iframe>
        </GlassCard>
      </div>
    </div>
  );
}

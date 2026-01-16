import { useState, useEffect } from "react";
import { format } from "date-fns";
import { GlassCard } from "./GlassCard";

export function ClockWidget() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-white select-none">
      <h1 className="text-8xl md:text-9xl font-display font-light tracking-tighter text-glow">
        {format(time, "HH:mm")}
      </h1>
      <p className="text-xl md:text-2xl font-light opacity-80 mt-2 uppercase tracking-widest">
        {format(time, "EEEE, MMMM do")}
      </p>
    </div>
  );
}

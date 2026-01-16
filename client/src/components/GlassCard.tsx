import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  variant?: "panel" | "card" | "button";
}

export function GlassCard({ children, className, variant = "card", ...props }: GlassCardProps) {
  const baseStyles = {
    panel: "bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl",
    card: "bg-white/5 backdrop-blur-md border border-white/10 shadow-lg rounded-2xl hover:bg-white/10 transition-colors duration-300",
    button: "bg-white/10 hover:bg-white/20 active:bg-white/5 backdrop-blur-sm border border-white/20 transition-all duration-200 shadow-md hover:shadow-lg rounded-xl cursor-pointer select-none",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(baseStyles[variant], className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

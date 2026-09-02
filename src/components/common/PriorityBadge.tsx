import React from "react";
import { TaskPriority } from "../../types";
import { AlertTriangle, ArrowUp, Minus, ArrowDown } from "lucide-react";

interface PriorityBadgeProps {
  priority: TaskPriority;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = "md",
  showIcon = true,
}) => {
  const getStyles = () => {
    switch (priority) {
      case "Urgent":
        return {
          bg: "bg-rose-500/15 border-rose-500/40 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.25)]",
          dot: "bg-rose-400 animate-pulse",
          icon: AlertTriangle,
        };
      case "High":
        return {
          bg: "bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]",
          dot: "bg-amber-400",
          icon: ArrowUp,
        };
      case "Medium":
        return {
          bg: "bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)]",
          dot: "bg-cyan-400",
          icon: Minus,
        };
      case "Low":
      default:
        return {
          bg: "bg-slate-500/15 border-slate-500/30 text-slate-300",
          dot: "bg-slate-400",
          icon: ArrowDown,
        };
    }
  };

  const style = getStyles();
  const Icon = style.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1 font-medium",
    md: "px-2.5 py-1 text-xs gap-1.5 font-semibold",
    lg: "px-3 py-1.5 text-sm gap-2 font-semibold",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border backdrop-blur-md transition-all ${style.bg} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {showIcon && <Icon className="w-3 h-3" />}
      <span>{priority}</span>
    </span>
  );
};

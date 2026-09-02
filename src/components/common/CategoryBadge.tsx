import React from "react";
import { TaskCategory } from "../../types";
import {
  GraduationCap,
  Briefcase,
  DollarSign,
  User,
  ShoppingBag,
  HeartPulse,
  Folder,
} from "lucide-react";

interface CategoryBadgeProps {
  category: TaskCategory;
  size?: "sm" | "md" | "lg";
  variant?: "badge" | "chip" | "iconOnly";
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = "md",
  variant = "badge",
}) => {
  const getCategoryConfig = () => {
    switch (category) {
      case "College":
        return {
          icon: GraduationCap,
          color: "text-purple-300",
          bg: "bg-purple-500/15 border-purple-500/30",
          glow: "shadow-[0_0_10px_rgba(168,85,247,0.2)]",
        };
      case "Work":
        return {
          icon: Briefcase,
          color: "text-blue-300",
          bg: "bg-blue-500/15 border-blue-500/30",
          glow: "shadow-[0_0_10px_rgba(59,130,246,0.2)]",
        };
      case "Finance":
        return {
          icon: DollarSign,
          color: "text-emerald-300",
          bg: "bg-emerald-500/15 border-emerald-500/30",
          glow: "shadow-[0_0_10px_rgba(16,185,129,0.2)]",
        };
      case "Personal":
        return {
          icon: User,
          color: "text-cyan-300",
          bg: "bg-cyan-500/15 border-cyan-500/30",
          glow: "shadow-[0_0_10px_rgba(6,182,212,0.2)]",
        };
      case "Shopping":
        return {
          icon: ShoppingBag,
          color: "text-amber-300",
          bg: "bg-amber-500/15 border-amber-500/30",
          glow: "shadow-[0_0_10px_rgba(245,158,11,0.2)]",
        };
      case "Health":
        return {
          icon: HeartPulse,
          color: "text-rose-300",
          bg: "bg-rose-500/15 border-rose-500/30",
          glow: "shadow-[0_0_10px_rgba(244,63,94,0.2)]",
        };
      case "Other":
      default:
        return {
          icon: Folder,
          color: "text-slate-300",
          bg: "bg-slate-500/15 border-slate-500/30",
          glow: "",
        };
    }
  };

  const config = getCategoryConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2",
  };

  if (variant === "iconOnly") {
    return (
      <div
        className={`inline-flex items-center justify-center p-1.5 rounded-lg border ${config.bg} ${config.color} ${config.glow}`}
        title={category}
      >
        <Icon className="w-3.5 h-3.5" />
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-lg border backdrop-blur-md transition-all ${config.bg} ${config.color} ${config.glow} ${sizeClasses[size]}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span className="whitespace-nowrap">{category}</span>
    </span>
  );
};

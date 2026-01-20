import { Check, AlertTriangle, X, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "pass" | "warn" | "fail" | "locked" | "pending";

interface StatusBadgeProps {
  status: Status;
  label?: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, label, size = "md" }: StatusBadgeProps) {
  const config = {
    pass: {
      icon: Check,
      className: "status-badge-pass",
      defaultLabel: "Pass",
    },
    warn: {
      icon: AlertTriangle,
      className: "status-badge-warn",
      defaultLabel: "Warn",
    },
    fail: {
      icon: X,
      className: "status-badge-fail",
      defaultLabel: "Fail",
    },
    locked: {
      icon: Lock,
      className: "status-badge-locked",
      defaultLabel: "Locked",
    },
    pending: {
      icon: null,
      className: "bg-muted text-muted-foreground",
      defaultLabel: "Pending",
    },
  };

  const { icon: Icon, className, defaultLabel } = config[status];

  return (
    <span
      className={cn(
        "status-badge",
        className,
        size === "sm" && "text-[10px] px-1.5 py-0.5"
      )}
    >
      {Icon && <Icon className={cn("w-3 h-3", size === "sm" && "w-2.5 h-2.5")} />}
      {label ?? defaultLabel}
    </span>
  );
}

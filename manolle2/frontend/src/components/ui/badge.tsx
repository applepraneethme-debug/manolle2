import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-[#00F0FF]/30 bg-[#00F0FF]/10 text-[#00F0FF]",
        secondary: "border-white/10 bg-white/5 text-[#A1A1AA]",
        destructive: "border-red-500/30 bg-red-500/10 text-red-400",
        success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        warning: "border-amber-500/30 bg-amber-500/10 text-amber-400",
        outline: "border-white/10 text-white",
        running: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        paused: "border-amber-500/30 bg-amber-500/10 text-amber-400",
        completed: "border-[#00F0FF]/30 bg-[#00F0FF]/10 text-[#00F0FF]",
        draft: "border-white/10 bg-white/5 text-[#71717A]",
        new: "border-[#0066FF]/30 bg-[#0066FF]/10 text-[#60A5FA]",
        contacted: "border-amber-500/30 bg-amber-500/10 text-amber-400",
        qualified: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        unqualified: "border-red-500/30 bg-red-500/10 text-red-400",
        booked: "border-[#00F0FF]/30 bg-[#00F0FF]/10 text-[#00F0FF]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

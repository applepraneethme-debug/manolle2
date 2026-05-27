import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-white/10 bg-[#0A0A0A] px-3 py-2 text-sm text-white shadow-sm placeholder:text-[#71717A] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00F0FF] focus-visible:border-[#00F0FF]/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };

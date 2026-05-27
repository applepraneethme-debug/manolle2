import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00F0FF] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#00F0FF] text-black hover:bg-[#00F0FF]/90 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] active:scale-[0.98]",
        destructive:
          "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20",
        outline:
          "border border-white/10 bg-transparent text-white hover:bg-white/5 hover:border-white/20",
        secondary:
          "bg-white/5 border border-white/10 text-white hover:bg-white/10",
        ghost: "text-[#A1A1AA] hover:text-white hover:bg-white/5",
        link: "text-[#00F0FF] underline-offset-4 hover:underline",
        cyan: "bg-[#00F0FF] text-black hover:bg-[#00F0FF]/90 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] active:scale-[0.98] font-semibold",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-8 text-base",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

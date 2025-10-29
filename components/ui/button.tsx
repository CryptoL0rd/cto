import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly asChild?: boolean;
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-[#8e66ff] to-[#ff6fd8] text-background shadow-lg shadow-purple-500/30 hover:from-[#a488ff] hover:to-[#ff8fe4] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#ff6fd8]",
  secondary:
    "bg-secondary/60 text-secondary-foreground border border-border hover:bg-secondary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-secondary",
  ghost:
    "bg-transparent text-foreground hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-foreground",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-10 px-5 text-sm",
  lg: "h-11 px-6 text-base",
  icon: "h-10 w-10",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      asChild = false,
      type = "button",
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : type}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-medium transition duration-200 ease-out focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

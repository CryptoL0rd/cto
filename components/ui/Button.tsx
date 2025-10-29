import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", children, ...props },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed";

    const variantStyles = {
      primary:
        "bg-gradient-to-r from-cosmic-500 to-cosmic-700 text-white hover:from-cosmic-600 hover:to-cosmic-800 hover:shadow-glow-cosmic focus:ring-cosmic-500",
      secondary:
        "bg-gradient-to-r from-galaxy-500 to-galaxy-700 text-white hover:from-galaxy-600 hover:to-galaxy-800 hover:shadow-glow-galaxy focus:ring-galaxy-500",
      outline:
        "bg-transparent border-2 border-cosmic-500 text-cosmic-400 hover:bg-cosmic-500/10 hover:shadow-glow-cosmic focus:ring-cosmic-500",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    const glowEffect =
      variant !== "outline"
        ? "hover:scale-105 shadow-lg hover:shadow-xl"
        : "hover:scale-105";

    return (
      <button
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          glowEffect,
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;

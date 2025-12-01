"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
  as?: any;
  href?: string;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  className = "",
  disabled,
  as,
  href,
  ...props
}: ButtonProps) {
  const baseStyles = "font-semibold rounded-xl sm:rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group";
  
  const variants = {
    primary: "bg-gradient-primary hover:bg-gradient-primary-dark text-white shadow-neon-sm hover:shadow-neon hover:scale-[1.02] active:scale-[0.98]",
    secondary: "glass border-2 border-dark-border/50 text-dark-text hover:border-neon-green/50 hover:text-neon-green hover:shadow-neon-sm hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm",
    outline: "bg-transparent border-2 border-dark-border/50 text-dark-text2 hover:border-neon-green hover:text-neon-green hover:bg-neon-green/10 hover:scale-[1.02] active:scale-[0.98]",
    danger: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
  };

  const sizes = {
    sm: "px-5 py-2.5 text-sm",
    md: "px-7 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`;

  if (as === "a" || href) {
    const Component = as || "a";
    return (
      <Component
        href={href}
        className={classes}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Đang xử lý...</span>
          </>
        ) : (
          <>
            <span className="relative z-10 flex items-center gap-2">{children}</span>
            {variant === "primary" && (
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>
            )}
          </>
        )}
      </Component>
    );
  }

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Đang xử lý...</span>
        </>
      ) : (
        <>
          <span className="relative z-10 flex items-center gap-2">{children}</span>
          {variant === "primary" && (
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>
          )}
        </>
      )}
    </button>
  );
}

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
  const baseStyles = "font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-neon-green hover:bg-neon-green-light text-white shadow-neon-sm hover:shadow-neon hover:scale-[1.03] active:scale-95",
    secondary: "bg-dark-card border-2 border-dark-border text-dark-text hover:border-neon-green hover:text-neon-green hover:scale-[1.03] active:scale-95",
    outline: "bg-transparent border-2 border-dark-border text-dark-text2 hover:border-neon-green hover:text-neon-green hover:scale-[1.03] active:scale-95",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-95",
  };

  const sizes = {
    sm: "px-5 py-2.5 text-sm",
    md: "px-7 py-3 text-base",
    lg: "px-8 py-3.5 text-lg",
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
          children
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
        children
      )}
    </button>
  );
}

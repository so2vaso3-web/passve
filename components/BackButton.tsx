"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  href?: string;
  label?: string;
  onClick?: () => void;
}

export function BackButton({ href, label = "Quay lại", onClick }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  const buttonContent = (
    <button
      onClick={handleClick}
      className="group inline-flex items-center gap-2 px-4 py-2.5 bg-dark-card hover:bg-dark-border border border-dark-border hover:border-neon-green rounded-xl text-dark-text2 hover:text-neon-green font-semibold transition-all hover:shadow-neon-sm hover:scale-[1.02] active:scale-[0.98]"
    >
      <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
      <span>{label}</span>
    </button>
  );

  if (href && !onClick) {
    return (
      <Link
        href={href}
        className="group inline-flex items-center gap-2 px-4 py-2.5 bg-dark-card hover:bg-dark-border border border-dark-border hover:border-neon-green rounded-xl text-dark-text2 hover:text-neon-green font-semibold transition-all hover:shadow-neon-sm hover:scale-[1.02] active:scale-[0.98]"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span>{label}</span>
      </Link>
    );
  }

  return buttonContent;
}




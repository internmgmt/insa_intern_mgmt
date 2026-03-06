"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";

interface LogoBlockProps {
  showText?: boolean;
}

export function LogoBlock({ showText = true }: LogoBlockProps) {
  const [imageError, setImageError] = useState(false);
  const { user } = useAuth();

  const getPortalName = () => {
    if (!user) return "Portal";
    switch (user.role) {
      case "ADMIN":
        return "Admin Portal";
      case "UNIVERSITY":
        return "Coordinator";
      case "SUPERVISOR":
        return "Supervisor";
      case "MENTOR":
        return "Mentor";
      case "INTERN":
        return "Intern";
      default:
        return "Portal";
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-transparent">
        {!imageError ? (
          <img
            src="/logo.png"
            alt="INSA Logo"
            className="h-full w-full object-contain p-0.5"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="bg-primary text-primary-foreground font-bold text-sm w-full h-full flex items-center justify-center">
            INSA
          </div>
        )}
      </div>

      <div className={cn(
        "flex flex-col transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]",
        showText
          ? "opacity-100 translate-x-0 visible"
          : "opacity-0 -translate-x-4 invisible pointer-events-none w-0"
      )}>
        <div className="font-bold text-base leading-none tracking-tight text-foreground whitespace-nowrap">INSA</div>
        <div className="text-[10px] uppercase font-bold text-muted-foreground/80 tracking-widest mt-0.5 whitespace-nowrap">
          {getPortalName()}
        </div>
      </div>
    </div>
  );
}





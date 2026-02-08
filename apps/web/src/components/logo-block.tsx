"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function LogoBlock() {
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
      case "INTERN":
        return "Intern";
      default:
        return "Portal";
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white border shadow-sm">
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

      <div className="flex flex-col">
        <div className="font-bold text-base leading-none tracking-tight text-foreground">INSA</div>
        <div className="text-[10px] uppercase font-bold text-muted-foreground/80 tracking-widest mt-0.5">
          {getPortalName()}
        </div>
      </div>
    </div>
  );
}

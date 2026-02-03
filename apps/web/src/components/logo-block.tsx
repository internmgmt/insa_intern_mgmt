"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function LogoBlock() {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10">
        {!imageError && (
          <AvatarImage
            src="/logo.png"
            alt="INSA Logo"
            className="object-contain p-1"
            onError={() => setImageError(true)}
          />
        )}
        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
          IN
        </AvatarFallback>
      </Avatar>

      <div>
        <div className="font-semibold text-lg leading-tight">INSA</div>
        <div className="text-xs text-muted-foreground">Portal</div>
      </div>
    </div>
  );
}

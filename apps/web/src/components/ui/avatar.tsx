import * as React from "react";
import { cn } from "@/lib/utils";

function Avatar({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="avatar"
      className={cn('inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted', className)}
      {...props}
    />
  );
}

function AvatarImage({ className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={cn('h-full w-full object-cover', className)} {...props} />
  );
}

function AvatarFallback({ className, children, ...props }: React.ComponentProps<'span'>) {
  return (
    <span className={cn('flex h-full w-full items-center justify-center text-sm font-medium text-muted-foreground', className)} {...props}>
      {children}
    </span>
  );
}

export { Avatar, AvatarImage, AvatarFallback };

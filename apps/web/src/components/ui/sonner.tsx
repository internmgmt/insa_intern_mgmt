"use client"

import { CheckCircle2, Info, AlertTriangle, XCircle, Loader2 } from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CheckCircle2 className="size-4 text-emerald-500" />,
        info: <Info className="size-4 text-blue-500" />,
        warning: <AlertTriangle className="size-4 text-amber-500" />,
        error: <XCircle className="size-4 text-destructive" />,
        loading: <Loader2 className="size-4 animate-spin text-muted-foreground" />,
      }}
      style={
        {
          "--normal-bg": "rgb(var(--popover))",
          "--normal-text": "rgb(var(--popover-foreground))",
          "--normal-border": "rgb(var(--border))",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }

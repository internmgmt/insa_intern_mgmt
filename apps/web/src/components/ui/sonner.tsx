"use client"

// Use simple emoji placeholders here to avoid lucide-react import issues
// Replace with lucide icons once the package resolution is fixed
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <span className="size-4">✅</span>,
        info: <span className="size-4">ℹ️</span>,
        warning: <span className="size-4">⚠️</span>,
        error: <span className="size-4">⛔</span>,
        loading: <span className="size-4 animate-spin">⏳</span>,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }

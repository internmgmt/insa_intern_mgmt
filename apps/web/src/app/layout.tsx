import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import ToasterClient from "@/components/toaster-client";

export const metadata: Metadata = {
  title: "INSA Intern Management System",
  description: "Intern management portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased"
      >
        <Providers>
          {children}
          <ToasterClient />
        </Providers>
      </body>
    </html>
  );
}


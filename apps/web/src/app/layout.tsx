import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import ToasterClient from "@/components/toaster-client";
import { Roboto, JetBrains_Mono } from "next/font/google";

// Import Roboto font with multiple weights for better typography
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

// Import JetBrains Mono for code blocks
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "INSA Intern Management System",
  description: "Intern management portal",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${roboto.variable} ${jetbrainsMono.variable}`}>
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


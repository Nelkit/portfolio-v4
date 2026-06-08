import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Nelkit Chavez — Software/ML/AI Engineer",
  description: "Building AI products that actually ship.",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="plum" data-skin="terminal">
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
            style={{
              fontFamily: "var(--font-space-grotesk, var(--font-sans))",
            }}>
        {children}
      </body>
    </html>
  );
}

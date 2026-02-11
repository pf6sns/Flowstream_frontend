import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: " Flowstream — Agentic AI Incident Automation",
  description:
    " Flowstream automates your entire incident lifecycle with Agentic AI — from email to resolution. Faster MTTR, zero manual triage.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} antialiased bg-white`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}

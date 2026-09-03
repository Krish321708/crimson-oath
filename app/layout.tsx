import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Crimson Oath — An Interactive Chronicle",
  description:
    "Enter Caer Veyl and discover a cinematic medieval chronicle of honour, memory, and the promise that outlived a crown.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}

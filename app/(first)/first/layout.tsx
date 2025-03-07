// app/layout.tsx
import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "SUI Token Checker",
  description: "Check SUI token details with flair",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-800 font-arial text-white">
        {children}
      </body>
    </html>
  );
}
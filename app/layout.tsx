import Navbar from "@/components/second/navbar";
import type { LayoutProps } from "@/lib/types";
import clsx from "clsx";
import type { Metadata } from "next";
import { Commissioner } from "next/font/google";
import "@/app/globals.css";
import { Analytics } from "@vercel/analytics/react";
import NextTopLoader from "nextjs-toploader";
import ReactQueryProvider from "@/context/react-query";

export const metadata: Metadata = {
  title: "Voysa - SUI Token Checker",
  description: "Check SUI token",
};

const comissioner = Commissioner({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-comissioner",
});

export default function SecondLayout({ children }: LayoutProps) {
  return (
    <ReactQueryProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={clsx(
            comissioner.variable,
            "font-comissioner bg-[#eee]"
          )}
        >
          <NextTopLoader showSpinner={false} color="hsl(176, 50%, 47%)" />
          <Navbar />
          <main className="mt-24 mb-8 space-y-5">{children}</main>
          <Analytics />
        </body>
      </html>
    </ReactQueryProvider>
  );
}

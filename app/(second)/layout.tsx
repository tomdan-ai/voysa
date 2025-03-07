import Navbar from "@/components/second/navbar";
import type { LayoutProps } from "@/lib/types";
import clsx from "clsx";
import type { Metadata } from "next";
import { Commissioner } from "next/font/google";
import "@/app/globals.css";

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
    <html lang="en">
      <body
        className={clsx(
          comissioner.variable,
          "font-comissioner bg-[#eee]"
        )}
      >
        <Navbar />
        <main className="mt-24 space-y-5">
          {children}
        </main>
      </body>
    </html>
  );
}

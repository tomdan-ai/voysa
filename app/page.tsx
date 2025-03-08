import MetricCard from "@/components/MetricCard";
import TokenForm from "@/components/TokenForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3, ShieldCheck, TrendingUp } from "lucide-react";
import { Suspense } from "react";


export default async function Home() {
  return (
    <>
      <Card className="app-card">
        <CardHeader className="space-y-4">
          <CardTitle className="text-center text-2xl font-bold">
            Voysa – Trade Smarter, Spot the Scams
          </CardTitle>
          <CardDescription className="text-center">
            A powerful on-chain watchdog for SUI, giving you instant fraud
            detection and pump potential scores—because every trader deserves an
            edge.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Metrics Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full">
            <MetricCard icon={BarChart3} value="12,845" label="Tokens Vetted" />
            <MetricCard
              icon={ShieldCheck}
              value="2,319"
              label="Trusted Tokens"
            />
            <MetricCard
              icon={TrendingUp}
              value="68%"
              label="Avg. Fraud Score"
            />
          </div>
        </CardContent>
      </Card>
      <Card className="app-card">
        <CardHeader className="font-bold text-black">About Voysa</CardHeader>
        <CardContent className="space-y-4">
          <p>
            Blockchain trading is exciting but risky. Scams and rug pulls make
            it hard to trust new tokens. Voysa is built to change that.
          </p>
          <p>
            By leveraging Move smart contracts and real-time data, we provide
            transparent fraud analysis and growth potential scores.
          </p>
          <p>
            Designed for both traders and developers, Voysa ensures every trade
            is backed by reliable, on-chain insights—helping you make smarter
            moves with confidence.
          </p>
        </CardContent>
      </Card>
      <Suspense key="token-form">
        <TokenForm />
      </Suspense>
    </>
  );
}

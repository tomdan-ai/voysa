"use client"

// components/TokenAnalysis/HistoricalCharts.tsx
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface HistoricalChartsProps {
  fraudData: { day: number; value: number }[];
  cookData: { day: number; value: number }[];
}

export default function HistoricalCharts({ fraudData, cookData }: HistoricalChartsProps) {
  const labels: string[] = fraudData.map((item) => `Day ${item.day}`);

  const chartData: ChartData<'line'> = {
    labels,
    datasets: [
      {
        label: 'Fraud Likelihood',
        data: fraudData.map((item) => item.value),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
      },
      {
        label: 'Cook Potential',
        data: cookData.map((item) => item.value),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '14-Day Token Analysis History',
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        title: {
          display: true,
          text: 'Score (%)',
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Historical Analysis</h2>
      <div className="h-80">
        <Line options={options} data={chartData} />
      </div>
    </div>
  );
}
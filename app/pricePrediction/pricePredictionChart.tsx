// pricePrediction/PricePredictionChart.tsx
import dynamic from "next/dynamic";
import React from "react";

// Carga dinámica del componente Plotly
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface PricePredictionChartProps {
  plot: any;
}

export default function PricePredictionChart({ plot }: PricePredictionChartProps) {
  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 mt-8">
      <h2 className="text-xl font-semibold mb-4">Resultado de la simulación</h2>
      <div className="w-full h-[600px]">
        <Plot
          data={plot.data}
          layout={{
            ...plot.layout,
            autosize: true,
            width: undefined,
            height: undefined,
            margin: { t: 50, l: 50, r: 50, b: 50 },
          }}
          useResizeHandler
          style={{ width: "100%", height: "100%" }}
          config={{ responsive: true }}
        />
      </div>
    </div>
  );
}

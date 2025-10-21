import React from "react";
import { ResponsiveBar } from "@nivo/bar";

interface HistogramData {
  rango: string;
  valor: number;
  [key: string]: string | number
}

interface PriceHistogramProps {
  data: HistogramData[];
}

const PriceHistogram: React.FC<PriceHistogramProps> = ({ data }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-gray-600">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">
      FOB Unit Price Distribution
    </h2>
    <div style={{ height: "400px" }}>
      <ResponsiveBar
        data={data}
        keys={["valor"]}
        indexBy="rango"
        margin={{ top: 20, right: 30, bottom: 80, left: 80 }}
        padding={0.3}
        valueScale={{ type: "linear" }}
        colors="#3b82f6"
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
          legend: "Price Range",
          legendPosition: "middle",
          legendOffset: 60,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          legend: "FOB Value",
          legendPosition: "middle",
          legendOffset: -60,
          format: (v) => `$${(v / 1000).toFixed(0)}K`,
        }}
        tooltip={({ value }) => (
          <div className="bg-white px-3 py-2 shadow-lg rounded border border-gray-200">
            <strong>
              ${value.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </strong>
          </div>
        )}
      />
    </div>
  </div>
);

export default PriceHistogram;

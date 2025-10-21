import React from "react";
import { ResponsiveBar } from "@nivo/bar";
import { ChartDataPoint } from "@/types/analytics";

interface Props {
  data: ChartDataPoint[];
  keys: string[];
  colors: string[];
}

const TopImportersBarChart: React.FC<Props> = ({ data, keys, colors }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-gray-600">
      <div style={{ height: "500px" }}>
        <ResponsiveBar
          data={data}
          keys={keys}
          indexBy="importador"
          colors={colors}
          margin={{ top: 40, right: 20, bottom: 80, left: 60 }}
          padding={0.3}
          valueScale={{ type: "linear" }}
          indexScale={{ type: "band", round: true }}
          borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
          axisBottom={{
            tickRotation: -45,
            legend: "Importer",
            legendPosition: "middle",
            legendOffset: 60,
          }}
          axisLeft={{
            legend: "Quantity",
            legendPosition: "middle",
            legendOffset: -50,
          }}
          theme={{
            text: { fontSize: 12, fill: "#6b7280" },
          }}
        />
      </div>
    </div>
  );
};

export default TopImportersBarChart;

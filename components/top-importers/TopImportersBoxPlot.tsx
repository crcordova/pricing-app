import React from "react";
import { ResponsiveBoxPlot } from "@nivo/boxplot";
import { DollarSign } from "lucide-react";

interface BoxPlotData {
  group: string;
  value: number;
  [key: string]: string | number | undefined;
}

interface Props {
  data: BoxPlotData[];
  loading: boolean;
}

const TopImportersBoxPlot: React.FC<Props> = ({ data, loading }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-gray-600">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          FOB Unit Price Distribution by Importer
        </h3>
      </div>

      {loading ? (
        <div className="h-96 flex items-center justify-center text-gray-400">
          Loading price data...
        </div>
      ) : data.length > 0 ? (
        <div style={{ height: "500px" }}>
          <ResponsiveBoxPlot
            data={data as any}
            margin={{ top: 60, right: 80, bottom: 100, left: 80 }}
            padding={0.12}
            innerPadding={3}
            colors={{ scheme: "set2" }}
            axisBottom={{
              tickRotation: -45,
              legend: "Importer",
              legendOffset: 80,
            }}
            axisLeft={{
              legend: "FOB Unit Price (USD)",
              legendOffset: -60,
            }}
            theme={{
              text: { fontSize: 12, fill: "#6b7280" },
            }as any}
          />
        </div>
      ) : (
        <div className="h-96 flex items-center justify-center text-gray-400">
          No price data available
        </div>
      )}
    </div>
  );
};

export default TopImportersBoxPlot;

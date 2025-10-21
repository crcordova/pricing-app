import React from "react";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";

interface SerieTemporal {
  periodo: string;
  fob_unit_max: number;
  fob_unit_min: number;
  fob_unit_promedio_ponderado: number;
  cantidad_total: number;
}

interface PriceEvolutionData {
  producto: string;
  serie_temporal: SerieTemporal[];
}

interface PriceEvolutionProps {
  data: PriceEvolutionData;
}

const PriceEvolution: React.FC<PriceEvolutionProps> = ({ data }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-gray-600">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">
      Price Evolution - {data.producto}
    </h2>

    {/* Line Chart */}
    <div style={{ height: "400px" }} className="mb-6">
      <ResponsiveLine
        data={[
          {
            id: "Max Price",
            data: data.serie_temporal.map((d) => ({ x: d.periodo, y: d.fob_unit_max })),
          },
          {
            id: "Average Price",
            data: data.serie_temporal.map((d) => ({ x: d.periodo, y: d.fob_unit_promedio_ponderado })),
          },
          {
            id: "Min Price",
            data: data.serie_temporal.map((d) => ({ x: d.periodo, y: d.fob_unit_min })),
          },
        ]}
        margin={{ top: 20, right: 120, bottom: 50, left: 60 }}
        xScale={{ type: "point" }}
        yScale={{ type: "linear", min: "auto", max: "auto", stacked: false }}
        curve="monotoneX"
        axisBottom={{
          tickRotation: -45,
          legend: "Period",
          legendOffset: 40,
        }}
        axisLeft={{
          legend: "FOB Unit Price",
          legendOffset: -50,
          format: (v) => `$${v.toFixed(2)}`,
        }}
        enableArea
        areaOpacity={0.1}
        colors={["#ef4444", "#8b5cf6", "#10b981"]}
        pointSize={6}
        useMesh
        legends={[
          {
            anchor: "bottom-right",
            direction: "column",
            translateX: 100,
            itemWidth: 80,
            itemHeight: 20,
            symbolSize: 12,
          },
        ]}
      />
    </div>

    {/* Volume Chart */}
    <div style={{ height: "250px" }}>
      <ResponsiveBar
        data={data.serie_temporal.map((d) => ({
          periodo: d.periodo,
          cantidad: d.cantidad_total,
        }))}
        keys={["cantidad"]}
        indexBy="periodo"
        margin={{ top: 20, right: 30, bottom: 50, left: 80 }}
        padding={0.3}
        valueScale={{ type: "linear" }}
        colors="#10b981"
        axisBottom={{
          tickRotation: -45,
          legend: "Period",
          legendOffset: 40,
        }}
        axisLeft={{
          legend: "Total Volume",
          legendOffset: -60,
          format: (v) => v.toLocaleString(),
        }}
      />
    </div>
  </div>
);

export default PriceEvolution;

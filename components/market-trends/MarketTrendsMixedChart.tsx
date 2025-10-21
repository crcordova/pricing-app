import { ResponsiveLine } from '@nivo/line';
import React from "react";
import type { MarketTrendsMixedChartProps } from "@/types/analytics";
import { ResponsiveBar } from '@nivo/bar'

const MarketTrendsMixedChart: React.FC<MarketTrendsMixedChartProps> = ({ data }) => {
    const barData = data.serie_temporal.map((d) => ({
      periodo: d.periodo,
      cantidad_total: d.cantidad_total,
    }));

    const lineData = [
      {
        id: "FOB Total",
        data: data.serie_temporal.map((d) => ({
          x: d.periodo,
          y: d.fob_total,
        })),
      },
    ];

    return (
      <div className="relative h-full">
        {/* Ejes y layout compartido */}
        <ResponsiveBar
          data={barData}
          keys={["cantidad_total"]}
          indexBy="periodo"
          margin={{ top: 40, right: 60, bottom: 50, left: 60 }}
          axisBottom={{
            tickRotation: -45,
            legend: "Period",
            legendOffset: 40,
            legendPosition: "middle",
          }}
          axisLeft={{
            legend: "Quantity",
            legendOffset: -50,
            legendPosition: "middle",
          }}
          colors={{ scheme: "set2" }}
          enableLabel={false}
          tooltip={({ indexValue, value }) => (
            <div className="bg-white text-sm p-2 shadow rounded">
              <strong>{indexValue}</strong>
              <br />
              Quantity: {value}
            </div>
          )}
        />
        {/* Line chart encima */}
        <div className="absolute inset-0 pointer-events-none">
          <ResponsiveLine
            data={lineData}
            margin={{ top: 40, right: 60, bottom: 50, left: 60 }}
            xScale={{ type: "point" }}
            yScale={{ type: "linear", min: "auto", max: "auto" }}
            axisLeft={null}
            axisBottom={null}
            colors={{ scheme: "accent" }}
            pointSize={6}
            enablePoints
            lineWidth={3}
            useMesh
          />
        </div>
      </div>
    );
  }

  export default MarketTrendsMixedChart
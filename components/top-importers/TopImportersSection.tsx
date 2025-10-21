"use client";

import React, { useState } from "react";
import { DollarSign } from "lucide-react";
import TopImportersBarChart from "./TopImportersBarChart";
import TopImportersTable from "./TopImportersTable";
import TopImportersBoxPlot from "./TopImportersBoxPlot";
import { ChartDataPoint, TopImporterDetail, BoxPlotItem } from "@/types/analytics";

interface TopImportersSectionProps {
  topImporters: TopImporterDetail[];
  boxPlotData: BoxPlotItem[];
  loadingBoxPlot: boolean;
  chartView: "paises" | "marcas";
  setChartView: (view: "paises" | "marcas") => void;
  colors: string[];
}

const TopImportersSection: React.FC<TopImportersSectionProps> = ({
  topImporters,
  boxPlotData,
  loadingBoxPlot,
  chartView,
  setChartView,
  colors,
}) => {

  const prepareChartData = (): ChartDataPoint[] => {
    return topImporters.map((imp) => {
      const dataPoint: ChartDataPoint = { importador: imp.nombre };
      const detalle =
        chartView === "paises" ? imp.detalle.paises : imp.detalle.marcas;
      Object.entries(detalle).forEach(([k, v]) => (dataPoint[k] = v));
      return dataPoint;
    });
  };

  const getChartKeys = (): string[] => {
    if (topImporters.length === 0) return [];
    const keysSet = new Set<string>();
    topImporters.forEach((imp) => {
      const detalle =
        chartView === "paises" ? imp.detalle.paises : imp.detalle.marcas;
      Object.keys(detalle).forEach((key) => keysSet.add(key));
    });
    return Array.from(keysSet);
  };

  const prepareBoxPlotData = () => {
    if (boxPlotData.length === 0) return [];
    const rutToName = new Map<string, string>();
    topImporters.forEach((imp) => rutToName.set(imp.rut, imp.nombre));
    return boxPlotData.map((item) => ({
      group: rutToName.get(item.group) || item.group,
      value: item.value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Top {topImporters.length} Importers
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setChartView("paises")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                chartView === "paises"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              By Country
            </button>
            <button
              onClick={() => setChartView("marcas")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                chartView === "marcas"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              By Brand
            </button>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <TopImportersBarChart
        data={prepareChartData()}
        keys={getChartKeys()}
        colors={colors}
      />

      {/* Table */}
      <TopImportersTable topImporters={topImporters} />

      {/* Box Plot */}
      <TopImportersBoxPlot
        data={prepareBoxPlotData()}
        loading={loadingBoxPlot}
      />
    </div>
  );
};

export default TopImportersSection;

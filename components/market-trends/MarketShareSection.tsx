"use client";

import { ResponsivePie } from "@nivo/pie";
import React from "react";
import type { ShareImportadoresResponse } from "@/types/analytics";

interface MarketShareSectionProps {
  data: ShareImportadoresResponse;
}

const MarketShareSection: React.FC<MarketShareSectionProps> = ({ data }) => {
const pieData = data.top_importadores.map((imp) => ({
    id: imp.nombre,
    label: imp.nombre,
    value: imp.market_share_porcentaje,
}));

return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Pie Chart */}
    <div className="h-96 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Share</h3>
        <ResponsivePie
        data={pieData}
        margin={{ top: 40, right: 60, bottom: 60, left: 60 }}
        innerRadius={0.5}
        padAngle={1}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        colors={{ scheme: "nivo" }}
        borderWidth={1}
        borderColor={{ from: "color", modifiers: [["darker", 0.3]] }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="#555"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: "color" }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
        tooltip={({ datum }) => (
            <div className="bg-white text-sm p-2 shadow rounded">
            <strong>{datum.label}</strong>
            <br />
            {datum.value.toFixed(2)}%
            </div>
        )}
        />
    </div>

    {/* Table with details */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 overflow-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Importers Detail</h3>
        <table className="min-w-full text-sm text-left border-collapse">
        <thead>
            <tr className="border-b text-gray-700 bg-gray-50">
            <th className="py-2 px-3 font-medium">Name</th>
            <th className="py-2 px-3 font-medium">Industry</th>
            <th className="py-2 px-3 font-medium text-right">Quantity</th>
            <th className="py-2 px-3 font-medium text-right">FOB Total (USD)</th>
            <th className="py-2 px-3 font-medium text-right">FOB/Unit</th>
            </tr>
        </thead>
        <tbody>
            {data.top_importadores.map((imp) => {
            const fobUnit =
                imp.cantidad_total > 0
                ? imp.fob_total / imp.cantidad_total
                : 0;

            return (
                <tr
                key={imp.rut}
                className="border-b hover:bg-gray-50 transition-colors"
                >
                <td className="py-2 px-3 font-medium text-gray-900">
                    {imp.nombre}
                </td>
                <td className="py-2 px-3 text-gray-700">
                    {imp.industria || "—"}
                </td>
                <td className="py-2 px-3 text-right text-gray-700">
                    {imp.cantidad_total.toLocaleString()}
                </td>
                <td className="py-2 px-3 text-right text-gray-700">
                    {imp.fob_total.toLocaleString(undefined, {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0,
                    })}
                </td>
                <td className="py-2 px-3 text-right text-gray-700">
                    {fobUnit.toLocaleString(undefined, {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 2,
                    })}
                </td>
                </tr>
            );
            })}
        </tbody>
        </table>
    </div>
    </div>
);
};

export default MarketShareSection;
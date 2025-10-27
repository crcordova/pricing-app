import React from "react";
import { ResponsivePie } from "@nivo/pie";
import { CountryData } from "@/types/analytics";

interface ComparativaPais {
  pais: string;
  volumen: { share_mercado_porcentaje: number };
  fob_unit: { promedio_ponderado: number; minimo: number; maximo: number };
  num_transacciones: number;
}


interface CountryComparisonProps {
  data: CountryData;
}

const CountryComparison: React.FC<CountryComparisonProps> = ({ data }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Pie Chart */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-gray-600">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Market Share by Country</h2>
      <div style={{ height: "350px" }}>
        <ResponsivePie
          data={data.comparativa_paises.map((c) => ({
            id: c.pais,
            label: c.pais,
            value: c.volumen.share_mercado_porcentaje,
          }))}
          margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
          innerRadius={0.5}
          padAngle={0.7}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          colors={{ scheme: "nivo" }}
          tooltip={({ datum }) => (
            <div className="bg-white px-3 py-2 shadow-lg rounded border border-gray-200">
              <strong>{datum.label}</strong>: {datum.value.toFixed(2)}%
            </div>
          )}
        />
      </div>
      <div className="mt-4 text-sm text-gray-600 border-t pt-4">
        <p><strong>Most Competitive Country:</strong> {data.pais_mas_competitivo}</p>
        <p><strong>Total Countries:</strong> {data.total_paises}</p>
      </div>
    </div>

    {/* Table */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-gray-600">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Price Comparison by Country</h2>
      <div className="overflow-auto" style={{ maxHeight: "400px" }}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Average</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Min</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Max</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Trans.</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.comparativa_paises.map((c, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.pais}</td>
                <td className="px-4 py-3 text-sm text-right font-semibold">${c.fob_unit.promedio_ponderado.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-right text-green-600">${c.fob_unit.minimo.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-right text-red-600">${c.fob_unit.maximo.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-right text-gray-600">{c.num_transacciones}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default CountryComparison;

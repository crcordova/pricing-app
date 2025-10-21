import React from "react";
import { TopImporterDetail } from "@/types/analytics";

interface Props {
  topImporters: TopImporterDetail[];
}

const TopImportersTable: React.FC<Props> = ({ topImporters }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["Importer", "RUT", "Total Quantity", "Countries", "Brands"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {topImporters.map((imp, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{imp.nombre}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{imp.rut}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {imp.total_cantidad.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {Object.entries(imp.detalle.paises).map(([pais, cant]) => (
                    <div key={pais}>
                      <span className="font-medium">{pais}:</span> {cant.toLocaleString()}
                    </div>
                  ))}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {Object.entries(imp.detalle.marcas).map(([marca, cant]) => (
                    <div key={marca}>
                      <span className="font-medium">{marca}:</span> {cant.toLocaleString()}
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopImportersTable;

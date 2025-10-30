'use client';

import React, { useState, useEffect } from 'react';
import { FileDown, Search, Calendar, ChevronLeft, ChevronRight, Download, FileSpreadsheet } from 'lucide-react';
import {getImportaciones} from '@/lib/api'

// Tipos
interface Importacion {
  id: number;
  fecha: string;
  pais_origen: string;
  pais_adquisicion: string;
  producto_nombre: string;
  marca: string;
  variedad: string;
  descripcion: string;
  via_transporte: string;
  compania_transporte: string;
  forma_pago: string;
  clausula: string;
  cantidad: number;
  unidad: string;
  fob_total: number;
  fob_unit: number;
  flete_total: number;
  seguro_total: number;
  cif_total: number;
  cif_unit: number;
  impuesto: number;
  iva_total: number;
}

interface ApiResponse {
  count: number;
  results: Importacion[];
}

// Datos de ejemplo (reemplazar con llamada a API)
const mockData: ApiResponse = {
  count: 45,
  results: Array.from({ length: 45 }, (_, i) => ({
    id: 332 + i,
    fecha: "2025-01-09",
    pais_origen: i % 3 === 0 ? "PERU" : i % 3 === 1 ? "CHINA" : "BRASIL",
    pais_adquisicion: "PERU",
    producto_nombre: i % 2 === 0 ? "OXIDO DE ZINC" : "REPUESTOS INDUSTRIALES",
    marca: "Z.I.N.-F",
    variedad: "ACONDICIONADO EN SACOS DE 25 K",
    descripcion: "ILOSDEUSO INDUSTRIAL",
    via_transporte: "MARITIMO",
    compania_transporte: "OCEAN NETWORK EXPRES",
    forma_pago: "COBRANZA HASTA 1 AÑO",
    clausula: "CIF",
    cantidad: 5000 + i * 100,
    unidad: "KILOGRAMOS NETOS",
    fob_total: 15640.75 + i * 50,
    fob_unit: 3.13,
    flete_total: 431.78,
    seguro_total: 12.47,
    cif_total: 16085 + i * 50,
    cif_unit: 3.22,
    impuesto: 0,
    iva_total: 3056.15
  }))
};

export default function ImportsTable() {
  const [data, setData] = useState<ApiResponse>({ count: 0, results: [] });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    fecha_start: '',
    fecha_end: '',
    nombre_importador: '',
    rut_importador: '',
    producto: '',
    pais_origen: ''
  });
  
  const itemsPerPage = 20;

  // Cargar datos (aquí usarías tu API real)
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
  setLoading(true);
  try {
    const result = await getImportaciones(filters);
    setData(result);
  } catch (error) {
    console.error('Error cargando datos:', error);
    alert('Error al cargar los datos. Por favor intenta de nuevo.');
  } finally {
    setLoading(false);
  }
};

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return params.toString();
  };

  // Paginación
  const totalPages = Math.ceil(data.count / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.results.slice(startIndex, endIndex);

  // Exportar a CSV
  const exportToCSV = () => {
    const headers = [
      'ID', 'Fecha', 'País Origen', 'País Adquisición', 'Producto', 'Marca',
      'Variedad', 'Descripción', 'Vía Transporte', 'Compañía Transporte',
      'Forma Pago', 'Cláusula', 'Cantidad', 'Unidad', 'FOB Total', 'FOB Unit',
      'Flete Total', 'Seguro Total', 'CIF Total', 'CIF Unit', 'Impuesto', 'IVA Total'
    ];

    const csvContent = [
      headers.join(','),
      ...data.results.map(row => [
        row.id,
        row.fecha,
        `"${row.pais_origen}"`,
        `"${row.pais_adquisicion}"`,
        `"${row.producto_nombre}"`,
        `"${row.marca}"`,
        `"${row.variedad}"`,
        `"${row.descripcion}"`,
        `"${row.via_transporte}"`,
        `"${row.compania_transporte}"`,
        `"${row.forma_pago}"`,
        `"${row.clausula}"`,
        row.cantidad,
        `"${row.unidad}"`,
        row.fob_total,
        row.fob_unit,
        row.flete_total,
        row.seguro_total,
        row.cif_total,
        row.cif_unit,
        row.impuesto,
        row.iva_total
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `importaciones_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Exportar a Excel (formato HTML que Excel puede abrir)
  const exportToExcel = () => {
    const headers = [
      'ID', 'Fecha', 'País Origen', 'País Adquisición', 'Producto', 'Marca',
      'Variedad', 'Descripción', 'Vía Transporte', 'Compañía Transporte',
      'Forma Pago', 'Cláusula', 'Cantidad', 'Unidad', 'FOB Total', 'FOB Unit',
      'Flete Total', 'Seguro Total', 'CIF Total', 'CIF Unit', 'Impuesto', 'IVA Total'
    ];

    let tableHTML = '<table border="1"><thead><tr>';
    headers.forEach(h => {
      tableHTML += `<th>${h}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';

    data.results.forEach(row => {
      tableHTML += '<tr>';
      tableHTML += `<td>${row.id}</td>`;
      tableHTML += `<td>${row.fecha}</td>`;
      tableHTML += `<td>${row.pais_origen}</td>`;
      tableHTML += `<td>${row.pais_adquisicion}</td>`;
      tableHTML += `<td>${row.producto_nombre}</td>`;
      tableHTML += `<td>${row.marca}</td>`;
      tableHTML += `<td>${row.variedad}</td>`;
      tableHTML += `<td>${row.descripcion}</td>`;
      tableHTML += `<td>${row.via_transporte}</td>`;
      tableHTML += `<td>${row.compania_transporte}</td>`;
      tableHTML += `<td>${row.forma_pago}</td>`;
      tableHTML += `<td>${row.clausula}</td>`;
      tableHTML += `<td>${row.cantidad}</td>`;
      tableHTML += `<td>${row.unidad}</td>`;
      tableHTML += `<td>${row.fob_total}</td>`;
      tableHTML += `<td>${row.fob_unit}</td>`;
      tableHTML += `<td>${row.flete_total}</td>`;
      tableHTML += `<td>${row.seguro_total}</td>`;
      tableHTML += `<td>${row.cif_total}</td>`;
      tableHTML += `<td>${row.cif_unit}</td>`;
      tableHTML += `<td>${row.impuesto}</td>`;
      tableHTML += `<td>${row.iva_total}</td>`;
      tableHTML += '</tr>';
    });
    tableHTML += '</tbody></table>';

    const blob = new Blob([tableHTML], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `importaciones_${new Date().toISOString().split('T')[0]}.xls`;
    link.click();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('es-CL').format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 text-gray-600">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                  <FileDown className="w-6 h-6 text-white" />
                </div>
                Imports
              </h1>
              <p className="text-gray-600 mt-2">
                Total: <span className="font-semibold">{data.count}</span> registers
              </p>
            </div>
            
            {/* Botones de exportación */}
            <div className="flex gap-3">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export Excel
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Init Date
              </label>
              <input
                type="date"
                value={filters.fecha_start}
                onChange={(e) => setFilters({...filters, fecha_start: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.fecha_end}
                onChange={(e) => setFilters({...filters, fecha_end: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country Origin
              </label>
              <input
                type="text"
                value={filters.pais_origen}
                onChange={(e) => setFilters({...filters, pais_origen: e.target.value})}
                placeholder="Ej: PERU"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product
              </label>
              <input
                type="text"
                value={filters.producto}
                onChange={(e) => setFilters({...filters, producto: e.target.value})}
                placeholder="Nombre del producto"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2 flex items-end">
              <button
                onClick={loadData}
                className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading Data...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th> */}
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">FOB Total</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">CIF Total</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">CIF Unit</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">FOB Unit</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vía</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        {/* <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{item.id}</td> */}
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{item.fecha}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{item.pais_origen}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.producto_nombre}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{item.marca}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-right">
                          {formatNumber(item.cantidad)} 
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                          {formatCurrency(item.fob_total)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600 text-right">
                          {formatCurrency(item.cif_total)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-600 text-right">
                          {formatCurrency(item.cif_unit)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right">
                          {formatCurrency(item.fob_unit)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{item.via_transporte}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(endIndex, data.count)}</span> of{' '}
                    <span className="font-medium">{data.count}</span> results
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="px-4 py-1 text-sm font-medium">
                      Page {currentPage} de {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
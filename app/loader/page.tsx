"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, FileUp, Upload, CheckCircle, AlertCircle, X, Package, Tag, FileSpreadsheet } from "lucide-react";
import * as XLSX from 'xlsx';

// Interfaces
interface ExcelRow {
  Producto?: string;
  producto?: string;
  PRODUCTO?: string;
  Marca?: string;
  marca?: string;
  MARCA?: string;
  [key: string]: any;
}

interface PreviewData {
  totalRegistros: number;
  totalProductos: number;
  totalMarcas: number;
  productos: string[];
  marcas: string[];
  productosPorMarca: Record<string, string[]>;
  primerasFilas: ExcelRow[];
}

interface UploadResult {
  status: string;
  rows_processed: number;
}

export default function ExcelLoader() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = async (selectedFile: File) => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(firstSheet);

      // Procesar datos para la vista previa
      const productosSet = new Set<string>();
      const marcasSet = new Set<string>();
      
      jsonData.forEach(row => {
        const producto = row.Producto || row.producto;
        const marca = row.Marca || row.marca;
        if (producto) productosSet.add(producto);
        if (marca) marcasSet.add(marca);
      });

      const productos = Array.from(productosSet);
      const marcas = Array.from(marcasSet);
      
      // Agrupar productos por marca
      const productosPorMarca: Record<string, Set<string>> = {};
      jsonData.forEach(row => {
        const marca = row.Marca || row.marca;
        const producto = row.Producto || row.producto;
        if (marca && producto) {
          if (!productosPorMarca[marca]) {
            productosPorMarca[marca] = new Set<string>();
          }
          productosPorMarca[marca].add(producto);
        }
      });

      // Convertir Sets a arrays
      const productosPorMarcaArray: Record<string, string[]> = {};
      Object.keys(productosPorMarca).forEach(marca => {
        productosPorMarcaArray[marca] = Array.from(productosPorMarca[marca]);
      });

      setPreview({
        totalRegistros: jsonData.length,
        totalProductos: productos.length,
        totalMarcas: marcas.length,
        productos,
        marcas,
        productosPorMarca: productosPorMarcaArray,
        primerasFilas: jsonData.slice(0, 5)
      });
    } catch (err) {
      setError("Error al procesar el archivo. Verifica que sea un Excel válido.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      processFile(selectedFile);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls'))) {
      setFile(droppedFile);
      processFile(droppedFile);
    } else {
      setError("Por favor, selecciona un archivo Excel (.xlsx o .xls)");
    }
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const apiUrl = `${process.env.NEXT_PUBLIC_URL_IMPORTS}/excel/load`;
      const response = await fetch(apiUrl,  {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al cargar el archivo');
      }

      const data: UploadResult = await response.json();
      setResult(data);
      setFile(null);
      setPreview(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar el archivo al servidor";
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg">
                    <FileUp className="w-6 h-6 text-white" />
                  </div>
                  Excel Loader
                </h1>
                <p className="text-gray-600 mt-1">
                  Carga y procesa tus archivos Excel de importaciones
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Seleccionar Archivo</h2>
              
              {!file ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
                    isDragging 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                  }`}
                >
                  <FileSpreadsheet className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Arrastra tu archivo Excel aquí
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    o haz clic para seleccionar
                  </p>
                  <label className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium cursor-pointer hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg">
                    <Upload className="w-5 h-5 mr-2" />
                    Seleccionar Archivo
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-400 mt-4">
                    Formatos soportados: .xlsx, .xls
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-600">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={resetUpload}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {loading && (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-4">Procesando archivo...</p>
                    </div>
                  )}

                  {preview && !loading && (
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Cargando...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          <span>Cargar al Servidor</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-900">Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {result && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-900">¡Carga Exitosa!</p>
                  <p className="text-sm text-green-700">
                    Se procesaron {result.rows_processed} registros correctamente
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            {preview && (
              <>
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Vista Previa</h2>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
                      <FileSpreadsheet className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-900">{preview.totalRegistros}</p>
                      <p className="text-sm text-blue-700">Registros</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
                      <Package className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-purple-900">{preview.totalProductos}</p>
                      <p className="text-sm text-purple-700">Productos</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 text-center">
                      <Tag className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-emerald-900">{preview.totalMarcas}</p>
                      <p className="text-sm text-emerald-700">Marcas</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 max-h-96 overflow-y-auto">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos por Marca</h3>
                  <div className="space-y-4">
                    {Object.entries(preview.productosPorMarca).map(([marca, productos]) => (
                      <div key={marca} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Tag className="w-5 h-5 text-purple-600" />
                          <h4 className="font-semibold text-gray-900">{marca}</h4>
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            {productos.length} productos
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {productos.map((producto, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                            >
                              {producto}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {!preview && !file && (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <FileSpreadsheet className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  Selecciona un archivo para ver la vista previa
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
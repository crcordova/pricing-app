"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { 
  TrendingUp, 
  BarChart3, 
  RefreshCw, 
  Calendar, 
  Target,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Activity,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import type { ComponentProps } from "react";
import type Plot from "react-plotly.js";
type PlotProps = ComponentProps<typeof Plot>;

// const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });
const PlotDynamic = dynamic(() => import("react-plotly.js"), {
  ssr: false,
}) as React.ComponentType<PlotProps>;

// Configuración centralizada del backend
const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_URL_PRICE_PREDICTION,
  // BASE_URL: "http://18.217.222.175:8000",
  ENDPOINTS: {
    COMMODITIES: "/commodities",
    SIMULATE_PRICE: "/simulate_price",
    GET_PRICES: "/get_prices"
  }
};

interface PredictionResult {
  plot: {
    data: any[];
    layout: any;
  };
  // Añade otros campos que pueda devolver tu API
}

export default function PricePrediction() {
  const [asset, setAsset] = useState("");
  const [days, setDays] = useState(5);
  const [percentil, setPercentil] = useState(10);
  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [commodities, setCommodities] = useState<string[]>([]);

  useEffect(() => {
    fetchCommodities();
  }, []);

  const fetchCommodities = async () => {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMMODITIES}`);
      if (!res.ok) throw new Error("Error al cargar commodities");
      const data = await res.json();
      setCommodities(data);
    } catch (err) {
      console.error("Error fetching commodities:", err);
      setError("Error al cargar la lista de commodities");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SIMULATE_PRICE}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          commodity: asset,
          n_days: days, 
          percentil: percentil 
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || `Error ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
      setSuccess("Predicción generada exitosamente");
    } catch (err: any) {
      setError(err.message || "Error desconocido al generar predicción");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePrices = async () => {
    if (!asset) {
      setError("Primero selecciona un commodity");
      return;
    }

    try {
      setUpdateLoading(true);
      setError(null);
      setSuccess(null);

      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_PRICES}/?commodity=${asset}`);
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Error actualizando precios");
      }

      const data = await res.json();
      setSuccess(data.message || "Precios actualizados correctamente");
    } catch (err: any) {
      console.error("Error actualizando precios:", err);
      setError(err.message || "Hubo un error inesperado al actualizar precios");
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  Predicción de Precios
                </h1>
                <p className="text-gray-600 mt-1">
                  Análisis avanzado y predicciones de commodities usando machine learning
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Panel de Control */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Configuración
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Selector de Commodity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commodity
                  </label>
                  <select
                    value={asset}
                    onChange={(e) => setAsset(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  >
                    <option value="" disabled>Selecciona un commodity</option>
                    {commodities.map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Botón de Actualizar Precios */}
                <button
                  type="button"
                  onClick={handleUpdatePrices}
                  disabled={!asset || updateLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${updateLoading ? 'animate-spin' : ''}`} />
                  {updateLoading ? 'Actualizando...' : 'Actualizar Datos'}
                </button>

                {/* Número de Días */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Días a Predecir
                  </label>
                  <input
                    type="number"
                    value={days}
                    min={1}
                    max={365}
                    onChange={(e) => setDays(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Ej: 30"
                  />
                  <p className="text-xs text-gray-500 mt-1">Máximo 365 días</p>
                </div>

                {/* Percentil */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Target className="w-4 h-4 inline mr-1" />
                    Percentil de Confianza
                  </label>
                  <input
                    type="number"
                    value={percentil}
                    min={1}
                    max={99}
                    onChange={(e) => setPercentil(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Ej: 10"
                  />
                  <p className="text-xs text-gray-500 mt-1">Entre 1 y 99</p>
                </div>

                {/* Botón de Predicción */}
                <button
                  type="submit"
                  disabled={loading || !asset}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Generando Predicción...
                    </>
                  ) : (
                    <>
                      <Activity className="w-4 h-4" />
                      Generar Predicción
                    </>
                  )}
                </button>
              </form>

              {/* Información Adicional */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-sm font-medium text-blue-800 mb-2">ℹ️ Información</h3>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Las predicciones se basan en datos históricos</li>
                  <li>• Mayor percentil = mayor conservadurismo</li>
                  <li>• Actualiza los datos antes de predecir</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Panel de Resultados */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              
              {/* Alertas */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-green-800">Éxito</h3>
                    <p className="text-sm text-green-700 mt-1">{success}</p>
                  </div>
                </div>
              )}

              {/* Gráfico de Resultados */}
              {result?.plot ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      Predicción - {asset?.toUpperCase()}
                    </h2>
                    <div className="text-sm text-gray-500">
                      {days} días • Percentil {percentil}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <PlotDynamic
                      data={result.plot.data}
                      layout={{
                        ...result.plot.layout,
                        font: { family: 'Inter, system-ui, sans-serif' },
                        plot_bgcolor: 'rgba(0,0,0,0)',
                        paper_bgcolor: 'rgba(0,0,0,0)',
                        margin: { t: 40, r: 40, b: 60, l: 60 },
                        height: 500,
                      }}
                      useResizeHandler
                      style={{ width: "100%", height: "500px" }}
                      config={{ 
                        responsive: true,
                        displayModeBar: true,
                        modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
                        displaylogo: false
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <BarChart3 className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Sin Datos de Predicción
                  </h3>
                  <p className="text-gray-600">
                    Selecciona un commodity y genera una predicción para ver los resultados aquí.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
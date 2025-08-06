// 'use client';

// import { useEffect, useState } from 'react';
// import dynamic from "next/dynamic";
// import PricePredictionChart from "./volatilityPredictionChart";

// const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

// export default function VolatilityPrediction() {
//   const [commodities, setCommodities] = useState<string[]>([]);
//   const [asset, setAsset] = useState('');
//   const [nDays, setNDays] = useState(10);
//   const [loadingCalibrate, setLoadingCalibrate] = useState(false);
//   const [loadingPredict, setLoadingPredict] = useState(false);
//   const [volatilityData, setVolatilityData] = useState<any>(null);
//   const [message, setMessage] = useState('');

//   useEffect(() => {
//     const fetchCommodities = async () => {
//       const res = await fetch('http://127.0.0.1:8000/commodities');
//       const data = await res.json();
//       setCommodities(data);
//     };
//     fetchCommodities();
//   }, []);

//   const handleCalibrate = async () => {
//     setLoadingCalibrate(true);
//     setMessage('');
//     try {
//       const res = await fetch('http://127.0.0.1:8000/calibrate-volatility', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           commodity: asset,
//           look_back: 10,
//           epochs: 20,
//         }),
//       });
//       const data = await res.json();
//       setMessage(data.message || 'Modelo calibrado correctamente.');
//     } catch (err) {
//       setMessage('Error al calibrar el modelo.');
//     }
//     setLoadingCalibrate(false);
//   };

//   const handlePredict = async () => {
//     setLoadingPredict(true);
//     setMessage('');
//     try {
//       const res = await fetch('http://127.0.0.1:8000/forecast-volatility', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           commodity: asset,
//           n_days: nDays,
//         }),
//       });
//       const data = await res.json();
//       if (data.plot) {
//         setVolatilityData(data.plot);
//         setMessage('');
//       } else {
//         setMessage(data.message || 'No se pudo generar la predicción.');
//       }
//     } catch (err) {
//       setMessage('Error al predecir la volatilidad.');
//     }
//     setLoadingPredict(false);
//   };

//   return (
//     <main className="w-full min-h-screen px-4 py-8">
//       <div className="max-w-7xl mx-auto">
//         <h1 className="text-2xl font-bold mb-4">Predicción de Volatilidad</h1>

//         <div className="space-y-4 mb-6">
//           <label className="block">
//             Selecciona un commodity:
//             <select
//               value={asset}
//               onChange={(e) => setAsset(e.target.value)}
//               required
//               className="select select-bordered w-full mt-1 text-black"
//             >
//               <option value="" disabled>Elige un commodity</option>
//               {commodities.map((c) => (
//                 <option key={c} value={c}>
//                   {c.charAt(0).toUpperCase() + c.slice(1)}
//                 </option>
//               ))}
//             </select>
//           </label>

//           <div className="flex gap-4 items-center">
//             <button
//               onClick={handleCalibrate}
//               disabled={!asset || loadingCalibrate}
//               className="btn btn-secondary"
//             >
//               {loadingCalibrate ? 'Calibrando...' : 'Calibrar Modelo'}
//             </button>

//             <label className="flex items-center gap-2">
//               Días a predecir:
//               <input
//                 type="number"
//                 value={nDays}
//                 min={1}
//                 onChange={(e) => setNDays(Number(e.target.value))}
//                 className="input input-bordered w-24 text-black"
//               />
//             </label>

//             <button
//               onClick={handlePredict}
//               disabled={!asset || loadingPredict}
//               className="btn btn-primary"
//             >
//               {loadingPredict ? 'Prediciendo...' : 'Predecir Volatilidad'}
//             </button>
//           </div>
//         </div>

//         {message && (
//           <div className="alert alert-info my-4">
//             {message}
//           </div>
//         )}

//         {volatilityData && (
//         <PricePredictionChart plot={volatilityData} />
//         )}
//       </div>
//     </main>
//   );
// }
'use client';

import { useEffect, useState } from 'react';
import dynamic from "next/dynamic";
import { 
  Activity, 
  Settings, 
  Calendar, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Info,
  ArrowLeft,
  Zap,
  Brain,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import Link from "next/link";
import type { ComponentProps } from "react";
import type Plot from "react-plotly.js";
type PlotProps = ComponentProps<typeof Plot>;

const PlotDynamic = dynamic(() => import("react-plotly.js"), {
  ssr: false,
}) as React.ComponentType<PlotProps>;

// Configuración centralizada del backend
const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_URL_PRICE_PREDICTION,
  ENDPOINTS: {
    COMMODITIES: "/commodities",
    CALIBRATE_VOLATILITY: "/calibrate-volatility",
    FORECAST_VOLATILITY: "/forecast-volatility"
  }
};

interface VolatilityPlotData {
  data: any[];
  layout: any;
}

export default function VolatilityPrediction() {
  const [commodities, setCommodities] = useState<string[]>([]);
  const [asset, setAsset] = useState('');
  const [nDays, setNDays] = useState(5);
  const [lookBack, setLookBack] = useState(10);
  const [epochs, setEpochs] = useState(20);
  const [loadingCalibrate, setLoadingCalibrate] = useState(false);
  const [loadingPredict, setLoadingPredict] = useState(false);
  const [volatilityData, setVolatilityData] = useState<VolatilityPlotData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isCalibrated, setIsCalibrated] = useState(false);

  useEffect(() => {
    fetchCommodities();
  }, []);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
    setInfo(null);
  };

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

  const handleCalibrate = async () => {
    if (!asset) {
      setError("Primero selecciona un commodity");
      return;
    }

    setLoadingCalibrate(true);
    clearMessages();
    setInfo("Calibrando modelo... Este proceso puede tomar unos minutos.");

    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CALIBRATE_VOLATILITY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commodity: asset,
          look_back: lookBack,
          epochs: epochs,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || `Error ${res.status} al calibrar modelo`);
      }

      const data = await res.json();
      setSuccess(data.message || 'Modelo calibrado correctamente');
      setIsCalibrated(true);
      setInfo(null);
    } catch (err: any) {
      setError(err.message || 'Error al calibrar el modelo');
      setInfo(null);
      setIsCalibrated(false);
    } finally {
      setLoadingCalibrate(false);
    }
  };

  const handlePredict = async () => {
    if (!asset) {
      setError("Primero selecciona un commodity");
      return;
    }

    setLoadingPredict(true);
    clearMessages();

    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FORECAST_VOLATILITY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commodity: asset,
          n_days: nDays,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || `Error ${res.status} al predecir volatilidad`);
      }

      const data = await res.json();
      
      if (data.plot) {
        setVolatilityData(data.plot);
        setSuccess('Predicción de volatilidad generada exitosamente');
      } else {
        throw new Error(data.message || 'No se pudo generar la predicción');
      }
    } catch (err: any) {
      setError(err.message || 'Error al predecir la volatilidad');
      setVolatilityData(null);
    } finally {
      setLoadingPredict(false);
    }
  };

  const resetAsset = () => {
    setAsset('');
    setIsCalibrated(false);
    setVolatilityData(null);
    clearMessages();
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
                  <div className="bg-gradient-to-r from-red-500 to-red-600 p-2 rounded-lg">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  Predicción de Volatilidad
                </h1>
                <p className="text-gray-600 mt-1">
                  Análisis y predicción de volatilidad en mercados financieros usando IA
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Panel de Control */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Selección de Commodity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-600" />
                Commodity
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecciona un activo
                  </label>
                  <select
                    value={asset}
                    onChange={(e) => setAsset(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 bg-white"
                  >
                    <option value="" disabled>Elige un commodity</option>
                    {commodities.map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {asset && (
                  <button
                    onClick={resetAsset}
                    className="text-sm text-red-600 hover:text-red-700 underline"
                  >
                    Cambiar commodity
                  </button>
                )}
              </div>
            </div>

            {/* Calibración del Modelo */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Calibración
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Look Back (días)
                  </label>
                  <input
                    type="number"
                    value={lookBack}
                    min={5}
                    max={50}
                    onChange={(e) => setLookBack(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-1">Histórico para entrenamiento (5-50)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Epochs
                  </label>
                  <input
                    type="number"
                    value={epochs}
                    min={10}
                    max={100}
                    onChange={(e) => setEpochs(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-1">Iteraciones de entrenamiento (10-100)</p>
                </div>

                <button
                  onClick={handleCalibrate}
                  disabled={!asset || loadingCalibrate}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {loadingCalibrate ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Calibrando Modelo...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4" />
                      Calibrar Modelo
                    </>
                  )}
                </button>

                {isCalibrated && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Modelo calibrado
                  </div>
                )}
              </div>
            </div>

            {/* Predicción */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                Predicción
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Días a Predecir
                  </label>
                  <input
                    type="number"
                    value={nDays}
                    min={1}
                    max={365}
                    onChange={(e) => setNDays(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-1">Horizonte de predicción (1-365)</p>
                </div>

                <button
                  onClick={handlePredict}
                  disabled={!asset || loadingPredict}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {loadingPredict ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Generando Predicción...
                    </>
                  ) : (
                    <>
                      <Activity className="w-4 h-4" />
                      Predecir Volatilidad
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Información Adicional */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-1">
                <Info className="w-4 h-4" />
                Proceso Recomendado
              </h3>
              <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                <li>Selecciona un commodity</li>
                <li>Calibra el modelo primero</li>
                <li>Genera la predicción</li>
                <li>Analiza los resultados</li>
              </ol>
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

              {info && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">Información</h3>
                    <p className="text-sm text-blue-700 mt-1">{info}</p>
                  </div>
                </div>
              )}

              {/* Gráfico de Volatilidad */}
              {volatilityData ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-red-600" />
                      Volatilidad - {asset?.toUpperCase()}
                    </h2>
                    <div className="text-sm text-gray-500">
                      {nDays} días • {lookBack} look-back • {epochs} epochs
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <PlotDynamic
                      data={volatilityData.data}
                      layout={{
                        ...volatilityData.layout,
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

                  {/* Métricas adicionales si están disponibles */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-red-50 p-3 rounded-lg text-center">
                      <div className="text-red-600 font-semibold">Volatilidad Promedio</div>
                      <div className="text-sm text-gray-600">Calculada del período</div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg text-center">
                      <div className="text-yellow-600 font-semibold">Tendencia</div>
                      <div className="text-sm text-gray-600">Dirección general</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <div className="text-blue-600 font-semibold">Confianza</div>
                      <div className="text-sm text-gray-600">Modelo calibrado</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <BarChart3 className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Sin Datos de Volatilidad
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Selecciona un commodity, calibra el modelo y genera una predicción para ver los resultados.
                  </p>
                  <div className="text-sm text-gray-500">
                    💡 Tip: La calibración es necesaria antes de predecir
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
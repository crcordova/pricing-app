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
  ArrowLeft,
  Zap,
  Brain,
  LineChart
} from "lucide-react";
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
  // BASE_URL: "http://18.217.222.175:8000",
  ENDPOINTS: {
    COMMODITIES: "/commodities",
    SIMULATE_PRICE: "/simulate_price",
    GET_PRICES: "/get_prices",
    CALIBRATE_VOLATILITY: "/calibrate-volatility",
    FORECAST_VOLATILITY: "/forecast-volatility",
    FORECAST_PRICE: "/forecast-price"
  }
};

interface PredictionResult {
  plot: {
    data: any[];
    layout: any;
  };
  meta?: {
    last_price: number;
    days: number;
    upper_price: number;
    lower_price: number;
  };
}

interface VolatilityResult {
  message: string;
  plot: {
    data: any[];
    layout: any;
  };
}

interface MLResult {
  coverage_rate: number;
  plot: {
    data: any[];
    layout: any;
  };
  predictions: {
    date: string;
    last_close: number;
    pred_upper_ret: number;
    pred_lower_ret: number;
    pred_upper_price: number;
    pred_lower_price: number;
  };
}

type TabType = 'montecarlo' | 'volatility' | 'ml';

export default function FinancialAnalysisDashboard() {
  // Estados generales
  const [activeTab, setActiveTab] = useState<TabType>('montecarlo');
  const [asset, setAsset] = useState("");
  const [commodities, setCommodities] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Estados para Monte Carlo
  const [mcDays, setMcDays] = useState(5);
  const [mcPercentil, setMcPercentil] = useState(10);
  const [mcLoading, setMcLoading] = useState(false);
  const [mcResult, setMcResult] = useState<PredictionResult | null>(null);

  // Estados para Volatilidad
  const [volLookBack, setVolLookBack] = useState(10);
  const [volEpochs, setVolEpochs] = useState(20);
  const [volForecastDays, setVolForecastDays] = useState(10);
  const [volCalibrateLoading, setVolCalibrateLoading] = useState(false);
  const [volForecastLoading, setVolForecastLoading] = useState(false);
  const [volResult, setVolResult] = useState<VolatilityResult | null>(null);

  // Estados para ML
  const [mlDays, setMlDays] = useState(5);
  const [mlLoading, setMlLoading] = useState(false);
  const [mlResult, setMlResult] = useState<MLResult | null>(null);

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

  // Funciones para Monte Carlo
  const handleMonteCarloSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMcLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SIMULATE_PRICE}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          commodity: asset,
          n_days: mcDays, 
          percentil: mcPercentil 
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || `Error ${res.status}`);
      }

      const data = await res.json();
      setMcResult(data);
      setSuccess("Monte Carlo simulation generated successfully");
    } catch (err: any) {
      setError(err.message || "Unknown error generating simulation");
      setMcResult(null);
    } finally {
      setMcLoading(false);
    }
  };

  // Funciones para Volatilidad
  const handleVolatilityCalibrate = async () => {
    if (!asset) {
      setError("Select a commodity first");
      return;
    }

    setVolCalibrateLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CALIBRATE_VOLATILITY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commodity: asset,
          look_back: volLookBack,
          epochs: volEpochs
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || `Error ${res.status}`);
      }

      const data = await res.json();
      setSuccess("Volatility model calibrated successfully");
    } catch (err: any) {
      setError(err.message || "Error calibrating volatility");
    } finally {
      setVolCalibrateLoading(false);
    }
  };

  const handleVolatilityForecast = async () => {
    if (!asset) {
      setError("Select a commodity first");
      return;
    }

    setVolForecastLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FORECAST_VOLATILITY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commodity: asset,
          n_days: volForecastDays
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || `Error ${res.status}`);
      }

      const data = await res.json();
      setVolResult(data);
      setSuccess(data.message || "Volatility forecast generated successfully");
    } catch (err: any) {
      setError(err.message || "Error generating volatility forecast");
      setVolResult(null);
    } finally {
      setVolForecastLoading(false);
    }
  };

  // Funciones para ML
  const handleMLSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMlLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FORECAST_PRICE}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          commodity: asset,
          n_days: mlDays
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || `Error ${res.status}`);
      }

      const data = await res.json();
      setMlResult(data);
      setSuccess(`ML prediction generated successfully (Coverage Rate: ${(data.coverage_rate * 100).toFixed(2)}%)`);
    } catch (err: any) {
      setError(err.message || "Unknown error generating ML prediction");
      setMlResult(null);
    } finally {
      setMlLoading(false);
    }
  };

  const tabs = [
    { id: 'montecarlo', label: 'Monte Carlo', icon: BarChart3, color: 'blue' },
    { id: 'volatility', label: 'Volatility', icon: Zap, color: 'yellow' },
    { id: 'ml', label: 'ML Trends', icon: Brain, color: 'purple' }
  ];

  const getTabColorClasses = (tabId: string, isActive: boolean) => {
    const colors = {
      blue: isActive ? 'bg-blue-100 text-blue-700 border-blue-300' : 'text-gray-600 hover:text-blue-600',
      yellow: isActive ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 'text-gray-600 hover:text-yellow-600',
      purple: isActive ? 'bg-purple-100 text-purple-700 border-purple-300' : 'text-gray-600 hover:text-purple-600'
    };
    return colors[tabId as keyof typeof colors] || colors.blue;
  };

  const getCurrentResult = () => {
    switch (activeTab) {
      case 'montecarlo':
        return mcResult;
      case 'volatility':
        return volResult;
      case 'ml':
        return mlResult;
      default:
        return null;
    }
  };

  const getCurrentTitle = () => {
    switch (activeTab) {
      case 'montecarlo':
        return 'Monte Carlo Simulation';
      case 'volatility':
        return 'Volatility Analysis';
      case 'ml':
        return 'ML Prediction';
      default:
        return '';
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
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                    <LineChart className="w-6 h-6 text-white" />
                  </div>
                  Financial Analysis
                </h1>
                <p className="text-gray-600 mt-1">
                  Complete analysis suite: Monte Carlo, Volatility, and Machine Learning
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-200 ${
                      isActive 
                        ? `border-${tab.color}-500 text-${tab.color}-600` 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Panel de Control Común */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                General Configuration
              </h2>

              {/* Selector de Commodity - Común para todos */}
              <div className="space-y-4 mb-6">
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
                    <option value="" disabled>Select a commodity</option>
                    {commodities.map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Botón de Actualizar Precios - Común */}
                <button
                  type="button"
                  onClick={handleUpdatePrices}
                  disabled={!asset || updateLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${updateLoading ? 'animate-spin' : ''}`} />
                  {updateLoading ? 'Updating...' : 'Update Data'}
                </button>
              </div>

              {/* Formularios específicos por pestaña */}
              {activeTab === 'montecarlo' && (
                <form onSubmit={handleMonteCarloSubmit} className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-t pt-4">Monte Carlo</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Days to Predict
                    </label>
                    <input
                      type="number"
                      value={mcDays}
                      min={1}
                      max={365}
                      onChange={(e) => setMcDays(Number(e.target.value))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Target className="w-4 h-4 inline mr-1" />
                      Confidence Percentile
                    </label>
                    <input
                      type="number"
                      value={mcPercentil}
                      min={1}
                      max={99}
                      onChange={(e) => setMcPercentil(Number(e.target.value))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={mcLoading || !asset}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {mcLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Simulating...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-4 h-4" />
                        Simulate Monte Carlo
                      </>
                    )}
                  </button>
                </form>
              )}

              {activeTab === 'volatility' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-t pt-4">Volatility</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Look Back Period
                      </label>
                      <input
                        type="number"
                        value={volLookBack}
                        min={1}
                        onChange={(e) => setVolLookBack(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Epochs
                      </label>
                      <input
                        type="number"
                        value={volEpochs}
                        min={1}
                        onChange={(e) => setVolEpochs(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <button
                      onClick={handleVolatilityCalibrate}
                      disabled={volCalibrateLoading || !asset}
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-2 px-4 rounded-lg font-medium hover:from-yellow-600 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      {volCalibrateLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Calibrating...
                        </>
                      ) : (
                        <>
                          <Target className="w-4 h-4" />
                          Calibrate Model
                        </>
                      )}
                    </button>
                    
                    <div className="border-t pt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Days to Forecast
                        </label>
                        <input
                          type="number"
                          value={volForecastDays}
                          min={1}
                          onChange={(e) => setVolForecastDays(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900"
                        />
                      </div>
                      <button
                        onClick={handleVolatilityForecast}
                        disabled={volForecastLoading || !asset}
                        className="w-full mt-4 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-yellow-700 hover:to-yellow-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        {volForecastLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Forecasting...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4" />
                            Forecast Volatility
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ml' && (
                <form onSubmit={handleMLSubmit} className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-t pt-4">Machine Learning</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Days to Predict
                    </label>
                    <input
                      type="number"
                      value={mlDays}
                      min={1}
                      max={365}
                      onChange={(e) => setMlDays(Number(e.target.value))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={mlLoading || !asset}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {mlLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Processing ML...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4" />
                        Generate ML Prediction
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Información adicional por pestaña */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-800 mb-2">ℹ️ Information</h3>
                {activeTab === 'montecarlo' && (
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>• Price Simulation using Monte Carlo</li>
                    <li>• Based on historical volatility</li>
                  </ul>
                )}
                {activeTab === 'volatility' && (
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>• First calibrates the volatility model</li>
                    <li>• Look back: historical periods to use</li>
                    <li>• Epochs: training iterations</li>
                  </ul>
                )}
                {activeTab === 'ml' && (
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>• Prediction using Machine Learning</li>
                    <li>• Market trend analysis</li>
                    <li>• Coverage rate indicates accuracy</li>
                  </ul>
                )}
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
              {getCurrentResult()?.plot ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      {getCurrentTitle()} - {asset?.toUpperCase()}
                    </h2>
                    {activeTab === 'ml' && mlResult && (
                    <div className="text-sm text-gray-500 space-y-1">
                        <div>
                        Coverage Rate: {(mlResult.coverage_rate * 100).toFixed(2)}%
                        </div>
                        <div>
                        Forecast Range:{" "}
                        <span className="font-medium text-gray-800">
                            {mlResult.predictions.pred_lower_price.toFixed(1)} - {mlResult.predictions.pred_upper_price.toFixed(1)}
                        </span>
                        </div>
                        <div>
                        Last Close:{" "}
                        <span className="font-medium text-gray-800">
                            {mlResult.predictions.last_close.toFixed(2)}
                        </span>
                        </div>
                    </div>
                    )}
                    {activeTab === 'montecarlo' && mcResult?.meta && (
                        <div className="text-sm text-gray-500 flex flex-col items-end">
                        <div>Last price: {mcResult.meta.last_price.toFixed(2)}</div>
                        <div>Simulated days: {mcResult.meta.days}</div>
                        <div>Range: {mcResult.meta.lower_price.toFixed(2)} - {mcResult.meta.upper_price.toFixed(2)}</div>
                        </div>
                    )}
                    
                    </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <PlotDynamic
                      data={getCurrentResult()?.plot?.data || []}
                      layout={{
                        ...getCurrentResult()?.plot?.layout,
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
                    {activeTab === 'montecarlo' && <BarChart3 className="w-16 h-16 mx-auto" />}
                    {activeTab === 'volatility' && <Zap className="w-16 h-16 mx-auto" />}
                    {activeTab === 'ml' && <Brain className="w-16 h-16 mx-auto" />}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Without Data {getCurrentTitle()}
                  </h3>
                  <p className="text-gray-600">
                    Select a commodity and run the analysis to see the results here.
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
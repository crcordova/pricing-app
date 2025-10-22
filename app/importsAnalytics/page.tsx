'use client';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, Users, TrendingUp, ShoppingCart, BarChart3, DollarSign } from 'lucide-react';
import { ResponsiveBoxPlot } from '@nivo/boxplot';
import { ResponsiveBar } from '@nivo/bar'
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';

import MarketShareSection from "@/components/market-trends/MarketShareSection";
import MarketTrendsMixedChart from "@/components/market-trends/MarketTrendsMixedChart";
import PriceHistogram from "@/components/price-analysis/PriceHistogram"
import PriceEvolution from "@/components/price-analysis/PriceEvolution"
import CountryComparison from "@/components/price-analysis/CountryComparision"
import TopImportersSection from "@/components/top-importers/TopImportersSection"
import ImporterAnalysis from "@/components/importer-detail/ImporterAnalysis"

import { CountryData } from "@/types/analytics";

// Tipos
type MainTabType = 'products' | 'importers';
type ProductsSubTabType = 'top-importers' | 'price-analysis' | 'market-trends';
type ImportersSubTabType = 'importer-profile' | 'purchase-behavior' | 'price-evolution';


interface TopImporterDetail {
  nombre: string;
  rut: string;
  total_cantidad: number;
  detalle: {
    paises: Record<string, number>;
    marcas: Record<string, number>;
  };
}

interface ChartDataPoint {
  importador: string;
  [key: string]: string | number;
}

interface BoxPlotDataPoint extends Record<string, any> {
  group: string;
  subGroup?: string;
  value: number;
  [key: string]: string | number | undefined;
}

interface EvolutionDatum {
  periodo: string;
  fob_unit_max: number;
  fob_unit_promedio_ponderado: number;
  fob_unit_min: number;
  cantidad_total: number
}

interface EvolutionData {
  producto: string;
  serie_temporal: EvolutionDatum[];
}

interface CountryDatum {
  pais: string;
  volumen: {
    share_mercado_porcentaje: number;
  };
  fob_unit: {
    promedio_ponderado: number;
    minimo: number;
    maximo: number;
  };
  num_transacciones: number;

}

interface TopImporter {
  rut: string;
  nombre: string;
  industria: string | null;
  cantidad_total: number;
  fob_total: number;
  market_share_porcentaje: number;
}

interface ShareImportadoresResponse {
  producto: string;
  mercado_total_cantidad: number;
  concentracion_hhi: number;
  interpretacion_hhi: string;
  top_importadores: TopImporter[];
}

interface SerieTemporalEntry {
  periodo: string;
  cantidad_total: number;
  fob_total: number;
  num_importadores: number;
  num_transacciones: number;
}

interface TendenciasProductoResponse {
  producto: string;
  granularidad: string;
  serie_temporal: SerieTemporalEntry[];
}

interface MarketSharePieChartProps {
  data: ShareImportadoresResponse;
}

interface MarketTrendsMixedChartProps {
  data: TendenciasProductoResponse;
}

interface MarketShareSectionProps {
  data: ShareImportadoresResponse;
}

const API_BASE_URL = 'http://localhost:8000'; // Ajusta según tu configuración

const AnalyticsPage = () => {
  // Estados principales
  const [mainTab, setMainTab] = useState<MainTabType>('products');
  const [productsSubTab, setProductsSubTab] = useState<ProductsSubTabType>('top-importers');
  
  // Estados de datos
  const [productos, setProductos] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [topImporters, setTopImporters] = useState<TopImporterDetail[]>([]);
  const [boxPlotData, setBoxPlotData] = useState<BoxPlotDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingBoxPlot, setLoadingBoxPlot] = useState(false);
  
  // Estados de filtros
  const [topN, setTopN] = useState<number>(5);
  const [fechaStart, setFechaStart] = useState<string>('');
  const [fechaEnd, setFechaEnd] = useState<string>('');
  
  // Estados para visualización
  const [chartView, setChartView] = useState<'paises' | 'marcas'>('paises');

  // Estados para análisis de precios
  const [granularidad, setGranularidad] = useState('month');
  // const [histogramData, setHistogramData] = useState(null);
  const [histogramData, setHistogramData] = useState<{ rango: string; valor: number }[]>([]);
  const [evolutionData, setEvolutionData] = useState<EvolutionData | null>(null);
  const [countryData, setCountryData] = useState<CountryData | null>(null);

  //Estados para market-trends
  const [shareImportadoresData, setShareImportadoresData] = useState<ShareImportadoresResponse | null>(null);
  const [tendenciasProductoData, setTendenciasProductoData] = useState<TendenciasProductoResponse | null>(null);


  // Pestañas principales
  const mainTabs = [
    { id: 'products' as const, label: 'Products', icon: Package, color: 'blue' },
    { id: 'importers' as const, label: 'Importers', icon: Users, color: 'purple' }
  ];

  // Sub-pestañas para Products
  const productsSubTabs = [
    { id: 'top-importers' as const, label: 'Top Importers', icon: TrendingUp, color: 'blue' },
    { id: 'price-analysis' as const, label: 'Price Analysis', icon: DollarSign, color: 'green' },
    { id: 'market-trends' as const, label: 'Market Trends', icon: BarChart3, color: 'indigo' }
  ];

  // Cargar productos disponibles
  useEffect(() => {
    if (mainTab === 'products') {
      fetchProductos();
    }
  }, [mainTab]);

  const fetchProductos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/products`);
      const data = await response.json();
      setProductos(data.productos || []);
      if (data.productos && data.productos.length > 0) {
        setSelectedProduct(data.productos[0]);
      }
    } catch (error) {
      console.error('Error fetching productos:', error);
      // Datos de ejemplo para desarrollo
      setProductos(['OXIDO DE ZINC', 'OXIDO CUPROSO']);
      setSelectedProduct('OXIDO DE ZINC');
    }
  };

  const fetchTopImporters = async () => {
    if (!selectedProduct) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        producto_nombre: selectedProduct,
        n: topN.toString(),
      });
      
      if (fechaStart) params.append('fecha_start', fechaStart);
      if (fechaEnd) params.append('fecha_end', fechaEnd);

      const response = await fetch(`${API_BASE_URL}/analytics/top_importadores_detalle?${params}`);
      const data = await response.json();
      setTopImporters(data || []);
      
      // Automáticamente cargar el boxplot después de obtener los importadores
      if (data && data.length > 0) {
        const ruts = data.map((imp: TopImporterDetail) => imp.rut);
        await fetchBoxPlotData(ruts);
      }
    } catch (error) {
      console.error('Error fetching top importers:', error);
      // Datos de ejemplo para desarrollo
      const mockData: TopImporterDetail[] = [
        {
          nombre: "VETERQUIMICA S.A.",
          rut: "82524300",
          total_cantidad: 1968500,
          detalle: {
            paises: { "MEXICO": 1968500 },
            marcas: { "ZINT-F": 144000, "ZINC I.-F": 24000, "ZINC INTERNATIONAL-F": 1800500 }
          }
        },
        {
          nombre: "QUIMETAL INDUSTRIAL S A",
          rut: "87001500",
          total_cantidad: 631200,
          detalle: {
            paises: { "PERU": 631200 },
            marcas: { "ZINSA-F": 631200 }
          }
        }
      ];
      setTopImporters(mockData);
      await fetchBoxPlotData(mockData.map(imp => imp.rut));
    } finally {
      setLoading(false);
    }
  };

  const fetchBoxPlotData = async (ruts: string[]) => {
    if (!selectedProduct || ruts.length === 0) return;
    
    setLoadingBoxPlot(true);
    try {
      const params = new URLSearchParams({
        producto_nombre: selectedProduct,
      });
      
      // Agregar múltiples RUTs como parámetros de query
      ruts.forEach(rut => params.append('importadores_rut', rut));
      
      if (fechaStart) params.append('fecha_start', fechaStart);
      if (fechaEnd) params.append('fecha_end', fechaEnd);

      const response = await fetch(`${API_BASE_URL}/analytics/boxplot_fob_unit?${params}`);
      const data = await response.json();
      setBoxPlotData(data || []);
    } catch (error) {
      console.error('Error fetching boxplot data:', error);
      // Datos de ejemplo para desarrollo
      const mockBoxPlotData: BoxPlotDataPoint[] = [];
      ruts.forEach(rut => {
        // Generar valores aleatorios para cada RUT
        const baseValue = 8 + Math.random() * 5;
        for (let i = 0; i < 20; i++) {
          mockBoxPlotData.push({
            group: rut,
            value: baseValue + (Math.random() - 0.5) * 3
          });
        }
      });
      setBoxPlotData(mockBoxPlotData as unknown as BoxPlotDataPoint[]);
    } finally {
      setLoadingBoxPlot(false);
    }
  };

  const fetchPriceAnalysis  = async () => {
    if (!selectedProduct) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        producto_nombre: selectedProduct,
        bins: '10',
        // ...(dateRange && { fecha_start: dateRange }),
        // ...(dateRange && { fecha_end: dateRange })
      });
      if (fechaStart) params.append('fecha_start', fechaStart);
      if (fechaEnd) params.append('fecha_end', fechaEnd);

      // Fetch histogram
      const histResponse = await fetch(`${API_BASE_URL}/analytics/histograma_fob_unit?${params}`);
      const histData = await histResponse.json();
      console.log("Hist data:", histData);
      
      // Transform histogram data
      const transformedHist = histData.bins.map((bin: number, idx: number) => ({
        rango: `${bin.toFixed(2)} - ${(histData.bins[idx + 1] || bin + 1).toFixed(2)}`,
        valor: histData.values[idx] || 0
      })).filter((_: unknown, idx:number) => idx < histData.bins.length - 1);
      setHistogramData(transformedHist);

      // Fetch evolution
      const evolParams = new URLSearchParams({
        producto_nombre: selectedProduct,
        granularidad: granularidad,
        agrupar_por: 'global',

      });
      if (fechaStart) evolParams.append('fecha_start', fechaStart);
      if (fechaEnd) evolParams.append('fecha_end', fechaEnd);

      const evolResponse = await fetch(`${API_BASE_URL}/analytics/pricing/evolucion-precios?${evolParams}`);
      const evolData = await evolResponse.json();
      // console.log("Evol data:", evolData);
      setEvolutionData(evolData);

      // Fetch country comparison
      const countryResponse = await fetch(`${API_BASE_URL}/analytics/pricing/comparativa-paises?${params}`);
      const countryInfo = await countryResponse.json();
      // console.log("Country data:", countryInfo);
      setCountryData(countryInfo);

    } catch (error) {
      console.error('Error fetching analysis:', error);
    } finally {
      setLoading(false);
    }
  };
  // Preparar datos para el BoxPlot de Nivo
  const prepareBoxPlotData = () => {
    if (boxPlotData.length === 0) return [];

    // Crear un mapa de RUT a nombre
    const rutToName = new Map<string, string>();
    topImporters.forEach(imp => {
      rutToName.set(imp.rut, imp.nombre);
    });

    // Nivo BoxPlot necesita los valores individuales con group
    // Reemplazar RUT por nombre de importador
    return boxPlotData.map(item => ({
      group: rutToName.get(item.group) || item.group,
      value: item.value
    }));
  };

  // Preparar datos para gráficos
  // const prepareChartData = (): ChartDataPoint[] => {
  //   if (chartView === 'paises') {
  //     return topImporters.map(imp => {
  //       const dataPoint: ChartDataPoint = { importador: imp.nombre };
  //       Object.entries(imp.detalle.paises).forEach(([pais, cantidad]) => {
  //         dataPoint[pais] = cantidad;
  //       });
  //       return dataPoint;
  //     });
  //   } else {
  //     return topImporters.map(imp => {
  //       const dataPoint: ChartDataPoint = { importador: imp.nombre };
  //       Object.entries(imp.detalle.marcas).forEach(([marca, cantidad]) => {
  //         dataPoint[marca] = cantidad;
  //       });
  //       return dataPoint;
  //     });
  //   }
  // };

  // const getChartKeys = (): string[] => {
  //   if (topImporters.length === 0) return [];
    
  //   const keysSet = new Set<string>();
  //   topImporters.forEach(imp => {
  //     const detalle = chartView === 'paises' ? imp.detalle.paises : imp.detalle.marcas;
  //     Object.keys(detalle).forEach(key => keysSet.add(key));
  //   });
    
  //   return Array.from(keysSet);
  // };

  const fetchMarketTrendsData = async () => {
  if (!selectedProduct) return;
  setLoading(true);
  try {
      const params = new URLSearchParams();
      params.append("producto_nombre", selectedProduct);
      if (fechaStart) params.append("fecha_start", fechaStart);
      if (fechaEnd) params.append("fecha_end", fechaEnd);
      params.append("top_n", topN.toString());
      params.append("granularidad", granularidad);

      const [shareRes, tendenciasRes] = await Promise.all([
        fetch(`${API_BASE_URL}/analytics/mercado/share-importadores?${params}`),
        fetch(`${API_BASE_URL}/analytics/mercado/tendencias-producto?${params}`),
      ]);
      const shareData = await shareRes.json();
      const tendenciasData = await tendenciasRes.json();

      setShareImportadoresData(shareData);
      setTendenciasProductoData(tendenciasData);
    } catch (error) {
      console.error("Error fetching market trends data", error);
    } finally {
      setLoading(false);
    }
  };

  const [importers, setImporters] = useState<any[]>([]);
  const fetchImporters = async () => {
    if (!selectedProduct) return;
    const res = await fetch(`${API_BASE_URL}/importadores/product/${selectedProduct}`);
    const data = await res.json();
    setImporters(data);
  };
  const [selectedImporter, setSelectedImporter] = useState("");
  
  const [importerData, setImporterData] = useState<any | null>(null);
  const fetchImporterDetail = async () => {
    if (!selectedImporter) return;
    const url = `${API_BASE_URL}/analytics/importador_detalle/${selectedImporter}?fecha_start=${fechaStart}&fecha_end=${fechaEnd}`;
    const res = await fetch(url);
    const data = await res.json();
    setImporterData(data);
  };


  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#6366f1'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  Import Analytics
                </h1>
                <p className="text-gray-600 mt-1">
                  Market intelligence: Products, Importers, and Price Analysis
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-600">
            <nav className="-mb-px flex space-x-8">
              {mainTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = mainTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setMainTab(tab.id)}
                    className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-200 ${
                      isActive 
                        ? `border-${tab.color}-500 text-${tab.color}-600` 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sub Tabs - Products */}
        {mainTab === 'products' && (
          <div className="mb-8">
            <div className="border-b border-gray-200 text-gray-600">
              <nav className="-mb-px flex space-x-8">
                {productsSubTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = productsSubTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setProductsSubTab(tab.id)}
                      className={`py-3 px-4 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-200 ${
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
        )}

        {/* Content Area - Top Importers */}
        {mainTab === 'products' && productsSubTab === 'top-importers' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-gray-600">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product
                  </label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {productos.map(producto => (
                      <option key={producto} value={producto}>{producto}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Top N
                  </label>
                  <input
                    type="number"
                    value={topN}
                    onChange={(e) => setTopN(parseInt(e.target.value) || 5)}
                    min="1"
                    max="20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={fechaStart}
                    onChange={(e) => setFechaStart(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={fechaEnd}
                    onChange={(e) => setFechaEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={fetchTopImporters}
                  disabled={loading || !selectedProduct}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Loading...' : 'Analyze'}
                </button>
              </div>
            </div>

            {/* Results */}
            {topImporters.length > 0 && (
              <TopImportersSection
                topImporters={topImporters}
                boxPlotData={boxPlotData}
                loadingBoxPlot={loadingBoxPlot}
                chartView={chartView}
                setChartView={setChartView}
                colors={colors}
              />
            )}
          </div>
        )}

        {/* Placeholder for other tabs */}
        {mainTab === 'products' && productsSubTab === 'price-analysis' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-gray-600">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {productos.map(producto => (
                    <option key={producto} value={producto}>{producto}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={fechaStart}
                  onChange={(e) => setFechaStart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={fechaEnd}
                  onChange={(e) => setFechaEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Granularity
                </label>
                <select
                  value={granularidad}
                  onChange={(e) => setGranularidad(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="month">Monthly</option>
                  <option value="quarter">Quarterly</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={fetchPriceAnalysis}
                disabled={loading || !selectedProduct}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Loading...' : 'Analyze'}
              </button>
            </div>
          </div>

          {/* Histograma de Precios */}
          {histogramData && <PriceHistogram data={histogramData} />}

          {/* Evolución de Precios */}
         {evolutionData && <PriceEvolution data={evolutionData} />}

          {/* Country Comparison */}
          {countryData && <CountryComparison data={countryData} />}

          {/* Empty State */}
          {!histogramData && !evolutionData && !countryData && !loading && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500 text-lg">
                Select a product and press &quot;Analyze&quot; to view price analysis
              </p>
            </div>
          )}
        </div>
      )}

        {mainTab=== 'products' && productsSubTab === 'market-trends'&& (
          <div className="space-y-8 text-gray-600">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-gray-600">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Market Trends Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Producto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {productos.map((producto) => (
                    <option key={producto} value={producto}>{producto}</option>
                  ))}
                </select>
              </div>

              {/* Fecha inicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={fechaStart}
                  onChange={(e) => setFechaStart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Fecha fin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={fechaEnd}
                  onChange={(e) => setFechaEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Granularidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Granularity</label>
                <select
                  value={granularidad}
                  onChange={(e) => setGranularidad(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="month">Monthly</option>
                  <option value="quarter">Quarterly</option>
                </select>
              </div>
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={fetchMarketTrendsData}
                disabled={loading}
                className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? "Loading..." : "Analyze"}
              </button>
            </div>
          </div>

          {/* Charts */}
          {shareImportadoresData && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Share</h3>
              <div className="h-96">
                <MarketShareSection data={shareImportadoresData} />
              </div>
            </div>
          )}

          {tendenciasProductoData && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Trends</h3>
              <div className="h-[500px]">
                <MarketTrendsMixedChart data={tendenciasProductoData} />
              </div>
            </div>
          )}
        </div>
      )}

        {mainTab === 'importers' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Importers Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-600">
              {/* Producto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {productos.map((producto) => (
                    <option key={producto} value={producto}>{producto}</option>
                  ))}
                </select>
              </div>

              {/* Fecha inicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={fechaStart}
                  onChange={(e) => setFechaStart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Fecha fin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={fechaEnd}
                  onChange={(e) => setFechaEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={fetchImporters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition mb-6">
              Search Importers
            </button>

            {/* Select de importadores */}
            {importers.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Importer
                </label>
                <select
                  value={selectedImporter}
                  onChange={(e) => setSelectedImporter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-600"
                >
                  <option value="">Select importer</option>
                  {importers.map((imp) => (
                    <option key={imp.rut} value={imp.rut}>
                      {imp.nombre} — {imp.rut}-{imp.dv}
                    </option>
                  ))}
                </select>
                <button
                  onClick={fetchImporterDetail}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                  Importer DEtails
                </button>
              </div>
            )}

            {/* Resultados */}
            {importerData && (
              <ImporterAnalysis data={importerData}  />
            )}

          </div>
          

        )}
      </div>
    </div>
  );
};


export default AnalyticsPage;
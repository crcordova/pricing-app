'use client';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, Users, TrendingUp, ShoppingCart, BarChart3, DollarSign } from 'lucide-react';
import { ResponsiveBoxPlot } from '@nivo/boxplot';
import { ResponsiveBar } from '@nivo/bar'
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';


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

interface CountryData {
  comparativa_paises: CountryDatum[];
  pais_mas_competitivo: string;
  total_paises: string
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
  const prepareChartData = (): ChartDataPoint[] => {
    if (chartView === 'paises') {
      return topImporters.map(imp => {
        const dataPoint: ChartDataPoint = { importador: imp.nombre };
        Object.entries(imp.detalle.paises).forEach(([pais, cantidad]) => {
          dataPoint[pais] = cantidad;
        });
        return dataPoint;
      });
    } else {
      return topImporters.map(imp => {
        const dataPoint: ChartDataPoint = { importador: imp.nombre };
        Object.entries(imp.detalle.marcas).forEach(([marca, cantidad]) => {
          dataPoint[marca] = cantidad;
        });
        return dataPoint;
      });
    }
  };

  const getChartKeys = (): string[] => {
    if (topImporters.length === 0) return [];
    
    const keysSet = new Set<string>();
    topImporters.forEach(imp => {
      const detalle = chartView === 'paises' ? imp.detalle.paises : imp.detalle.marcas;
      Object.keys(detalle).forEach(key => keysSet.add(key));
    });
    
    return Array.from(keysSet);
  };

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

  // const MarketSharePieChart: React.FC<MarketSharePieChartProps> = ({ data }) => {
  //   const pieData = data.top_importadores.map((imp) => ({
  //     id: imp.nombre,
  //     label: imp.nombre,
  //     value: imp.market_share_porcentaje,
  //   }));

  //   return (
  //     <ResponsivePie
  //       data={pieData}
  //       margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
  //       innerRadius={0.5}
  //       padAngle={1}
  //       cornerRadius={4}
  //       activeOuterRadiusOffset={8}
  //       colors={{ scheme: "nivo" }}
  //       borderWidth={1}
  //       borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
  //       arcLinkLabelsSkipAngle={10}
  //       arcLinkLabelsTextColor="#333"
  //       arcLinkLabelsThickness={2}
  //       arcLabelsSkipAngle={10}
  //       arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
  //       tooltip={({ datum }) => (
  //         <div className="bg-white text-sm p-2 shadow rounded">
  //           <strong>{datum.label}</strong>
  //           <br />
  //           {datum.value.toFixed(2)}%
  //         </div>
  //       )}
  //     />
  //   );
  // };
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

  const MarketTrendsMixedChart: React.FC<MarketTrendsMixedChartProps> = ({ data }) => {
    const barData = data.serie_temporal.map((d) => ({
      periodo: d.periodo,
      cantidad_total: d.cantidad_total,
    }));

    const lineData = [
      {
        id: "FOB Total",
        data: data.serie_temporal.map((d) => ({
          x: d.periodo,
          y: d.fob_total,
        })),
      },
    ];

    return (
      <div className="relative h-full">
        {/* Ejes y layout compartido */}
        <ResponsiveBar
          data={barData}
          keys={["cantidad_total"]}
          indexBy="periodo"
          margin={{ top: 40, right: 60, bottom: 50, left: 60 }}
          axisBottom={{
            tickRotation: -45,
            legend: "Period",
            legendOffset: 40,
            legendPosition: "middle",
          }}
          axisLeft={{
            legend: "Quantity",
            legendOffset: -50,
            legendPosition: "middle",
          }}
          colors={{ scheme: "set2" }}
          enableLabel={false}
          tooltip={({ indexValue, value }) => (
            <div className="bg-white text-sm p-2 shadow rounded">
              <strong>{indexValue}</strong>
              <br />
              Quantity: {value}
            </div>
          )}
        />
        {/* Line chart encima */}
        <div className="absolute inset-0 pointer-events-none">
          <ResponsiveLine
            data={lineData}
            margin={{ top: 40, right: 60, bottom: 50, left: 60 }}
            xScale={{ type: "point" }}
            yScale={{ type: "linear", min: "auto", max: "auto" }}
            axisLeft={null}
            axisBottom={null}
            colors={{ scheme: "accent" }}
            pointSize={6}
            enablePoints
            lineWidth={3}
            useMesh
          />
        </div>
      </div>
    );
  }

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
              <>
                {/* View Toggle */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Top {topImporters.length} Importers - {selectedProduct}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setChartView('paises')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          chartView === 'paises'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        By Country
                      </button>
                      <button
                        onClick={() => setChartView('marcas')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          chartView === 'marcas'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        By Brand
                      </button>
                    </div>
                  </div>
                </div>

                {/* Chart */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-gray-600">
                  <div style={{ height: '500px' }}>
                    <ResponsiveBar 
                      data={prepareChartData()} 
                      keys={getChartKeys()}
                      indexBy="importador"
                      colors={colors}
                    />
                  </div>
                </div>

                {/* Details Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Importer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            RUT
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Quantity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Countries
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Brands
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {topImporters.map((imp, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {imp.nombre}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {imp.rut}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {imp.total_cantidad.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              <div className="space-y-1">
                                {Object.entries(imp.detalle.paises).map(([pais, cant]) => (
                                  <div key={pais}>
                                    <span className="font-medium">{pais}:</span> {cant.toLocaleString()}
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              <div className="space-y-1">
                                {Object.entries(imp.detalle.marcas).map(([marca, cant]) => (
                                  <div key={marca}>
                                    <span className="font-medium">{marca}:</span> {cant.toLocaleString()}
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* BoxPlot - FOB Unit Price Analysis */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-gray-600">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      FOB Unit Price Distribution by Importer
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Compare unit prices (FOB) across different importers to identify pricing patterns and opportunities
                    </p>
                  </div>
                  
                  {loadingBoxPlot ? (
                    <div className="h-96 flex items-center justify-center">
                      <div className="text-gray-400">Loading price data...</div>
                    </div>
                  ) : boxPlotData.length > 0 ? (
                    <div style={{ height: '500px' }}>
                      <ResponsiveBoxPlot
                        data={prepareBoxPlotData() as any}
                        margin={{ top: 60, right: 80, bottom: 100, left: 80 }}
                        minValue="auto"
                        maxValue="auto"
                        quantiles={[0.1, 0.25, 0.5, 0.75, 0.9]}
                        padding={0.12}
                        innerPadding={3}
                        enableGridX={true}
                        enableGridY={true}
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                          tickSize: 5,
                          tickPadding: 5,
                          tickRotation: -45,
                          legend: 'Importer',
                          legendPosition: 'middle',
                          legendOffset: 80,
                          truncateTickAt: 0
                        }}
                        axisLeft={{
                          tickSize: 5,
                          tickPadding: 5,
                          tickRotation: 0,
                          legend: 'FOB Unit Price (USD)',
                          legendPosition: 'middle',
                          legendOffset: -60,
                          format: (value) => `${value.toFixed(2)}`
                        }}
                        colors={{ scheme: 'set2' }}
                        borderRadius={2}
                        borderWidth={2}
                        borderColor={{
                          from: 'color',
                          modifiers: [['darker', 0.3]]
                        }}
                        medianWidth={3}
                        medianColor={{
                          from: 'color',
                          modifiers: [['darker', 0.8]]
                        }}
                        whiskerWidth={3}
                        whiskerEndSize={0.6}
                        whiskerColor={{
                          from: 'color',
                          modifiers: [['darker', 0.3]]
                        }}
                        motionConfig="gentle"
                        theme={{
                          text: {
                            fontSize: 12,
                            fill: '#6b7280', // equivalente a textColor
                          },
                          axis: {
                            legend: {
                              text: {
                                fontSize: 13,
                                fontWeight: 600,
                                fill: '#374151',
                              },
                            },
                            ticks: {
                              text: {
                                fontSize: 11,
                                fill: '#6b7280',
                              },
                            },
                          },
                          legends: {
                            text: {
                              fontSize: 12,
                              fill: '#6b7280',
                            },
                          },
                        }as any}
                      />
                    </div>
                  ) : (
                    <div className="h-96 flex items-center justify-center">
                      <div className="text-gray-400">No price data available</div>
                    </div>
                  )}
                  
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">How to read this chart:</span> The box shows the price range where most purchases occur. 
                      The line in the middle is the median price. Dots outside the whiskers represent outlier prices. 
                      Compare boxes to identify which importers get better pricing.
                    </p>
                  </div>
                </div>
              </>
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
          {histogramData && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-gray-600">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">FOB Unit Price Distribution</h2>
              <div style={{ height: '400px' }}>
                <ResponsiveBar
                  data={histogramData}
                  keys={['valor']}
                  indexBy="rango"
                  margin={{ top: 20, right: 30, bottom: 80, left: 80 }}
                  padding={0.3}
                  valueScale={{ type: 'linear' }}
                  colors="#3b82f6"
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: -45,
                    legend: 'Price Range',
                    legendPosition: 'middle',
                    legendOffset: 60
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'FOB Value',
                    legendPosition: 'middle',
                    legendOffset: -60,
                    format: (value) => `$${(value / 1000).toFixed(0)}K`
                  }}
                  labelSkipWidth={12}
                  labelSkipHeight={12}
                  labelTextColor="#ffffff"
                  tooltip={({ value }) => (
                    <div className="bg-white px-3 py-2 shadow-lg rounded border border-gray-200">
                      <strong>${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                    </div>
                  )}
                  theme={{
                    text:{
                      fontSize: 12,
                      fill: '#6b7280'
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Evolución de Precios */}
          {evolutionData && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-gray-600">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Price Evolution - {evolutionData.producto}
              </h2>
              
              {/* Price Chart with Bands */}
              <div style={{ height: '400px' }} className="mb-6">
                <ResponsiveLine
                  data={[
                    {
                      id: 'Max Price',
                      data: evolutionData.serie_temporal.map(d => ({
                        x: d.periodo,
                        y: d.fob_unit_max
                      }))
                    },
                    {
                      id: 'Average Price',
                      data: evolutionData.serie_temporal.map(d => ({
                        x: d.periodo,
                        y: d.fob_unit_promedio_ponderado
                      }))
                    },
                    {
                      id: 'Min Price',
                      data: evolutionData.serie_temporal.map(d => ({
                        x: d.periodo,
                        y: d.fob_unit_min
                      }))
                    }
                  ]}
                  margin={{ top: 20, right: 120, bottom: 50, left: 60 }}
                  xScale={{ type: 'point' }}
                  yScale={{
                    type: 'linear',
                    min: 'auto',
                    max: 'auto',
                    stacked: false,
                    reverse: false
                  }}
                  curve="monotoneX"
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: -45,
                    legend: 'Period',
                    legendOffset: 40,
                    legendPosition: 'middle'
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'FOB Unit Price',
                    legendOffset: -50,
                    legendPosition: 'middle',
                    format: (value) => `$${value.toFixed(2)}`
                  }}
                  enableArea={true}
                  areaOpacity={0.1}
                  colors={['#ef4444', '#8b5cf6', '#10b981']}
                  pointSize={6}
                  pointColor={{ theme: 'background' }}
                  pointBorderWidth={2}
                  pointBorderColor={{ from: 'serieColor' }}
                  pointLabelYOffset={-12}
                  useMesh={true}
                  legends={[
                    {
                      anchor: 'bottom-right',
                      direction: 'column',
                      justify: false,
                      translateX: 100,
                      translateY: 0,
                      itemsSpacing: 0,
                      itemDirection: 'left-to-right',
                      itemWidth: 80,
                      itemHeight: 20,
                      itemOpacity: 0.75,
                      symbolSize: 12,
                      symbolShape: 'circle',
                      symbolBorderColor: 'rgba(0, 0, 0, .5)',
                      effects: [
                        {
                          on: 'hover',
                          style: {
                            itemBackground: 'rgba(0, 0, 0, .03)',
                            itemOpacity: 1
                          }
                        }
                      ]
                    }
                  ]}
                  tooltip={({ point }) => (
                    <div className="bg-white px-3 py-2 shadow-lg rounded border border-gray-200">
                      <strong>{point.seriesId}</strong>: ${point.data.y.toFixed(2)}
                    </div>
                  )}
                />
              </div>

              {/* Volume Chart */}
              <div style={{ height: '250px' }}>
                <ResponsiveBar
                  data={evolutionData.serie_temporal.map(d => ({
                    periodo: d.periodo,
                    cantidad: d.cantidad_total
                  }))}
                  keys={['cantidad']}
                  indexBy="periodo"
                  margin={{ top: 20, right: 30, bottom: 50, left: 80 }}
                  padding={0.3}
                  valueScale={{ type: 'linear' }}
                  colors="#10b981"
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: -45,
                    legend: 'Period',
                    legendPosition: 'middle',
                    legendOffset: 40
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Total Volume',
                    legendPosition: 'middle',
                    legendOffset: -60,
                    format: (value) => value.toLocaleString()
                  }}
                  labelSkipWidth={12}
                  labelSkipHeight={12}
                  labelTextColor="#ffffff"
                  tooltip={({ value }) => (
                    <div className="bg-white px-3 py-2 shadow-lg rounded border border-gray-200">
                      <strong>Volume:</strong> {value.toLocaleString()}
                    </div>
                  )}
                />
              </div>
            </div>
          )}

          {/* Country Comparison */}
          {countryData && (
          // {countryData && countryData.comparativa_paises && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Market Share Pie Chart */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-gray-600">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Market Share by Country</h2>
                <div style={{ height: '350px' }}>
                  <ResponsivePie
                    data={countryData.comparativa_paises.map(country => ({
                      id: country.pais,
                      label: country.pais,
                      value: country.volumen.share_mercado_porcentaje
                    }))}
                    margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
                    innerRadius={0.5}
                    padAngle={0.7}
                    cornerRadius={3}
                    activeOuterRadiusOffset={8}
                    colors={{ scheme: 'nivo' }}
                    borderWidth={1}
                    borderColor={{
                      from: 'color',
                      modifiers: [['darker', 0.2]]
                    }}
                    arcLinkLabelsSkipAngle={10}
                    arcLinkLabelsTextColor="#333333"
                    arcLinkLabelsThickness={2}
                    arcLinkLabelsColor={{ from: 'color' }}
                    arcLabelsSkipAngle={10}
                    arcLabelsTextColor={{
                      from: 'color',
                      modifiers: [['darker', 2]]
                    }}
                    valueFormat={(value) => `${value.toFixed(1)}%`}
                    tooltip={({ datum }) => (
                      <div className="bg-white px-3 py-2 shadow-lg rounded border border-gray-200">
                        <strong>{datum.label}</strong>: {datum.value.toFixed(2)}%
                      </div>
                    )}
                  />
                </div>
                <div className="mt-4 text-sm text-gray-600 border-t pt-4">
                  <p><strong>Most Competitive Country:</strong> {countryData.pais_mas_competitivo}</p>
                  <p><strong>Total Countries:</strong> {countryData.total_paises}</p>
                </div>
              </div>

              {/* Price Comparison Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Price Comparison by Country</h2>
                <div className="overflow-auto" style={{ maxHeight: '400px' }}>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Country
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Average
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Min
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Max
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trans.
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {countryData.comparativa_paises.map((country, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {country.pais}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900 font-semibold">
                            ${country.fob_unit.promedio_ponderado.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-green-600">
                            ${country.fob_unit.minimo.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-red-600">
                            ${country.fob_unit.maximo.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-600">
                            {country.num_transacciones}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!histogramData && !evolutionData && !countryData && !loading && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500 text-lg">
                Select a product and press "Analyze" to view price analysis
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
            <p className="text-gray-500 text-lg">Importers Analysis - Coming Soon</p>
          </div>
        )}
      </div>
    </div>
  );
};


export default AnalyticsPage;
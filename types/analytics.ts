
export interface TopImporterDetail {
  nombre: string;
  rut: string;
  total_cantidad: number;
  detalle: {
    paises: Record<string, number>;
    marcas: Record<string, number>;
  };
}

export interface ChartDataPoint {
  importador: string;
  [key: string]: string | number;
}

export interface BoxPlotDataPoint extends Record<string, any> {
  group: string;
  subGroup?: string;
  value: number;
  [key: string]: string | number | undefined;
}

export interface EvolutionDatum {
  periodo: string;
  fob_unit_max: number;
  fob_unit_promedio_ponderado: number;
  fob_unit_min: number;
  cantidad_total: number
}

export interface EvolutionData {
  producto: string;
  serie_temporal: EvolutionDatum[];
}

export interface CountryDatum {
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

export interface CountryData {
  comparativa_paises: CountryDatum[];
  pais_mas_competitivo: string;
  total_paises: string
}

export interface TopImporter {
  rut: string;
  nombre: string;
  industria: string | null;
  cantidad_total: number;
  fob_total: number;
  market_share_porcentaje: number;
}

export interface ShareImportadoresResponse {
  producto: string;
  mercado_total_cantidad: number;
  concentracion_hhi: number;
  interpretacion_hhi: string;
  top_importadores: TopImporter[];
}

export interface SerieTemporalEntry {
  periodo: string;
  cantidad_total: number;
  fob_total: number;
  num_importadores: number;
  num_transacciones: number;
}

export interface TendenciasProductoResponse {
  producto: string;
  granularidad: string;
  serie_temporal: SerieTemporalEntry[];
}

export interface MarketSharePieChartProps {
  data: ShareImportadoresResponse;
}

export interface MarketTrendsMixedChartProps {
  data: TendenciasProductoResponse;
}

export interface MarketShareSectionProps {
  data: ShareImportadoresResponse;
}

export interface BoxPlotItem {
  group: string;
  value: number;
}
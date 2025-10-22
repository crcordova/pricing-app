
import React from 'react';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveScatterPlot } from '@nivo/scatterplot';

// Tipos para TypeScript
interface FOBUnit {
  minimo: number | null;
  maximo: number | null;
  promedio_ponderado: number | null;
}

interface Marca {
  marca_nombre: string;
  cantidad_total: number;
  fob_total: number;
  fob_unit: FOBUnit;
}

interface Pais {
  pais_nombre: string;
  total_cantidad: number;
  total_fob: number;
  fob_unit: FOBUnit;
  marcas: Marca[];
}

interface Producto {
  producto_nombre: string;
  partida_arancelaria: string;
  total_cantidad: number;
  total_fob: number;
  fob_unit_promedio_ponderado: number;
  paises: Pais[];
}

interface ImporterData {
  importador: {
    rut: string;
    nombre: string;
    industria: string | null;
  };
  productos: Producto[];
}

interface ImporterAnalysisProps {
  data: ImporterData;
}

const ImporterAnalysis = ({ data }: ImporterAnalysisProps) => {
  // Función para formatear números
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-CL').format(Math.round(num));
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(num);
  };

  // Preparar datos por producto
  const renderProductAnalysis = (producto: Producto, index: number) => {
    // 1. Datos para pie chart: Distribución de cantidades por marca
    const cantidadPorMarca = producto.paises.flatMap(pais =>
      pais.marcas.map(marca => ({
        id: marca.marca_nombre,
        label: marca.marca_nombre,
        value: marca.cantidad_total
      }))
    );

    // 2. Datos para pie chart: Distribución por país
    const cantidadPorPais = producto.paises.map(pais => ({
      id: pais.pais_nombre,
      label: pais.pais_nombre,
      value: pais.total_cantidad
    }));

    // 3. Scatter plot: Relación precio vs cantidad
    const scatterData = [{
      id: producto.producto_nombre,
      data: producto.paises.flatMap(pais =>
        pais.marcas.map(marca => ({
          x: marca.cantidad_total,
          y: marca.fob_unit.promedio_ponderado || 0,
          marca: marca.marca_nombre,
          pais: pais.pais_nombre
        }))
      )
    }];

    // 4. Comparación por país
    const paisesList = producto.paises;
    const hayMultiplesPaises = paisesList.length > 1;

    // 5. Todas las marcas consolidadas
    const todasLasMarcas = producto.paises.flatMap(pais => 
      pais.marcas.map(marca => ({
        ...marca,
        pais: pais.pais_nombre
      }))
    );

    return (
      <div key={index} className="mb-12 p-6 bg-white rounded-lg shadow-lg">
        {/* Header del producto */}
        <div className="mb-6 pb-4 border-b-2 border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">{producto.producto_nombre}</h2>
          <p className="text-sm text-gray-600">Partida Arancelaria: {producto.partida_arancelaria}</p>
          <div className="mt-3 grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-xs text-gray-600">Cantidad Total</p>
              <p className="text-lg font-bold text-blue-600">{formatNumber(producto.total_cantidad)} kg</p>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <p className="text-xs text-gray-600">FOB Total</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(producto.total_fob)}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <p className="text-xs text-gray-600">Precio Promedio</p>
              <p className="text-lg font-bold text-purple-600">{formatCurrency(producto.fob_unit_promedio_ponderado)}/kg</p>
            </div>
          </div>
        </div>

        {/* Sección 1: Análisis de Precios por Marca - TABLA */}
        <div className="mb-8 text-gray-600">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">💰 Análisis de Precios por Marca</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg overflow-hidden">
              <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Marca</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">País</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Precio Mínimo</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Precio Promedio</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Precio Máximo</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Rango</th>
                </tr>
              </thead>
              <tbody>
                {todasLasMarcas.map((marca, idx) => {
                  const rango = marca.fob_unit.maximo && marca.fob_unit.minimo 
                    ? marca.fob_unit.maximo - marca.fob_unit.minimo 
                    : 0;
                  return (
                    <tr key={idx} className="border-t hover:bg-blue-50 transition">
                      <td className="px-4 py-3 text-sm font-medium">{marca.marca_nombre}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{marca.pais}</td>
                      <td className="px-4 py-3 text-sm text-right text-green-600 font-semibold">
                        {formatCurrency(marca.fob_unit.minimo || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-blue-600 font-semibold">
                        {formatCurrency(marca.fob_unit.promedio_ponderado || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-red-600 font-semibold">
                        {formatCurrency(marca.fob_unit.maximo || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600">
                        ±{formatCurrency(rango)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 <strong>Tip:</strong> Un rango amplio puede indicar variabilidad en condiciones de compra o calidad del producto.
          </p>
        </div>

        {/* Sección 2: Distribución por Marca */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6 text-gray-600">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700">🥧 Distribución de Volumen por Marca</h3>
            <div style={{ height: '350px' }}>
              <ResponsivePie
                data={cantidadPorMarca}
                margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                colors={{ scheme: 'paired' }}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#333333"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                valueFormat={v => `${formatNumber(v)} kg`}
                tooltip={({ datum }) => (
                  <div className="bg-white p-3 shadow-lg rounded border">
                    <strong>{datum.label}</strong><br/>
                    Cantidad: {formatNumber(datum.value)} kg<br/>
                    {((datum.value / producto.total_cantidad) * 100).toFixed(1)}% del total
                  </div>
                )}
              />
            </div>
          </div>

          {/* Tabla de resumen por marca */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700">📋 Resumen por Marca</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded-lg overflow-hidden">
                <thead className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold">Marca</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold">Cantidad</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold">% Total</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold">FOB Total</th>
                  </tr>
                </thead>
                <tbody>
                  {todasLasMarcas.map((marca, idx) => (
                    <tr key={idx} className="border-t hover:bg-purple-50 transition">
                      <td className="px-4 py-2 text-sm font-medium">{marca.marca_nombre}</td>
                      <td className="px-4 py-2 text-sm text-right">{formatNumber(marca.cantidad_total)} kg</td>
                      <td className="px-4 py-2 text-sm text-right">
                        {((marca.cantidad_total / producto.total_cantidad) * 100).toFixed(1)}%
                      </td>
                      <td className="px-4 py-2 text-sm text-right font-semibold text-green-600">
                        {formatCurrency(marca.fob_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sección 3: Distribución por País */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6 text-gray-600">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700">🌍 Distribución de Volumen por País</h3>
            <div style={{ height: '350px' }}>
              <ResponsivePie
                data={cantidadPorPais}
                margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                colors={{ scheme: 'set2' }}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#333333"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                valueFormat={v => `${formatNumber(v)} kg`}
                tooltip={({ datum }) => (
                  <div className="bg-white p-3 shadow-lg rounded border">
                    <strong>{datum.label}</strong><br/>
                    Cantidad: {formatNumber(datum.value)} kg<br/>
                    {((datum.value / producto.total_cantidad) * 100).toFixed(1)}% del total
                  </div>
                )}
              />
            </div>
          </div>

          {/* Tabla de resumen por país */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700">📊 Resumen por País</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded-lg overflow-hidden">
                <thead className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold">País</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold">Cantidad</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold">% Total</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold">Precio Prom.</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold">Marcas</th>
                  </tr>
                </thead>
                <tbody>
                  {paisesList.map((pais, idx) => (
                    <tr key={idx} className="border-t hover:bg-green-50 transition">
                      <td className="px-4 py-2 text-sm font-medium">{pais.pais_nombre}</td>
                      <td className="px-4 py-2 text-sm text-right">{formatNumber(pais.total_cantidad)} kg</td>
                      <td className="px-4 py-2 text-sm text-right">
                        {((pais.total_cantidad / producto.total_cantidad) * 100).toFixed(1)}%
                      </td>
                      <td className="px-4 py-2 text-sm text-right font-semibold text-blue-600">
                        {formatCurrency(pais.fob_unit.promedio_ponderado || 0)}
                      </td>
                      <td className="px-4 py-2 text-sm text-right">{pais.marcas.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sección 4: Scatter Plot - Relación Precio vs Cantidad */}
        <div className="mb-8 text-gray-600">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">📈 Análisis Precio vs Volumen de Compra</h3>
          <div style={{ height: '400px' }}>
            <ResponsiveScatterPlot
              data={scatterData}
              margin={{ top: 60, right: 140, bottom: 70, left: 90 }}
              xScale={{ type: 'linear', min: 'auto', max: 'auto' }}
              yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
              colors={{ scheme: 'category10' }}
              blendMode="multiply"
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Cantidad Comprada (kg)',
                legendPosition: 'middle',
                legendOffset: 46,
                format: v => formatNumber(v)
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Precio FOB Unitario (USD/kg)',
                legendPosition: 'middle',
                legendOffset: -60,
                format: v => `$${v.toFixed(2)}`
              }}
              tooltip={({ node }) => (
                <div className="bg-white p-3 shadow-lg rounded border">
                  <strong>{node.data.marca}</strong><br/>
                  País: {node.data.pais}<br/>
                  Cantidad: {formatNumber(node.data.x)} kg<br/>
                  Precio: {formatCurrency(node.data.y)}/kg
                </div>
              )}
              nodeSize={14}
              legends={[
                {
                  anchor: 'bottom-right',
                  direction: 'column',
                  justify: false,
                  translateX: 130,
                  translateY: 0,
                  itemWidth: 100,
                  itemHeight: 12,
                  itemsSpacing: 5,
                  symbolSize: 12,
                  symbolShape: 'circle',
                  effects: [
                    {
                      on: 'hover',
                      style: {
                        itemOpacity: 1
                      }
                    }
                  ]
                }
              ]}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2 bg-blue-50 p-3 rounded">
            💡 <strong>Insight:</strong> Este gráfico muestra la relación entre el volumen de compra y el precio unitario. 
            Marcas con mayor volumen pueden tener economías de escala reflejadas en mejores precios unitarios.
          </p>
        </div>

        {/* Comparación detallada por país (si aplica) */}
        {hayMultiplesPaises && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">🌎 Comparación Detallada por País</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paisesList.map((pais, idx) => (
                <div key={idx} className="border-2 rounded-lg p-4 bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition">
                  <h4 className="font-bold text-xl mb-3 text-gray-800 border-b pb-2">{pais.pais_nombre}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center bg-blue-50 p-2 rounded">
                      <span className="text-gray-600">Cantidad:</span>
                      <span className="font-bold text-blue-600">{formatNumber(pais.total_cantidad)} kg</span>
                    </div>
                    <div className="flex justify-between items-center bg-green-50 p-2 rounded">
                      <span className="text-gray-600">FOB Total:</span>
                      <span className="font-bold text-green-600">{formatCurrency(pais.total_fob)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-purple-50 p-2 rounded">
                      <span className="text-gray-600">Precio Prom:</span>
                      <span className="font-bold text-purple-600">{formatCurrency(pais.fob_unit.promedio_ponderado || 0)}/kg</span>
                    </div>
                    <div className="flex justify-between items-center bg-orange-50 p-2 rounded">
                      <span className="text-gray-600">Rango Precio:</span>
                      <span className="font-semibold text-orange-600">
                        {formatCurrency(pais.fob_unit.minimo || 0)} - {formatCurrency(pais.fob_unit.maximo || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-100 p-2 rounded">
                      <span className="text-gray-600">Marcas:</span>
                      <span className="font-bold text-gray-700">{pais.marcas.length}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gray-50">
      {/* Header del importador */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold mb-2">{data.importador.nombre}</h1>
        <p className="text-blue-100">RUT: {data.importador.rut}</p>
        {data.importador.industria && (
          <p className="text-blue-100">Industria: {data.importador.industria}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="bg-white/20 px-4 py-2 rounded backdrop-blur">
            <span className="font-semibold">{data.productos.length}</span> Producto(s)
          </div>
          <div className="bg-white/20 px-4 py-2 rounded backdrop-blur">
            <span className="font-semibold">
              {data.productos.reduce((sum, p) => sum + p.paises.length, 0)}
            </span> País(es)
          </div>
          <div className="bg-white/20 px-4 py-2 rounded backdrop-blur">
            <span className="font-semibold">
              {data.productos.reduce((sum, p) => 
                sum + p.paises.reduce((s, pa) => s + pa.marcas.length, 0), 0
              )}
            </span> Marca(s)
          </div>
        </div>
      </div>

      {/* Análisis por producto */}
      {data.productos.map((producto, index) => renderProductAnalysis(producto, index))}
    </div>
  );
};

export default ImporterAnalysis;
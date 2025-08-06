'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Plus, Edit2, Trash2, Download, Eye, X, Check, AlertCircle, BarChart3, ExternalLink, TrendingUp } from 'lucide-react';

// const API_BASE = 'http://localhost:8002';
const API_BASE = process.env.NEXT_PUBLIC_URL_SALE_PREDICTION;
const API_REPORT = process.env.NEXT_PUBLIC_URL_SALE_REPORT;

export default function VentasPredictionPage() {
  const [empresas, setEmpresas] = useState({});
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('empresas');
  const [message, setMessage] = useState(null);
  
  // Estados para empresas
  const [newEmpresa, setNewEmpresa] = useState({ empresa: '', industria: '' });
  const [editingEmpresa, setEditingEmpresa] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Estados para ventas
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showVentas, setShowVentas] = useState(false);

  // Cargar empresas al iniciar
  useEffect(() => {
    fetchEmpresas();
    fetchVentas();
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  // API calls para empresas
  const fetchEmpresas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/empresas`);
      const data = await response.json();
      setEmpresas(data.empresas || {});
    } catch (error) {
      showMessage('Error al cargar empresas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addEmpresa = async () => {
    if (!newEmpresa.empresa || !newEmpresa.industria) {
      showMessage('Todos los campos son obligatorios', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/empresas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmpresa)
      });

      if (response.ok) {
        showMessage('Empresa agregada exitosamente');
        setNewEmpresa({ empresa: '', industria: '' });
        setShowAddForm(false);
        fetchEmpresas();
      } else {
        const error = await response.json();
        showMessage(error.detail || 'Error al agregar empresa', 'error');
      }
    } catch (error) {
      showMessage('Error de conexión', 'error');
    }
  };

  const updateEmpresa = async (nombre, nuevaIndustria) => {
    try {
      const response = await fetch(`${API_BASE}/empresas/${nombre}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industria: nuevaIndustria })
      });

      if (response.ok) {
        showMessage('Empresa actualizada exitosamente');
        setEditingEmpresa(null);
        fetchEmpresas();
      } else {
        const error = await response.json();
        showMessage(error.detail || 'Error al actualizar empresa', 'error');
      }
    } catch (error) {
      showMessage('Error de conexión', 'error');
    }
  };

  const deleteEmpresa = async (nombre) => {
    if (!confirm(`¿Estás seguro de eliminar la empresa "${nombre}"?`)) return;

    try {
      const response = await fetch(`${API_BASE}/empresas/${nombre}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showMessage('Empresa eliminada exitosamente');
        fetchEmpresas();
      } else {
        const error = await response.json();
        showMessage(error.detail || 'Error al eliminar empresa', 'error');
      }
    } catch (error) {
      showMessage('Error de conexión', 'error');
    }
  };

  // API calls para ventas
  const fetchVentas = async () => {
    try {
      const response = await fetch(`${API_BASE}/ventas`);
      const data = await response.json();
      setVentas(data.ventas || []);
    } catch (error) {
      console.error('Error al cargar ventas:', error);
    }
  };

  const uploadVentas = async () => {
    if (!selectedFile) {
      showMessage('Selecciona un archivo CSV', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setLoading(true);
      setUploadProgress(0);
      
      const response = await fetch(`${API_BASE}/ventas/cargar`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        showMessage(`${result.registros_cargados} registros cargados exitosamente`);
        setSelectedFile(null);
        fetchVentas();
      } else {
        const error = await response.json();
        if (error.detail?.errores) {
          showMessage(`Errores en el archivo: ${error.detail.errores.slice(0, 3).join(', ')}`, 'error');
        } else {
          showMessage(error.detail || 'Error al cargar archivo', 'error');
        }
      }
    } catch (error) {
      showMessage('Error de conexión', 'error');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const downloadExample = async (separador = ',') => {
    try {
      const response = await fetch(`${API_BASE}/ventas/ejemplo?separador=${separador}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ejemplo_ventas_${separador === ';' ? 'español' : 'internacional'}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showMessage('Archivo de ejemplo descargado');
      }
    } catch (error) {
      showMessage('Error al descargar ejemplo', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Empresas y Ventas
          </h1>
          <p className="text-gray-600">
            Administra empresas y carga datos de ventas para análisis predictivo
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`rounded-lg p-4 mb-6 flex items-center gap-3 ${
            message.type === 'error' 
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{message.text}</span>
            <button 
              onClick={() => setMessage(null)}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('empresas')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'empresas'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Gestión de Empresas
              </button>
              <button
                onClick={() => setActiveTab('ventas')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'ventas'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Carga de Ventas
              </button>
              <button
                onClick={() => setActiveTab('reporte')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reporte'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Reporte de Predicción
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Tab: Gestión de Empresas */}
            {activeTab === 'empresas' && (
              <div className="space-y-6">
                {/* Add Company Button */}
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Empresas Registradas ({Object.keys(empresas).length})
                  </h2>
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar Empresa
                  </button>
                </div>

                {/* Add Form */}
                {showAddForm && (
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="font-medium text-gray-900 mb-4">Nueva Empresa</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Nombre de la empresa"
                        value={newEmpresa.empresa}
                        onChange={(e) => setNewEmpresa({...newEmpresa, empresa: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                      />
                      <input
                        type="text"
                        placeholder="Industria"
                        value={newEmpresa.industria}
                        onChange={(e) => setNewEmpresa({...newEmpresa, industria: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        onClick={() => {
                          setShowAddForm(false);
                          setNewEmpresa({ empresa: '', industria: '' });
                        }}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={addEmpresa}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Guardar
                      </button>
                    </div>
                  </div>
                )}

                {/* Companies List */}
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Cargando empresas...</p>
                  </div>
                ) : Object.keys(empresas).length > 0 ? (
                  <div className="grid gap-4">
                    {Object.entries(empresas).map(([nombre, industria]) => (
                      <div key={nombre} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 capitalize">{nombre}</h3>
                          {editingEmpresa === nombre ? (
                            <input
                              type="text"
                              defaultValue={industria}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  updateEmpresa(nombre, e.target.value);
                                } else if (e.key === 'Escape') {
                                  setEditingEmpresa(null);
                                }
                              }}
                              className="mt-1 border border-gray-300 rounded px-2 py-1 text-sm bg-white text-gray-900"
                              autoFocus
                            />
                          ) : (
                            <p className="text-gray-600 text-sm capitalize">{industria}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {editingEmpresa === nombre ? (
                            <>
                              <button
                                onClick={(e) => {
                                  const input = e.target.closest('.flex').parentElement.querySelector('input');
                                  updateEmpresa(nombre, input.value);
                                }}
                                className="text-green-600 hover:text-green-800"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingEmpresa(null)}
                                className="text-gray-600 hover:text-gray-800"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setEditingEmpresa(nombre)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteEmpresa(nombre)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No hay empresas registradas</p>
                    <p className="text-sm mt-1">Agrega una empresa para comenzar</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Carga de Ventas */}
            {activeTab === 'ventas' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Carga de Datos de Ventas</h2>
                
                {/* Upload Section */}
                <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Subir archivo CSV de ventas
                    </h3>
                    <p className="text-gray-600 mb-4">
                      El archivo debe contener las columnas: fecha, cliente, unidades
                    </p>
                    
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                      className="hidden"
                      id="csv-upload"
                    />
                    <label
                      htmlFor="csv-upload"
                      className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50 cursor-pointer inline-flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Seleccionar archivo
                    </label>
                    
                    {selectedFile && (
                      <div className="mt-4 p-3 bg-white rounded border">
                        <p className="text-sm text-gray-700 bg-white">
                          Archivo: <span className="font-medium">{selectedFile.name}</span>
                        </p>
                        <button
                          onClick={uploadVentas}
                          disabled={loading}
                          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? 'Cargando...' : 'Cargar Datos'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Download Examples */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Descargar ejemplos</h4>
                  <p className="text-blue-700 text-sm mb-3">
                    Descarga un archivo de ejemplo con el formato correcto
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadExample(',')}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      Formato Internacional (,)
                    </button>
                    <button
                      onClick={() => downloadExample(';')}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      Formato Español (;)
                    </button>
                  </div>
                </div>

                {/* Current Sales Data */}
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">
                      Datos de Ventas Actuales ({ventas.length} registros)
                    </h3>
                    <button
                      onClick={() => setShowVentas(!showVentas)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      {showVentas ? 'Ocultar' : 'Ver datos'}
                    </button>
                  </div>
                  
                  {showVentas && (
                    <div className="p-4">
                      {ventas.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm bg-white">
                            <thead className="bg-gray-50">
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-2 px-3 text-gray-900">Fecha</th>
                                <th className="text-left py-2 px-3 text-gray-900">Cliente</th>
                                <th className="text-right py-2 px-3 text-gray-900">Unidades</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white">
                              {ventas.slice(0, 10).map((venta, index) => (
                                <tr key={index} className="border-b border-gray-100">
                                  <td className="py-2 px-3 text-gray-900">{venta.fecha}</td>
                                  <td className="py-2 px-3 capitalize text-gray-900">{venta.cliente}</td>
                                  <td className="py-2 px-3 text-right text-gray-900">{venta.unidades}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {ventas.length > 10 && (
                            <p className="text-center text-gray-500 py-2 text-sm">
                              ... y {ventas.length - 10} registros más
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          No hay datos de ventas cargados
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Reporte de Predicción */}
            {activeTab === 'reporte' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 mb-6">
                    <div className="flex justify-center mb-4">
                      <div className="bg-blue-600 rounded-full p-4">
                        <TrendingUp className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Análisis Predictivo de Ventas
                    </h2>
                    <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                      Accede al informe completo con predicciones, análisis de tendencias y métricas avanzadas 
                      basadas en los datos de ventas cargados en el sistema.
                    </p>
                  </div>
                  
                  {/* Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-center mb-2">
                        <BarChart3 className="w-6 h-6 text-blue-600 mr-2" />
                        <h3 className="font-semibold text-gray-900">Empresas</h3>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">{Object.keys(empresas).length}</p>
                      <p className="text-sm text-gray-600">Registradas</p>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-center mb-2">
                        <TrendingUp className="w-6 h-6 text-green-600 mr-2" />
                        <h3 className="font-semibold text-gray-900">Ventas</h3>
                      </div>
                      <p className="text-2xl font-bold text-green-600">{ventas.length}</p>
                      <p className="text-sm text-gray-600">Registros</p>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-center mb-2">
                        <Eye className="w-6 h-6 text-purple-600 mr-2" />
                        <h3 className="font-semibold text-gray-900">Total Unidades</h3>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">
                        {ventas.reduce((sum, venta) => sum + (venta.unidades || 0), 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Vendidas</p>
                    </div>
                  </div>

                  {/* Action Section */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Informe Detallado de Predicciones
                    </h3>
                    <p className="text-gray-600 mb-6">
                      El informe incluye análisis avanzados, gráficos interactivos y predicciones 
                      basadas en machine learning para optimizar tus estrategias de ventas.
                    </p>
                    
                    {ventas.length > 0 ? (
                      <button
                        onClick={() => window.open(API_REPORT, '_blank')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
                      >
                        <BarChart3 className="w-5 h-5" />
                        Ver Informe
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center justify-center mb-2">
                          <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                          <span className="font-medium text-yellow-800">Datos requeridos</span>
                        </div>
                        <p className="text-yellow-700 text-sm mb-3">
                          Para generar el reporte de predicción, primero debes cargar datos de ventas.
                        </p>
                        <button
                          onClick={() => setActiveTab('ventas')}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200"
                        >
                          Ir a Carga de Ventas
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Features List */}
                  {ventas.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-6 mt-6">
                      <h4 className="font-semibold text-gray-900 mb-4">¿Qué encontrarás en el informe?</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span>Predicciones de ventas futuras</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span>Análisis de tendencias por cliente</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span>Gráficos interactivos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span>Métricas de rendimiento</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span>Comparativas por industria</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span>Recomendaciones estratégicas</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
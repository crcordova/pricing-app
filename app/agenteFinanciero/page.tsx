'use client';

import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Upload, 
  FileText, 
  Trash2, 
  RefreshCw, 
  Send, 
  Database,
  MessageCircle,
  ArrowLeft,
  Search,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Info,
  Loader2,
  Copy,
  Download,
  TrendingUp,
  Calculator,
  PieChart,
  Target
} from 'lucide-react';
import Link from "next/link";

// Configuración centralizada del backend
const API_CONFIG = {
  // BASE_URL: "http://127.0.0.1:8008",
  BASE_URL: process.env.NEXT_PUBLIC_URL_AGENTE_FINANCIERO,
  ENDPOINTS: {
    UPLOAD_PDF: "/upload-pdf/",
    QUERY: "/query",
    LIST_DOCUMENTS: "/list-documents/",
    RESET_INDEX: "/reset-index/",
    SCORE_CLIENTE: "/score_cliente"
  }
};

interface DocumentsResponse {
  uploaded_files: string[];
  index_info: {
    backend: string;
    persisted_files?: string[];
    num_items: number;
    collection_name?: string;
    num_vectors?: number;
  };
}

interface QueryResponse {
  query: string;
  response: string;
}

interface FinancialScore {
  roa?: number;
  roe?: number;
  ebitda_margin?: number;
  net_margin?: number;
  current_ratio?: number;
  debt_to_equity?: number;
  asset_turnover?: number;
  revenue_growth?: number;
  net_income_growth?: number;
  score: number;
  interpretation: string;
}

export default function FinancialAgent() {
  const [documents, setDocuments] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>>([]);
  const [financialScore, setFinancialScore] = useState<FinancialScore | null>(null);
  
  // Loading states
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [loadingQuery, setLoadingQuery] = useState(false);
  const [loadingScore, setLoadingScore] = useState(false);
  
  // Messages
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
    setInfo(null);
  };

  const fetchDocuments = async () => {
    setLoadingDocuments(true);
    clearMessages();
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LIST_DOCUMENTS}`);
      if (!res.ok) throw new Error(`Error ${res.status} al cargar documentos`);
      const data: DocumentsResponse = await res.json();
      setDocuments(data.uploaded_files || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los documentos');
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      clearMessages();
    } else {
      setError('Por favor selecciona un archivo PDF válido');
      setSelectedFile(null);
    }
  };

  const handleUploadPDF = async () => {
    if (!selectedFile) return;

    setLoadingUpload(true);
    clearMessages();
    setInfo('Subiendo y procesando documento... Este proceso puede tomar unos minutos.');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPLOAD_PDF}`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || `Error ${res.status}`);
      }

      const data = await res.json();
      setSuccess(data.message || 'Documento cargado y vectorizado exitosamente');
      setSelectedFile(null);
      setInfo(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      await fetchDocuments();
    } catch (err: any) {
      setError(err.message || 'Error al cargar el documento');
      setInfo(null);
    } finally {
      setLoadingUpload(false);
    }
  };

  const handleResetIndex = async () => {
    if (!confirm('¿Estás seguro de reiniciar el índice? Esta acción eliminará todos los documentos y no se puede deshacer.')) return;

    setLoadingReset(true);
    clearMessages();
    setInfo('Reiniciando índice... Eliminando todos los documentos.');

    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RESET_INDEX}`, {
        method: 'POST',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || `Error ${res.status}`);
      }

      const data = await res.json();
      setSuccess(data.message || 'Índice reiniciado correctamente');
      setInfo(null);
      setFinancialScore(null);
      setChatHistory([]);
      await fetchDocuments();
    } catch (err: any) {
      setError(err.message || 'Error al reiniciar el índice');
      setInfo(null);
    } finally {
      setLoadingReset(false);
    }
  };

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMessage = {
      type: 'user' as const,
      content: question.trim(),
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setLoadingQuery(true);
    const currentQuestion = question;
    setQuestion('');
    
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.QUERY}?q=${encodeURIComponent(currentQuestion)}`);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || `Error ${res.status}`);
      }

      const data: QueryResponse = await res.json();
      
      const assistantMessage = {
        type: 'assistant' as const,
        content: data.response,
        timestamp: new Date()
      };

      setChatHistory(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage = {
        type: 'assistant' as const,
        content: `Error: ${err.message || 'No se pudo procesar la pregunta'}`,
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setLoadingQuery(false);
    }
  };

  const handleGenerateScore = async () => {
    if (documents.length === 0) {
      setError('Primero debes cargar algunos documentos financieros');
      return;
    }

    setLoadingScore(true);
    clearMessages();
    setInfo('Generando análisis financiero... Este proceso puede tomar unos minutos.');

    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SCORE_CLIENTE}`);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || `Error ${res.status}`);
      }

      const data: FinancialScore = await res.json();
      setFinancialScore(data);
      setSuccess('Análisis financiero generado exitosamente');
      setInfo(null);
    } catch (err: any) {
      setError(err.message || 'Error al generar el análisis financiero');
      setInfo(null);
    } finally {
      setLoadingScore(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setInfo('Contenido copiado al portapapeles');
    setTimeout(() => setInfo(null), 2000);
  };

  const formatPercentage = (value?: number) => {
    if (value === undefined || value === null) return 'N/A';
    return `${(value * 100).toFixed(2)}%`;
  };

  const formatNumber = (value?: number) => {
    if (value === undefined || value === null) return 'N/A';
    return value.toFixed(2);
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
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-2 rounded-lg">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  Agente Financiero
                </h1>
                <p className="text-gray-600 mt-1">
                  Análisis financiero avanzado y consultas sobre documentos empresariales
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Panel de Gestión de Documentos */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Carga de Documentos */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                Cargar Documentos
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar PDF
                  </label>
                  <input
                    id="file-input"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                  />
                </div>

                {selectedFile && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}

                <button
                  onClick={handleUploadPDF}
                  disabled={!selectedFile || loadingUpload}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {loadingUpload ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Cargar y Vectorizar
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Lista de Documentos */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  Documentos ({documents.length})
                </h2>
                <button
                  onClick={fetchDocuments}
                  disabled={loadingDocuments}
                  className="text-green-600 hover:text-green-700 p-1"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingDocuments ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              <div className="max-h-64 overflow-y-auto space-y-2">
                {loadingDocuments ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay documentos cargados</p>
                  </div>
                ) : (
                  documents.map((doc, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 truncate flex items-center gap-2">
                        <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
                        {doc}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Análisis Financiero */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-yellow-600" />
                Análisis Financiero
              </h2>

              <button
                onClick={handleGenerateScore}
                disabled={documents.length === 0 || loadingScore}
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-yellow-700 hover:to-yellow-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 mb-4"
              >
                {loadingScore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4" />
                    Generar Informe
                  </>
                )}
              </button>

              {financialScore && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span className="text-sm font-medium text-yellow-800">Score General</span>
                    <span className="text-lg font-bold text-yellow-900">{financialScore.score.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-600 italic">
                    {financialScore.interpretation}
                  </p>
                </div>
              )}
            </div>

            {/* Control del Sistema */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Database className="w-5 h-5 text-red-600" />
                Sistema
              </h2>

              <button
                onClick={handleResetIndex}
                disabled={loadingReset}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loadingReset ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Reiniciando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Reiniciar Índice
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 mt-2">
                Elimina todos los documentos y reinicia el sistema
              </p>
            </div>
          </div>

          {/* Panel Principal */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Alertas */}
            <div className="space-y-2">
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
            </div>

            {/* Informe Financiero Detallado */}
            {financialScore && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-yellow-600" />
                    Informe Financiero Detallado
                  </h2>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(financialScore, null, 2))}
                    className="text-yellow-600 hover:text-yellow-700 p-2"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">Rentabilidad</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">ROA:</span>
                        <span className="font-medium  text-gray-900">{formatPercentage(financialScore.roa)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">ROE:</span>
                        <span className="font-medium  text-gray-900">{formatPercentage(financialScore.roe)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Margen EBITDA:</span>
                        <span className="font-medium  text-gray-900">{formatPercentage(financialScore.ebitda_margin)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Margen Neto:</span>
                        <span className="font-medium  text-gray-900">{formatPercentage(financialScore.net_margin)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-green-800 mb-2">Liquidez y Solvencia</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-green-700">Ratio Corriente:</span>
                        <span className="font-medium  text-gray-900">{formatNumber(financialScore.current_ratio)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Deuda/Patrimonio:</span>
                        <span className="font-medium  text-gray-900">{formatNumber(financialScore.debt_to_equity)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-purple-800 mb-2">Eficiencia y Crecimiento</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-purple-700">Rotación Activos:</span>
                        <span className="font-medium  text-gray-900">{formatNumber(financialScore.asset_turnover)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-700">Crecimiento Ingresos:</span>
                        <span className="font-medium  text-gray-900">{formatPercentage(financialScore.revenue_growth)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-700">Crecimiento Utilidad:</span>
                        <span className="font-medium  text-gray-900">{formatPercentage(financialScore.net_income_growth)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-yellow-800 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Interpretación del Análisis
                  </h3>
                  <p className="text-sm text-yellow-700 leading-relaxed">{financialScore.interpretation}</p>
                </div>
              </div>
            )}

            {/* Chat con el Agente */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[500px]">
              
              {/* Header del Chat */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-yellow-600" />
                  Consultas Financieras
                </h2>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      ¡Hola! Soy tu Agente Financiero
                    </h3>
                    <p className="text-gray-600">
                      Haz preguntas sobre los documentos financieros cargados
                    </p>
                  </div>
                ) : (
                  chatHistory.map((message, index) => (
                    <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-lg p-4 ${
                        message.type === 'user' 
                          ? 'bg-yellow-600 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        
                        {message.type === 'assistant' && (
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={() => copyToClipboard(message.content)}
                              className="text-xs opacity-75 hover:opacity-100 flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" />
                              Copiar
                            </button>
                          </div>
                        )}
                        
                        <p className="text-xs opacity-50 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                
                {loadingQuery && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 rounded-lg p-4 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Analizando documentos...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input de Chat */}
              <div className="p-6 border-t border-gray-200">
                <form onSubmit={handleQuery} className="flex gap-2">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Pregunta sobre análisis financiero..."
                    disabled={loadingQuery || documents.length === 0}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900 disabled:bg-gray-100"
                  />
                  <button
                    type="submit"
                    disabled={loadingQuery || !question.trim() || documents.length === 0}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {loadingQuery ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>
                
                {documents.length === 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Carga algunos documentos financieros para habilitar las consultas
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
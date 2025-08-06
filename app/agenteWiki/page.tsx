'use client';

import { useState, useEffect } from 'react';
import { 
  Brain, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Send, 
  FileText, 
  Database,
  MessageCircle,
  ArrowLeft,
  Search,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Info,
  Loader2,
  Copy,
  ExternalLink
} from 'lucide-react';
import Link from "next/link";

// Configuración centralizada del backend
const API_CONFIG = {
  BASE_URL: process.env.URL_AGENTE_WIKI,
  ENDPOINTS: {
    PAGES: "/pages",
    ADD_PAGE: "/pages",
    DELETE_PAGE: "/pages",
    REBUILD_INDEX: "/rebuild-index",
    ASK: "/ask"
  }
};

interface WikiResponse {
  response: string;
  sources: string[];
}

export default function WikiAgent() {
  const [pages, setPages] = useState<string[]>([]);
  const [newPage, setNewPage] = useState('');
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{
    type: 'user' | 'assistant';
    content: string;
    sources?: string[];
    timestamp: Date;
  }>>([]);
  
  // Loading states
  const [loadingPages, setLoadingPages] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState<string | null>(null);
  const [loadingRebuild, setLoadingRebuild] = useState(false);
  const [loadingQuery, setLoadingQuery] = useState(false);
  
  // Messages
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    fetchPages();
  }, []);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
    setInfo(null);
  };

  const fetchPages = async () => {
    setLoadingPages(true);
    clearMessages();
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAGES}`);
      if (!res.ok) throw new Error(`Error ${res.status} al cargar páginas`);
      const data = await res.json();
      setPages(data.pages || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las páginas');
    } finally {
      setLoadingPages(false);
    }
  };

  const handleAddPage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPage.trim()) return;

    setLoadingAdd(true);
    clearMessages();
    
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADD_PAGE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: newPage.trim() }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || `Error ${res.status}`);
      }

      const data = await res.json();
      setSuccess(data.message || 'Página agregada exitosamente');
      setNewPage('');
      await fetchPages();
    } catch (err: any) {
      setError(err.message || 'Error al agregar la página');
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleDeletePage = async (pageName: string) => {
    if (!confirm(`¿Estás seguro de eliminar la página "${pageName}"?`)) return;

    setLoadingDelete(pageName);
    clearMessages();
    
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DELETE_PAGE}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: pageName }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || `Error ${res.status}`);
      }

      const data = await res.json();
      setSuccess(data.message || 'Página eliminada exitosamente');
      await fetchPages();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la página');
    } finally {
      setLoadingDelete(null);
    }
  };

  const handleRebuildIndex = async () => {
    if (!confirm('¿Estás seguro de reconstruir el índice? Este proceso puede tomar unos minutos.')) return;

    setLoadingRebuild(true);
    clearMessages();
    setInfo('Reconstruyendo índice... Este proceso puede tomar unos minutos.');
    
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REBUILD_INDEX}`, {
        method: 'POST',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || `Error ${res.status}`);
      }

      const data = await res.json();
      setSuccess(data.message || 'Índice reconstruido exitosamente');
      setInfo(null);
    } catch (err: any) {
      setError(err.message || 'Error al reconstruir el índice');
      setInfo(null);
    } finally {
      setLoadingRebuild(false);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
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
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ASK}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentQuestion }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || `Error ${res.status}`);
      }

      const data: WikiResponse = await res.json();
      
      const assistantMessage = {
        type: 'assistant' as const,
        content: data.response,
        sources: data.sources,
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setInfo('Respuesta copiada al portapapeles');
    setTimeout(() => setInfo(null), 2000);
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
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-lg">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  Agente Wiki
                </h1>
                <p className="text-gray-600 mt-1">
                  IA conversacional para consultas de información general y gestión del conocimiento
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Panel de Gestión */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Gestión de Páginas */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Gestión de Páginas
              </h2>

              {/* Agregar página */}
              <form onSubmit={handleAddPage} className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva Página
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPage}
                      onChange={(e) => setNewPage(e.target.value)}
                      placeholder="Nombre de la página o URL"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    />
                    <button
                      type="submit"
                      disabled={loadingAdd || !newPage.trim()}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {loadingAdd ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* Lista de páginas */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">
                    Páginas Cargadas ({pages.length})
                  </h3>
                  <button
                    onClick={fetchPages}
                    disabled={loadingPages}
                    className="text-purple-600 hover:text-purple-700 p-1"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingPages ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {loadingPages ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                    </div>
                  ) : pages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No hay páginas cargadas</p>
                    </div>
                  ) : (
                    pages.map((page, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {page}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeletePage(page)}
                          disabled={loadingDelete === page}
                          className="text-red-600 hover:text-red-700 p-1 ml-2"
                        >
                          {loadingDelete === page ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Control del Índice */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Database className="w-5 h-5 text-green-600" />
                Índice
              </h2>

              <button
                onClick={handleRebuildIndex}
                disabled={loadingRebuild}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loadingRebuild ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Reconstruyendo...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Reconstruir Índice
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 mt-2">
                Reconstruye el índice de búsqueda basado en todas las páginas cargadas
              </p>
            </div>

            {/* Información */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
              <h3 className="text-sm font-medium text-purple-800 mb-2 flex items-center gap-1">
                <Info className="w-4 h-4" />
                Cómo usar el Agente Wiki
              </h3>
              <ol className="text-xs text-purple-700 space-y-1 list-decimal list-inside">
                <li>Agrega páginas al conocimiento</li>
                <li>Reconstruye el índice si es necesario</li>
                <li>Haz preguntas al agente</li>
                <li>Revisa las fuentes de las respuestas</li>
              </ol>
            </div>
          </div>

          {/* Panel de Chat */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
              
              {/* Header del Chat */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                  Conversación con el Agente
                </h2>
                
                {/* Alertas */}
                <div className="mt-4 space-y-2">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-green-700">{success}</p>
                    </div>
                  )}

                  {info && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-700">{info}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <Brain className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      ¡Hola! Soy tu Agente Wiki
                    </h3>
                    <p className="text-gray-600">
                      Haz una pregunta sobre cualquier tema en las páginas cargadas
                    </p>
                  </div>
                ) : (
                  chatHistory.map((message, index) => (
                    <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-lg p-4 ${
                        message.type === 'user' 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        
                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-300">
                            <p className="text-xs font-medium mb-2 opacity-75">Fuentes:</p>
                            <div className="space-y-1">
                              {message.sources.slice(0, 2).map((source, idx) => (
                                <div key={idx} className="text-xs opacity-75 p-2 bg-black bg-opacity-10 rounded">
                                  {source.substring(0, 100)}...
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
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
                      <span className="text-sm">Pensando...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input de Chat */}
              <div className="p-6 border-t border-gray-200">
                <form onSubmit={handleAskQuestion} className="flex gap-2">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Haz una pregunta al agente..."
                    disabled={loadingQuery}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 disabled:bg-gray-100"
                  />
                  <button
                    type="submit"
                    disabled={loadingQuery || !question.trim()}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {loadingQuery ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
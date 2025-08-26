'use client';
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Calculator,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Info,
  Loader2,
  Send,
  Copy,
  BarChart3,
  PieChart,
  TrendingDown,
  Minus,
  RefreshCw
} from 'lucide-react';

type PortfolioComponent = {
  commodity: string;
  percentage: number;
};

interface APIComponent {
  commodity: string;
  percentage: number | { parsedValue: number };
  current_price: number | { parsedValue: number };
  forecast_mean: number;
  forecast_upper: number;
  forecast_lower: number;
  volatility: number;
  trending: string;
}

interface APIResult {
  confidence: number | { parsedValue: number };
  components: APIComponent[];
  [key: string]: any; // en caso de que vengan más campos
}

// Limpio para el front
interface TransformedComponent {
  commodity: string;
  percentage: number;
  current_price: number;
  forecast_mean: number;
  forecast_upper: number;
  forecast_lower: number;
  volatility: number;
  trending: string;
}

interface RiskAssessment {
  level: string;
  details?: string;
}

interface ComponentResult {
  commodity: string;
  percentage: number;
  current_price: number;
  forecast_mean: number;
  forecast_upper: number;
  forecast_lower: number;
  volatility: number;
  trending: string;
}

interface QuoteResult {
  client: string;
  timestamp: string | number; // depende de tu API
  weighted_price: number;
  confidence: number;
  risk_assessment: RiskAssessment;
  components: ComponentResult[];
  recommendations?: string[];
  agent_analysis: string;
}

interface TransformedResult {
  confidence: number;
  components: TransformedComponent[];
}

const CommodityQuoteAnalyzer = () => {
  // State for portfolio management
  const [client, setClient] = useState('');
  const [components, setComponents] = useState<PortfolioComponent[]>([]);
  const [newCommodity, setNewCommodity] = useState('');
  const [newPercentage, setNewPercentage] = useState('');
  
  // State for results
  const [quoteResult, setQuoteResult] = useState<QuoteResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // State for UI feedback
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [info, setInfo] = useState('');

  // Clear messages after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setError('');
      setSuccess('');
      setInfo('');
    }, 5000);
    return () => clearTimeout(timer);
  }, [error, success, info]);

  const handleAddComponent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!newCommodity.trim() || !newPercentage) {
      setError('Please enter both commodity name and percentage');
      return;
    }

    const percentage = parseFloat(newPercentage);
    if (percentage < 0.1 || percentage > 100) {
      setError('Percentage must be between 0.1 and 100');
      return;
    }

    const currentTotal = components.reduce((sum, comp) => sum + comp.percentage, 0);
    if (currentTotal + percentage > 100) {
      setError(`Total percentage cannot exceed 100%. Current total: ${currentTotal}%`);
      return;
    }

    const newComponent = {
      commodity: newCommodity.trim(),
      percentage: percentage
    };

    setComponents(prev => [...prev, newComponent]);
    setNewCommodity('');
    setNewPercentage('');
    setSuccess(`Added ${newComponent.commodity} (${newComponent.percentage}%)`);
  };

  const handleRemoveComponent = (index: number) => {
    const removed = components[index];
    setComponents(prev => prev.filter((_, i) => i !== index));
    setSuccess(`Removed ${removed.commodity}`);
  };

  const handleAnalyzePortfolio = async () => {
    if (!client.trim()) {
      setError('Please enter client name');
      return;
    }

    if (components.length === 0) {
      setError('Please add at least one component');
      return;
    }

    const totalPercentage = components.reduce((sum, comp) => sum + comp.percentage, 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      setError(`Portfolio must total 100%. Current total: ${totalPercentage.toFixed(1)}%`);
      return;
    }

    const getParsedValue = (v: number | { parsedValue: number }): number => {
      return typeof v === 'number' ? v : v.parsedValue;
    };

    setIsAnalyzing(true);
    setError('');
    
    try {
      // Replace with your actual API endpoint process.env.NEXT_PUBLIC_URL_PRICE_PREDICTION
      const apiUrl = process.env.NEXT_PUBLIC_URL_AGENT_AI;
      if (!apiUrl) {
        throw new Error('API URL is not defined. Please set NEXT_PUBLIC_URL_AGENT_AI in .env.local');
      }
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client: client,
          components: components
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze portfolio');
      }
      
      const result = await response.json();
      
      // Transform the API response to match our expected format

      const transformedResult = {
        ...result,
        confidence: getParsedValue((result as APIResult).confidence),
        components: (result as APIResult).components?.map((comp: APIComponent) => ({
          ...comp,
          percentage: (comp.percentage as any)?.parsedValue || comp.percentage,
          current_price: (comp.current_price as any)?.parsedValue || comp.current_price,
          forecast_mean: comp.forecast_mean,
          forecast_upper: comp.forecast_upper,
          forecast_lower: comp.forecast_lower,
          volatility: comp.volatility,
          trending: comp.trending
        })) || []
      };


      setQuoteResult(transformedResult);
      setSuccess('Analysis completed successfully!');
    } catch (err) {
      setError('Failed to analyze portfolio. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch(level?.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendingIcon = (trend: string) => {
    switch(trend?.toLowerCase()) {
      case 'increase': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'decrease': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
  };

  const totalPercentage = components.reduce((sum, comp) => sum + comp.percentage, 0);

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
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  AI Agent Copptech Executive
                </h1>
                <p className="text-gray-600 mt-1">
                  AI-powered commodity price analysis and price recomendations
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Portfolio Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Client & Portfolio Setup */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-blue-600" />
                Mixes Configuration
              </h2>

              {/* Client Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Name
                </label>
                <input
                  type="text"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  placeholder="Enter client name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              {/* Add Component */}
              <div className="space-y-4 mb-6">
                <form onSubmit={handleAddComponent}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Component
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newCommodity}
                      onChange={(e) => setNewCommodity(e.target.value)}
                      placeholder="Commodity name (e.g., copper, zinc)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="100"
                        value={newPercentage}
                        onChange={(e) => setNewPercentage(e.target.value)}
                        placeholder="Percentage"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      />
                      <button
                        type="submit"
                        disabled={!newCommodity.trim() || !newPercentage}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </form>
              </div>
              {/* <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Component
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newCommodity}
                      onChange={(e) => setNewCommodity(e.target.value)}
                      placeholder="Commodity name (e.g., copper, zinc)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="100"
                        value={newPercentage}
                        onChange={(e) => setNewPercentage(e.target.value)}
                        placeholder="Percentage"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddComponent(e);
                        }}
                        disabled={!newCommodity.trim() || !newPercentage}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div> */}

              {/* Components List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">
                    Components ({components.length})
                  </h3>
                  <div className={`text-sm px-2 py-1 rounded ${
                    Math.abs(totalPercentage - 100) < 0.01 ? 'bg-green-100 text-green-700' : 
                    totalPercentage > 100 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {totalPercentage.toFixed(1)}%
                  </div>
                </div>
                
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {components.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No components added</p>
                    </div>
                  ) : (
                    components.map((component, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {component.commodity}
                          </p>
                          <p className="text-xs text-gray-500">
                            {component.percentage}%
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveComponent(index)}
                          className="text-red-600 hover:text-red-700 p-1 ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Analysis Control */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-green-600" />
                Analysis
              </h2>

              <button
                onClick={handleAnalyzePortfolio}
                disabled={isAnalyzing || !client.trim() || components.length === 0 || Math.abs(totalPercentage - 100) > 0.01}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing Strategy...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    Analyze Price Strategy
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 mt-2">
                Analyzes commodity prices, volatility, and portfolio risk assessment
              </p>
            </div>

            {/* Info Panel */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-1">
                <Info className="w-4 h-4" />
                How to Use
              </h3>
              <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                <li>Enter client name</li>
                <li>Add commodity components (must total 100%)</li>
                <li>Click Analyze Price Strategy</li>
                <li>Review detailed price analysis and risk assessment</li>
              </ol>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-[600px]">
              
              {/* Results Header */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  Analysis Results
                </h2>
                
                {/* Alert Messages */}
                <div className="mt-4 space-y-2">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
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

              {/* Results Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {!quoteResult ? (
                  <div className="text-center py-12">
                    <Calculator className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Ready for Analysis
                    </h3>
                    <p className="text-gray-600">
                      Configure your portfolio and click Analyze Portfolio to get detailed price forecasts and risk assessment
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Header Summary */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Quote for {quoteResult.client}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {new Date(quoteResult.timestamp).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">
                            ${quoteResult.weighted_price?.toLocaleString() || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-600">Weighted Price</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">
                            {quoteResult.confidence || 0}%
                          </p>
                          <p className="text-sm text-gray-600">Confidence</p>
                        </div>
                        <div className="text-center">
                          <p className={`text-2xl font-bold px-3 py-1 rounded-full ${getRiskColor(quoteResult.risk_assessment?.level)}`}>
                            {quoteResult.risk_assessment?.level || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-600">Risk Level</p>
                        </div>
                      </div>
                    </div>

                    {/* Components Analysis */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Component Analysis</h4>
                      <div className="grid grid-cols-1 gap-4">
                        {quoteResult.components?.map((component, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-semibold text-gray-900 capitalize flex items-center gap-2">
                                {component.commodity}
                                {getTrendingIcon(component.trending)}
                              </h5>
                              <span className="text-sm font-medium text-blue-600">
                                {component.percentage}%
                              </span>
                            </div>
                            
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-gray-600">Current Price</p>
                            <p className="font-semibold text-gray-800">${component.current_price?.toLocaleString() || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Forecast Mean</p>
                            <p className="font-semibold text-blue-600">${component.forecast_mean?.toLocaleString() || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Range</p>
                            <p className="font-semibold text-xs text-gray-800">
                              ${component.forecast_lower?.toFixed(2)} - ${component.forecast_upper?.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Volatility</p>
                            <p className="font-semibold text-orange-600">
                              {(component.volatility * 100)?.toFixed(1) || 0}%
                            </p>
                          </div>
                        </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    {quoteResult.recommendations && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h4>
                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                          <ul className="space-y-2">
                            {quoteResult.recommendations.map((rec, index) => (
                              <li key={index} className="text-sm text-yellow-800 flex items-start gap-2">
                                <span>•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Agent Analysis */}
                    {quoteResult.agent_analysis && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-semibold text-gray-900">Detailed Analysis</h4>
                          <button
                            onClick={() => copyToClipboard(quoteResult.agent_analysis)}
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Copy className="w-4 h-4" />
                            Copy Analysis
                          </button>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                            {quoteResult.agent_analysis}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommodityQuoteAnalyzer;
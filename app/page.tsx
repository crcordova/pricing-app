'use client';

import React, { useState } from 'react';
import Link from "next/link";
import { 
  TrendingUp, 
  Activity, 
  BarChart3, 
  Bot, 
  DollarSign, 
  Users, 
  FileText, 
  Settings,
  ChevronRight,
  Menu,
  X,
  Zap,
  Brain,
  Target,
  Globe
} from 'lucide-react';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const services = [
    {
      title: "Finance Prediction",
      description: "Advanced ML models to predict trends in commodities and financial assets",
      icon: TrendingUp,
      href: "/pricePrediction",
      color: "bg-blue-500",
      gradient: "from-blue-500 to-blue-600"
    },
    // {
    //   title: "Predicción de Volatilidad", 
    //   description: "Análisis de volatilidad y riesgo en mercados financieros en tiempo real",
    //   icon: Activity,
    //   href: "/volatilityPrediction", 
    //   color: "bg-red-500",
    //   gradient: "from-red-500 to-red-600"
    // },
    {
      title: "Sales Prediction",
      description: "Business management and sales predictions based on historical data",
      icon: BarChart3,
      href: "/ventasPrediction",
      color: "bg-green-500", 
      gradient: "from-green-500 to-green-600"
    },
    {
      title: "AI Agent Copptech executive",
      description: "AI executive with market and sales information",
      icon: Brain,
      href: "/agenteWiki",
      color: "bg-purple-500",
      gradient: "from-purple-500 to-purple-600"
    },
    // {
    //   title: "Agente Financiero",
    //   description: "Asistente especializado en análisis financiero y recomendaciones de inversión",
    //   icon: DollarSign,
    //   href: "/agenteFinanciero",
    //   color: "bg-yellow-500",
    //   gradient: "from-yellow-500 to-yellow-600"
    // }
  ];

  // const features = [
  //   {
  //     icon: Zap,
  //     title: "Análisis en Tiempo Real",
  //     description: "Procesamiento de datos y predicciones actualizadas constantemente"
  //   },
  //   {
  //     icon: Target,
  //     title: "Precisión Avanzada",
  //     description: "Algoritmos de machine learning entrenados con datos históricos"
  //   },
  //   {
  //     icon: Globe,
  //     title: "Cobertura Global",
  //     description: "Análisis de mercados internacionales y commodities worldwide"
  //   }
  // ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Navbar */}
      <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="flex-shrink-0 flex items-center ml-2 md:ml-0">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900">Trading Platform</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/pricePrediction" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Price Prediction
                </Link>
                <Link href="/clients" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Clients
                </Link>
                <Link href="/scenarios" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Scenarios
                </Link>
                <Link href="/reports" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Reports
                </Link>
              </div>
            </div>

            {/* Settings Button */}
            <div className="hidden md:block">
              <button className="bg-gray-100 p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {sidebarOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/pricePrediction" className="text-gray-600 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                Predicción
              </Link>
              <Link href="/clients" className="text-gray-600 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                Clientes  
              </Link>
              <Link href="/scenarios" className="text-gray-600 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                Escenarios
              </Link>
              <Link href="/reports" className="text-gray-600 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                Reportes
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Trading Platform for
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Financial Analysis</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Optimize your financial decisions with advanced price, volatility, and sales predictions.
              Access intelligent agents specialized in market analysis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pricePrediction" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Start Analysis
              </Link>
              <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                View Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Specialized tools for financial analysis, market predictions, and business management
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Link key={index} href={service.href}>
                  <div className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                    <div className={`w-12 h-12 bg-gradient-to-r ${service.gradient} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {service.description}
                    </p>
                    <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                      <span>Acces</span>
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      {/* <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Por qué elegir PricingApp?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tecnología de vanguardia para maximizar el rendimiento de tus inversiones y decisiones comerciales
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section> */}

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">98%</div>
              <div className="text-blue-100">Accuracy in Predictions</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-blue-100">Continuous Monitoring</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">100+</div>
              <div className="text-blue-100">Commodities Analyzed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">10+</div>
              <div className="text-blue-100">Global Markets</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access */}
      {/* <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Acceso Rápido a Herramientas
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Accede directamente a nuestras herramientas más utilizadas para comenzar tu análisis financiero inmediatamente.
                </p>
                <div className="space-y-3">
                  <Link href="/pricePrediction" className="flex items-center text-blue-600 hover:text-blue-700 font-medium">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Análisis de Precios
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </Link>
                  <Link href="/volatilityPrediction" className="flex items-center text-red-600 hover:text-red-700 font-medium">
                    <Activity className="w-5 h-5 mr-2" />
                    Monitor de Volatilidad
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </Link>
                  <Link href="/agenteFinanciero" className="flex items-center text-yellow-600 hover:text-yellow-700 font-medium">
                    <Bot className="w-5 h-5 mr-2" />
                    Consultor IA
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <BarChart3 className="w-8 h-8 text-green-600 mb-2" />
                  <div className="text-sm font-medium text-gray-900">Ventas</div>
                  <div className="text-xs text-gray-500">Predicciones avanzadas</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <Brain className="w-8 h-8 text-purple-600 mb-2" />
                  <div className="text-sm font-medium text-gray-900">IA Wiki</div>
                  <div className="text-xs text-gray-500">Conocimiento general</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <Users className="w-8 h-8 text-blue-600 mb-2" />
                  <div className="text-sm font-medium text-gray-900">Clientes</div>
                  <div className="text-xs text-gray-500">Gestión integral</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <FileText className="w-8 h-8 text-gray-600 mb-2" />
                  <div className="text-sm font-medium text-gray-900">Reportes</div>
                  <div className="text-xs text-gray-500">Análisis detallados</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold">Trading Platform</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Comprehensive platform for financial analysis and market trend predictions.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Servicios</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/pricePrediction" className="hover:text-white transition-colors">Price Prediction</Link></li>
                <li><Link href="/volatilityPrediction" className="hover:text-white transition-colors">Volatility</Link></li>
                <li><Link href="/ventasPrediction" className="hover:text-white transition-colors">Sales</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Agentes IA</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/agenteWiki" className="hover:text-white transition-colors">AI Executive Agent</Link></li>
                {/* <li><Link href="/agenteFinanciero" className="hover:text-white transition-colors">Financial Agent</Link></li> */}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Trading Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
// src/components/AdminReports.js
import React, { useState, useEffect } from 'react';
import { FaDownload, FaCalendarAlt, FaChartBar, FaBox, FaDollarSign, FaShoppingCart, FaFileExcel, FaFilePdf, FaExclamationTriangle } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';

const toCLP = (n) =>
  (n ?? 0).toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockInventory, setStockInventory] = useState([]);
  const [stockSummary, setStockSummary] = useState({});
  const [stockLoading, setStockLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });
  const [dashboardData, setDashboardData] = useState({
    summary: {
      totalOrders: 0,
      totalRevenue: 0,
      totalPaidRevenue: 0,
      avgOrderValue: 0,
      pendingOrders: 0,
      lowStockCount: 0
    },
    charts: {
      statusDistribution: {},
      paymentMethods: {},
      dailyRevenue: [],
      topProducts: [],
      stockLevels: []
    },
    alerts: {
      lowStockProducts: []
    }
  });
  const [apiError, setApiError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setAnalyticsLoading(true);
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams();
      
      if (dateRange.from) params.append('from', dateRange.from);
      if (dateRange.to) params.append('to', dateRange.to);
      
      console.log('🔍 Fetching dashboard data with params:', params.toString());
      console.log('🔗 API URL:', `${process.env.REACT_APP_API_URL}/api/analytics/dashboard?${params}`);
      console.log('🔑 Token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/analytics/dashboard?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Dashboard data received:', data);
        setDashboardData(data);
        setApiError(null);
      } else {
        console.error('❌ Error fetching dashboard data:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error details:', errorText);
        setApiError(`Error ${response.status}: ${response.statusText}`);
        
        // Try the test endpoint to verify connectivity
        console.log('🧪 Trying test endpoint...');
        try {
          const testResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/analytics/test-data`);
          const testData = await testResponse.json();
          console.log('🧪 Test endpoint response:', testData);
        } catch (testError) {
          console.error('🧪 Test endpoint failed:', testError);
        }
      }
    } catch (error) {
      console.error('❌ Network error fetching dashboard data:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const createSampleData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/analytics/sample-data`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Sample data created:', result);
        // Refresh dashboard data
        fetchDashboardData();
        alert('Sample data created successfully!');
      } else {
        console.error('❌ Error creating sample data:', response.statusText);
        alert('Error creating sample data');
      }
    } catch (error) {
      console.error('❌ Error creating sample data:', error);
      alert('Error creating sample data');
    }
  };

  const fetchStockInventory = async () => {
    try {
      setStockLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/analytics/stock-inventory`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStockInventory(data.inventory);
        setStockSummary(data.summary);
      } else {
        console.error('❌ Error fetching stock inventory:', response.statusText);
        alert('Error al cargar inventario');
      }
    } catch (error) {
      console.error('❌ Error fetching stock inventory:', error);
      alert('Error al cargar inventario');
    } finally {
      setStockLoading(false);
    }
  };

  const openStockModal = () => {
    setShowStockModal(true);
    fetchStockInventory();
  };

  useEffect(() => {
    setLoading(true);
    fetchDashboardData().finally(() => setLoading(false));
  }, [dateRange]);

  // Initial load
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const convertToCSV = (data) => {
    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    return csvContent;
  };

  const exportToCSV = () => {
    const csvData = dashboardData.charts.topProducts.map(product => ({
      Producto: product.name,
      'Cantidad Vendida': product.quantity,
      'Ingresos': product.revenue
    }));

    const csv = convertToCSV(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte-productos-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      let yPosition = 20;

      // Header
      doc.setFontSize(20);
      doc.text('Reporte de Pedidos - Beniken', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      doc.setFontSize(12);
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-CL')}`, 20, yPosition);
      yPosition += 10;

      if (dateRange.from || dateRange.to) {
        const fromDate = dateRange.from ? new Date(dateRange.from).toLocaleDateString('es-CL') : 'N/A';
        const toDate = dateRange.to ? new Date(dateRange.to).toLocaleDateString('es-CL') : 'N/A';
        doc.text(`Rango: ${fromDate} - ${toDate}`, 20, yPosition);
        yPosition += 15;
      }

      // Summary KPIs
      doc.setFontSize(14);
      doc.text('Resumen Ejecutivo:', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.text(`Total de pedidos: ${dashboardData.summary.totalOrders}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Ingresos totales: ${toCLP(dashboardData.summary.totalRevenue)}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Ingresos pagados: ${toCLP(dashboardData.summary.totalPaidRevenue)}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Valor promedio por pedido: ${toCLP(dashboardData.summary.avgOrderValue)}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Pedidos pendientes: ${dashboardData.summary.pendingOrders}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Productos con stock bajo: ${dashboardData.summary.lowStockCount}`, 20, yPosition);
      yPosition += 15;

      // Capture and add Revenue Trend Chart
      const revenueChart = document.querySelector('.revenue-chart');
      if (revenueChart) {
        try {
          const canvas = await html2canvas(revenueChart, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false,
            useCORS: true
          });
          
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 170;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          if (yPosition + imgHeight > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(14);
          doc.text('Tendencia de Ingresos (Últimos 30 días)', 20, yPosition);
          yPosition += 10;
          
          doc.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 15;
        } catch (error) {
          console.warn('Error capturing revenue chart:', error);
        }
      }

      // Capture and add Status Distribution Chart
      const statusChart = document.querySelector('.status-chart');
      if (statusChart) {
        try {
          const canvas = await html2canvas(statusChart, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false,
            useCORS: true
          });
          
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 170;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          if (yPosition + imgHeight > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(14);
          doc.text('Distribución por Estado de Pedidos', 20, yPosition);
          yPosition += 10;
          
          doc.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 15;
        } catch (error) {
          console.warn('Error capturing status chart:', error);
        }
      }

      // Add new page for products chart
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
      }

      // Capture and add Top Products Chart
      const productsChart = document.querySelector('.products-chart');
      if (productsChart) {
        try {
          const canvas = await html2canvas(productsChart, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false,
            useCORS: true
          });
          
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 170;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          if (yPosition + imgHeight > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(14);
          doc.text('Productos Más Vendidos', 20, yPosition);
          yPosition += 10;
          
          doc.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 15;
        } catch (error) {
          console.warn('Error capturing products chart:', error);
        }
      }

      // Capture and add Payment Methods Chart
      const paymentChart = document.querySelector('.payment-chart');
      if (paymentChart) {
        try {
          const canvas = await html2canvas(paymentChart, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false,
            useCORS: true
          });
          
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 170;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          if (yPosition + imgHeight > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(14);
          doc.text('Distribución de Métodos de Pago', 20, yPosition);
          yPosition += 10;
          
          doc.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 15;
        } catch (error) {
          console.warn('Error capturing payment chart:', error);
        }
      }

      // Top products text list
      if (dashboardData.charts.topProducts.length > 0) {
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(14);
        doc.text('Detalle de Productos Más Vendidos:', 20, yPosition);
        yPosition += 10;
        doc.setFontSize(10);

        dashboardData.charts.topProducts.slice(0, 10).forEach((product, index) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(`${index + 1}. ${product.name}: ${product.quantity} unidades - ${toCLP(product.revenue)}`, 20, yPosition);
          yPosition += 6;
        });
      }

      // Low stock alerts
      if (dashboardData.alerts.lowStockProducts.length > 0) {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(14);
        doc.text('Alertas de Stock Bajo:', 20, yPosition);
        yPosition += 10;
        doc.setFontSize(10);

        dashboardData.alerts.lowStockProducts.forEach((product, index) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(`• ${product.name}: Stock actual ${product.stock} / Mínimo ${product.minStock}`, 20, yPosition);
          yPosition += 6;
        });
      }

      doc.save(`reporte-completo-beniken-${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el PDF. Por favor, intenta de nuevo.');
    }
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      { Métrica: 'Total de pedidos', Valor: dashboardData.summary.totalOrders },
      { Métrica: 'Ingresos totales', Valor: dashboardData.summary.totalRevenue },
      { Métrica: 'Ingresos pagados', Valor: dashboardData.summary.totalPaidRevenue },
      { Métrica: 'Valor promedio por pedido', Valor: Math.round(dashboardData.summary.avgOrderValue) },
      { Métrica: 'Pedidos pendientes', Valor: dashboardData.summary.pendingOrders },
      { Métrica: 'Productos con stock bajo', Valor: dashboardData.summary.lowStockCount }
    ];

    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');

    // Top products sheet
    if (dashboardData.charts.topProducts.length > 0) {
      const topProductsSheet = XLSX.utils.json_to_sheet(dashboardData.charts.topProducts);
      XLSX.utils.book_append_sheet(workbook, topProductsSheet, 'Productos Top');
    }

    XLSX.writeFile(workbook, `reporte-completo-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Prepare chart data
  const statusChartData = Object.entries(dashboardData.charts.statusDistribution).map(([status, count]) => ({
    name: status,
    value: count
  }));

  const paymentMethodsData = Object.entries(dashboardData.charts.paymentMethods).map(([method, count]) => ({
    name: method,
    value: count
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard de Reportes</h1>
          
          {/* Date Range and Export Controls */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex flex-wrap items-center gap-4 justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-gray-500" />
                  <label className="text-sm font-medium text-gray-700">Desde:</label>
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    className="border border-gray-300 rounded px-3 py-1 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Hasta:</label>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                    className="border border-gray-300 rounded px-3 py-1 text-sm"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                {dashboardData?.summary?.totalOrders === 0 && (
                  <button
                    onClick={createSampleData}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded text-sm flex items-center gap-1"
                  >
                    🧪 Crear Datos de Prueba
                  </button>
                )}
                <button
                  onClick={exportToPDF}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm flex items-center gap-1"
                >
                  📄 PDF
                </button>
                <button
                  onClick={exportToExcel}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm flex items-center gap-1"
                >
                  📊 Excel
                </button>
                <button
                  onClick={exportToCSV}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm flex items-center gap-1"
                >
                  📋 CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* API Error Display */}
        {apiError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <div>
                <strong>Error de conexión con la API:</strong> {apiError}
                <br />
                <small>Revisa la consola del navegador para más detalles.</small>
              </div>
            </div>
          </div>
        )}

        {!loading && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <FaShoppingCart size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Pedidos</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboardData?.summary?.totalOrders || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <FaDollarSign size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Ingresos Totales</p>
                    <p className="text-2xl font-semibold text-gray-900">{toCLP(dashboardData.summary.totalRevenue)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                    <FaChartBar size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Ticket Promedio</p>
                    <p className="text-2xl font-semibold text-gray-900">{toCLP(dashboardData.summary.avgOrderValue)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-red-100 text-red-600">
                      <FaExclamationTriangle size={24} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Stock Bajo</p>
                      <p className="text-2xl font-semibold text-gray-900">{dashboardData.summary.lowStockCount}</p>
                    </div>
                  </div>
                  <button
                    onClick={openStockModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <FaBox className="text-xs" />
                    Revisar
                  </button>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Revenue Trend Chart */}
              <div className="bg-white p-6 rounded-lg shadow revenue-chart">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencia de Ingresos (Últimos 30 días)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData.charts.dailyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [toCLP(value), 'Ingresos']} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Order Status Distribution */}
              <div className="bg-white p-6 rounded-lg shadow status-chart">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Estado</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Products and Payment Methods */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Top Products */}
              <div className="bg-white p-6 rounded-lg shadow products-chart">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos Más Vendidos</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData.charts.topProducts.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="quantity" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Payment Methods */}
              <div className="bg-white p-6 rounded-lg shadow payment-chart">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Métodos de Pago</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentMethodsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentMethodsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Low Stock Alert */}
            {dashboardData.alerts.lowStockProducts.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-red-800 flex items-center">
                    <FaExclamationTriangle className="mr-2" />
                    Productos con Stock Bajo
                  </h3>
                  <button
                    onClick={openStockModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    <FaBox className="text-sm" />
                    Revisar Existencias
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboardData.alerts.lowStockProducts.map((product, index) => (
                    <div key={index} className="bg-white p-4 rounded border">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-red-600">Stock: {product.stock} / Mínimo: {product.minStock}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Stock Inventory Modal */}
        {showStockModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FaBox className="mr-2 text-blue-600" />
                  Inventario de Existencias
                </h2>
                <button
                  onClick={() => setShowStockModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {stockLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Cargando inventario...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <FaBox className="text-blue-600 text-2xl mr-3" />
                          <div>
                            <p className="text-sm text-blue-600 font-medium">Total Productos</p>
                            <p className="text-2xl font-bold text-blue-800">{stockSummary.totalProducts || 0}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <FaExclamationTriangle className="text-red-600 text-2xl mr-3" />
                          <div>
                            <p className="text-sm text-red-600 font-medium">Stock Bajo</p>
                            <p className="text-2xl font-bold text-red-800">{stockSummary.lowStockProducts || 0}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <FaChartBar className="text-yellow-600 text-2xl mr-3" />
                          <div>
                            <p className="text-sm text-yellow-600 font-medium">Stock Medio</p>
                            <p className="text-2xl font-bold text-yellow-800">{stockSummary.mediumStockProducts || 0}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <FaDollarSign className="text-green-600 text-2xl mr-3" />
                          <div>
                            <p className="text-sm text-green-600 font-medium">Valor Total</p>
                            <p className="text-xl font-bold text-green-800">{toCLP(stockSummary.totalStockValue || 0)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Products Table */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Producto
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stock Actual
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stock Mínimo
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Precio
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Valor Stock
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {stockInventory.map((product, index) => (
                              <tr key={product.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                    <div className="text-sm text-gray-500">{product.description}</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900 font-medium">
                                    {product.currentStock} {product.unit}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {product.minStock} {product.unit}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    product.stockStatus === 'low' 
                                      ? 'bg-red-100 text-red-800' 
                                      : product.stockStatus === 'medium'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-green-100 text-green-800'
                                  }`}>
                                    {product.stockStatus === 'low' ? 'Bajo' : 
                                     product.stockStatus === 'medium' ? 'Medio' : 'Alto'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {toCLP(product.price)}/{product.unit}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {toCLP(product.currentStock * product.price)}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {stockInventory.length === 0 && (
                      <div className="text-center py-12">
                        <FaBox className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos</h3>
                        <p className="text-gray-500">No se encontraron productos en el inventario.</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowStockModal(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

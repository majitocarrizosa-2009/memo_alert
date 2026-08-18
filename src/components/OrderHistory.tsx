import React, { useState } from 'react';
import {
  History,
  Search,
  Calendar,
  CheckCircle2,
  Phone,
  MapPin,
  FileText,
  DollarSign,
  Printer,
  Download,
  Filter,
  Volume2,
} from 'lucide-react';
import { Order, BusinessConfig } from '../types';
import { soundAlert } from '../utils/audioAlerts';

interface OrderHistoryProps {
  orders: Order[];
  config: BusinessConfig;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({ orders, config }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [selectedOrderReceipt, setSelectedOrderReceipt] = useState<Order | null>(null);

  // Extract unique dates from orders
  const dates = ['all', ...Array.from(new Set(orders.map((o) => o.dayKey || o.createdAt.split('T')[0])))];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.phone.includes(searchTerm) ||
      String(order.orderNumber).includes(searchTerm) ||
      order.customer.address.toLowerCase().includes(searchTerm.toLowerCase());

    const orderDate = order.dayKey || order.createdAt.split('T')[0];
    const matchesDate = selectedDate === 'all' || orderDate === selectedDate;

    return matchesSearch && matchesDate;
  });

  const totalDelivered = orders.filter((o) => o.status === 'entregado').length;
  const totalRevenue = orders
    .filter((o) => o.status === 'entregado')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleSpeakReceipt = (ord: Order) => {
    const text = `Historial del pedido #${ord.orderNumber} para ${ord.customer.name}. Total facturado: ${config.currency}${ord.totalAmount.toFixed(2)}. Estado: ${ord.status}.`;
    soundAlert.speakText(text);
  };

  return (
    <div className="space-y-6">
      {/* Header with Revenue & Count Summary */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-50 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-100">
                Registro Permanente
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mt-1">
              Historial de Pedidos de Clientes
            </h2>
            <p className="text-gray-500 text-sm sm:text-base font-normal mt-0.5">
              Todos los pedidos entregados y pasados quedan registrados aquí de forma segura para consultas y cuentas.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-gray-900 text-white p-4 rounded-2xl shadow-sm">
            <div>
              <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Entregados Totales</span>
              <span className="text-xl font-black text-emerald-400">{totalDelivered} pedidos</span>
            </div>
            <div className="h-8 w-[1px] bg-gray-700 mx-1" />
            <div>
              <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Total Facturado</span>
              <span className="text-xl font-black text-amber-300">
                {config.currency}{totalRevenue.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 pt-5 border-t border-gray-100">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre de cliente, teléfono, dirección o # de pedido..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 font-medium text-sm text-gray-900 outline-none transition-colors"
            />
          </div>

          <div>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 font-medium text-sm text-gray-900 outline-none bg-white transition-colors"
            >
              <option value="all">Todas las fechas</option>
              {dates
                .filter((d) => d !== 'all')
                .map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders History List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200 text-gray-400">
            <History className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-gray-800">No se encontraron pedidos en el historial</h3>
            <p className="text-xs text-gray-500 mt-1">
              Prueba cambiando el término de búsqueda o seleccionando otra fecha.
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const dateStr = new Date(order.createdAt).toLocaleDateString('es-ES', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-indigo-900 text-white font-bold px-2.5 py-0.5 rounded-lg text-xs">
                      #{order.orderNumber}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        order.status === 'entregado'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : order.status === 'en_camino'
                          ? 'bg-orange-50 text-orange-700 border border-orange-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {dateStr}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900">{order.customer.name}</h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-600">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-indigo-500" />
                      {order.customer.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {order.customer.address}
                    </span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                      Pago: {order.paymentMethod}
                    </span>
                  </div>

                  <div className="text-xs text-gray-600 font-normal pt-1">
                    Platillos:{' '}
                    {order.items.map((it) => `${it.quantity}x ${it.productName}`).join(' • ')}
                  </div>
                </div>

                <div className="flex items-center justify-between md:flex-col md:items-end gap-3 shrink-0 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                  <span className="text-xl font-black text-indigo-900">
                    {config.currency}{order.totalAmount.toFixed(2)}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSpeakReceipt(order)}
                      className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-xl text-xs font-semibold border border-indigo-200/50"
                      title="Escuchar resumen"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedOrderReceipt(order)}
                      className="py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-indigo-200 cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Ver Recibo</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Printable Receipt Modal */}
      {selectedOrderReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-200 my-8">
            <div className="text-center border-b border-gray-200 pb-4 mb-4">
              <span className="text-[10px] font-bold uppercase text-indigo-600 tracking-wider">
                Recibo de Compra / Comprobante
              </span>
              <h3 className="text-xl font-bold text-gray-900 mt-1">
                {config.businessName || 'Memo Comidas'}
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{config.address}</p>
              <p className="text-xs text-gray-500 font-medium">Tel: {config.phone}</p>
            </div>

            <div className="text-xs space-y-2 mb-4">
              <div className="flex justify-between font-medium text-gray-600">
                <span>Pedido #:</span>
                <span className="font-bold text-gray-900">
                  {selectedOrderReceipt.orderNumber}
                </span>
              </div>
              <div className="flex justify-between font-medium text-gray-600">
                <span>Fecha:</span>
                <span>{new Date(selectedOrderReceipt.createdAt).toLocaleString('es-ES')}</span>
              </div>
              <div className="flex justify-between font-medium text-gray-600">
                <span>Cliente:</span>
                <span className="font-bold text-gray-900">
                  {selectedOrderReceipt.customer.name}
                </span>
              </div>
              <div className="flex justify-between font-medium text-gray-600">
                <span>Teléfono:</span>
                <span>{selectedOrderReceipt.customer.phone}</span>
              </div>
              <div className="flex justify-between font-medium text-gray-600">
                <span>Dirección:</span>
                <span className="text-right max-w-[200px]">
                  {selectedOrderReceipt.customer.address}
                </span>
              </div>
            </div>

            <div className="border-t border-b border-gray-200 py-3 mb-4 space-y-2">
              <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">
                Detalle del Pedido:
              </span>
              {selectedOrderReceipt.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-xs font-semibold text-gray-800">
                  <span>
                    {it.quantity}x {it.productName}
                  </span>
                  <span>{config.currency}{(it.unitPrice * it.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center bg-gray-900 text-white p-3.5 rounded-2xl mb-5 shadow-sm">
              <span className="font-semibold text-xs text-gray-300">TOTAL COBRADO:</span>
              <span className="text-xl font-black text-amber-300">
                {config.currency}{selectedOrderReceipt.totalAmount.toFixed(2)}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedOrderReceipt(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 shadow-md shadow-indigo-200 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

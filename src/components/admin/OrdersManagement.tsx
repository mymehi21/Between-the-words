import { useState, useEffect } from 'react';
import { supabase, Order } from '../../lib/supabase';

interface OrdersManagementProps {
  language: string;
}

export function OrdersManagement({ language }: OrdersManagementProps) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
      await loadOrders();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {language === 'ar' ? 'إدارة الطلبات' : 'Orders Management'}
        </h2>

        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Order #{order.order_number}</h3>
                  <p className="text-sm text-gray-600">{order.customer_name}</p>
                  <p className="text-sm text-gray-600">{order.customer_email}</p>
                  {order.customer_phone && (
                    <p className="text-sm text-gray-600">{order.customer_phone}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Type:</span> {order.order_type === 'pdf' ? 'PDF' : 'Physical'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Amount:</span> ${order.amount}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Date:</span> {new Date(order.created_at).toLocaleDateString()}
                  </p>
                  {order.order_type === 'physical' && order.customer_address && (
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="font-semibold">Address:</span> {order.customer_address}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    value={order.status}
                    onChange={(e) => handleUpdateStatus(order.id, e.target.value as Order['status'])}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 ${
                      order.status === 'completed' || order.status === 'shipped'
                        ? 'bg-green-50 text-green-800'
                        : order.status === 'cancelled'
                        ? 'bg-red-50 text-red-800'
                        : 'bg-yellow-50 text-yellow-800'
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="shipped">Shipped</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              {language === 'ar' ? 'لا توجد طلبات بعد' : 'No orders yet'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { supabase } from '@lib/supabase/client';
import { useAuth } from '@contexts/AuthContext';
import { ToastManager, useToasts } from '@components/admin/Toast';
import { DataTable } from '@components/admin/DataTable';
import { Modal } from '@components/admin/Modal';
import { Send, Trash2, Loader2 } from 'lucide-react';

const fmtOrderNumber = (id: string) => `ORD-${id.slice(0, 8).toUpperCase()}`;

export const AdminNotifications = () => {
  const { user } = useAuth();
  const { toasts, addToast, removeToast } = useToasts();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const [customers, setCustomers] = useState<any[]>([]);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [form, setForm] = useState({
    title: '',
    message: '',
    notificationType: 'broadcast',
    selectedUserId: '',
    selectedOrderId: '',
    link: '',
  });

  useEffect(() => { if (user?.id) fetchNotifications(); }, [user?.id]);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data } = await supabase.from('notifications')
      .select('*, order:orders(id, total, created_at)')
      .order('created_at', { ascending: false })
      .limit(100);
    setNotifications(data || []);
    setLoading(false);
  };

  const fetchCustomers = async () => {
    const { data } = await supabase.from('profiles')
      .select('id, full_name, email')
      .eq('role', 'customer')
      .order('full_name');
    setCustomers(data || []);
  };

  const fetchCustomerOrders = async (userId: string) => {
    setLoadingOrders(true);
    const { data } = await supabase.from('orders')
      .select('id, total, created_at, status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    setCustomerOrders(data || []);
    setLoadingOrders(false);
  };

  useEffect(() => {
    if (modalOpen) fetchCustomers();
  }, [modalOpen]);

  useEffect(() => {
    if (form.selectedUserId) {
      fetchCustomerOrders(form.selectedUserId);
    } else {
      setCustomerOrders([]);
    }
  }, [form.selectedUserId]);

  const resetForm = () => {
    setForm({ title: '', message: '', notificationType: 'broadcast', selectedUserId: '', selectedOrderId: '', link: '' });
    setCustomerOrders([]);
  };

  const handleSend = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      addToast('Enter title and message', 'error');
      return;
    }
    if (form.notificationType === 'order' && !form.selectedUserId) {
      addToast('Select a customer', 'error');
      return;
    }

    setSending(true);

    let link = form.link.trim();
    let orderId = null;

    if (form.notificationType === 'order') {
      orderId = form.selectedOrderId || null;
      if (orderId) {
        link = `/account/orders/${orderId}`;
      }
    }

    const payload: any = {
      title: form.title.trim(),
      message: form.message.trim(),
      type: form.notificationType === 'order' ? 'order' : 'info',
      link: link || null,
      image_url: null,
      user_id: form.notificationType === 'order' ? form.selectedUserId : null,
      order_id: orderId,
    };

    const { error } = await supabase.from('notifications').insert(payload);
    if (error) addToast(error.message, 'error');
    else {
      addToast('Notification sent');
      setModalOpen(false);
      resetForm();
      fetchNotifications();
    }
    setSending(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    addToast('Deleted');
  };

  const typeLabels: Record<string, string> = { info: 'Broadcast', promotion: 'Promo', order: 'Order', system: 'System' };

  const columns = [
    { key: 'title', label: 'Title', render: (n: any) => <span className="font-bold text-ink text-sm">{n.title}</span> },
    { key: 'type', label: 'Type', render: (n: any) => {
      const labels: Record<string, string> = { info: 'Broadcast', promotion: 'Promo', order: 'Order', system: 'System' };
      return <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${n.type === 'order' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{labels[n.type] || n.type}</span>;
    }},
    { key: 'target', label: 'Audience', render: (n: any) => (
      <span className="text-sm">
        {n.user_id ? <span className="text-terracotta font-medium">Targeted</span> : <span className="text-muted">Global</span>}
        {n.order_id && <span className="text-xs text-muted block">Order: {fmtOrderNumber(n.order_id)}</span>}
      </span>
    )},
    { key: 'is_read', label: 'Status', render: (n: any) => (
      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${n.is_read ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
        {n.is_read ? 'Read' : 'New'}
      </span>
    )},
    { key: 'created_at', label: 'Date', render: (n: any) => new Date(n.created_at).toLocaleDateString('ar-EG') },
    { key: 'actions', label: '', className: 'w-16', render: (n: any) => (
      <button onClick={() => handleDelete(n.id)} className="p-2 rounded-lg hover:bg-red-50" title="Delete">
        <Trash2 className="w-4 h-4 text-red-500" />
      </button>
    )},
  ];

  return (
    <div>
      <ToastManager toasts={toasts} removeToast={removeToast} />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-ink" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Notifications
          </h2>
          <p className="text-muted mt-1">Send targeted or broadcast notifications</p>
        </div>
        <button onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-terracotta text-white font-bold rounded-full border-2 border-ink shadow-[3px_3px_0px_0px_#1E293B] hover:shadow-[5px_5px_0px_0px_#1E293B] text-sm transition-all">
          <Send className="w-4 h-4" /> New Notification
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white border-2 border-line rounded-2xl animate-pulse" />)}</div>
      ) : (
        <DataTable columns={columns} data={notifications} searchPlaceholder="Search..." searchKeys={['title', 'message']} emptyMessage="No notifications yet" />
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); resetForm(); }} title="Send New Notification">
        <div className="space-y-4">
          {/* Notification Type */}
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">Notification Type</label>
            <div className="flex gap-2">
              <button onClick={() => setForm({ ...form, notificationType: 'broadcast', selectedUserId: '', selectedOrderId: '' })}
                className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                  form.notificationType === 'broadcast' ? 'border-terracotta bg-terracotta text-white' : 'border-line text-ink hover:border-terracotta/50'
                }`}>
                General / Broadcast
              </button>
              <button onClick={() => setForm({ ...form, notificationType: 'order' })}
                className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                  form.notificationType === 'order' ? 'border-terracotta bg-terracotta text-white' : 'border-line text-ink hover:border-terracotta/50'
                }`}>
                Order Specific
              </button>
            </div>
          </div>

          {/* Customer Dropdown (only for order-specific) */}
          {form.notificationType === 'order' && (
            <>
              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">Select Customer</label>
                <select
                  value={form.selectedUserId}
                  onChange={(e) => setForm({ ...form, selectedUserId: e.target.value, selectedOrderId: '' })}
                  className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none bg-white">
                  <option value="">-- Choose customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.full_name || c.email}</option>
                  ))}
                </select>
              </div>

              {form.selectedUserId && (
                <div>
                  <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">Select Order</label>
                  {loadingOrders ? (
                    <div className="flex items-center gap-2 py-3 text-sm text-muted">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading orders...
                    </div>
                  ) : customerOrders.length === 0 ? (
                    <p className="text-sm text-muted py-3">No orders found for this customer</p>
                  ) : (
                    <select
                      value={form.selectedOrderId}
                      onChange={(e) => setForm({ ...form, selectedOrderId: e.target.value })}
                      className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none bg-white">
                      <option value="">-- Choose order (optional) --</option>
                      {customerOrders.map((o) => (
                        <option key={o.id} value={o.id}>
                          {fmtOrderNumber(o.id)} — {o.total?.toLocaleString()} EGP — {new Date(o.created_at).toLocaleDateString('ar-EG')}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none" placeholder="Notification title" />
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">Message</label>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4}
              className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none resize-none" placeholder="Notification text" />
          </div>

          {/* Link (for broadcast only, auto-generated for order-specific) */}
          {form.notificationType === 'broadcast' && (
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">Link (optional)</label>
              <input type="url" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })}
                className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none" placeholder="https://..." />
            </div>
          )}

          {form.notificationType === 'order' && form.selectedOrderId && (
            <div className="p-3 bg-cream rounded-xl text-sm text-muted">
              Link will be auto-set to: <span className="text-ink font-medium">/account/orders/{fmtOrderNumber(form.selectedOrderId)}</span>
            </div>
          )}

          <button onClick={handleSend} disabled={sending}
            className="flex items-center gap-2 px-6 py-3 bg-terracotta text-white font-bold rounded-full border-2 border-ink shadow-[3px_3px_0px_0px_#1E293B] text-sm disabled:opacity-50">
            {sending ? 'Sending...' : 'Send Notification'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

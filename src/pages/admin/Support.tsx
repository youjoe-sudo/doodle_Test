import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@lib/supabase/client';
import { useAuth } from '@contexts/AuthContext';
import { Modal } from '@components/admin/Modal';
import { ToastManager, useToasts } from '@components/admin/Toast';
import { DataTable } from '@components/admin/DataTable';
import { MessageCircle, Send, Lock } from 'lucide-react';

type Ticket = { id: string; subject: string; description: string; status: string; priority: string; created_at: string; user?: { full_name: string; email: string } };
type Message = { id: string; ticket_id: string; sender_id: string; body: string; created_at: string };

export const AdminSupport = () => {
  const { user } = useAuth();
  const { toasts, addToast, removeToast } = useToasts();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => { if (user?.id) fetchTickets(); }, [user?.id]);

  const fetchTickets = async () => {
    setLoading(true);
    const { data } = await supabase.from('support_tickets')
      .select('*, user:profiles(full_name, email)')
      .order('created_at', { ascending: false });
    setTickets(data || []);
    setLoading(false);
  };

  const fetchMessages = useCallback(async (ticketId: string) => {
    const { data } = await supabase.from('support_messages')
      .select('*').eq('ticket_id', ticketId).order('created_at');
    setMessages(data || []);
    setTimeout(() => messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  const openTicket = async (t: Ticket) => {
    setSelected(t);
    await fetchMessages(t.id);
  };

  // Real-time messages subscription
  useEffect(() => {
    if (!selected) return;
    fetchMessages(selected.id);

    const channel = supabase
      .channel(`admin-ticket-${selected.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'support_messages',
        filter: `ticket_id=eq.${selected.id}`,
      }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        setTimeout(() => messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      })
      .subscribe();

    channelRef.current = channel;
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [selected?.id, fetchMessages]);

  // Real-time ticket status changes
  useEffect(() => {
    const channel = supabase
      .channel('admin-ticket-list')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'support_tickets',
      }, () => {
        fetchTickets();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const sendReply = async () => {
    if (!reply.trim() || !selected || !user?.id) return;
    setSending(true);
    try {
      const { error } = await supabase.from('support_messages').insert({ ticket_id: selected.id, sender_id: user.id, body: reply.trim() });
      if (error) throw error;
      setReply('');
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally { setSending(false); }
  };

  const updateStatus = async (t: Ticket, status: string) => {
    const { error } = await supabase.from('support_tickets').update({ status }).eq('id', t.id);
    if (error) addToast(error.message, 'error'); else {
      addToast('تم التحديث');
      setSelected((prev) => prev?.id === t.id ? { ...prev, status } : prev);
      setTickets((prev) => prev.map((tk) => tk.id === t.id ? { ...tk, status } : tk));
    }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { OPEN: 'bg-blue-100 text-blue-700', PENDING: 'bg-amber-100 text-amber-700', RESOLVED: 'bg-green-100 text-green-700', CLOSED: 'bg-gray-100 text-gray-700' };
    const labels: Record<string, string> = { OPEN: 'مفتوح', PENDING: 'قيد الانتظار', RESOLVED: 'تم الحل', CLOSED: 'مغلق' };
    return <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${map[s] || map.OPEN}`}>{labels[s] || s}</span>;
  };

  const isClosed = selected?.status === 'RESOLVED' || selected?.status === 'CLOSED';

  const columns = [
    { key: 'subject', label: 'الموضوع', render: (t: Ticket) => <span className="font-medium text-ink">{t.subject}</span> },
    { key: 'user', label: 'العميل', render: (t: Ticket) => <div><p className="text-sm text-ink">{t.user?.full_name || 'غير معروف'}</p><p className="text-xs text-muted">{t.user?.email}</p></div> },
    { key: 'status', label: 'الحالة', render: (t: Ticket) => statusBadge(t.status) },
    { key: 'priority', label: 'الأولوية', render: (t: Ticket) => {
      const labels: Record<string, string> = { LOW: 'منخفضة', NORMAL: 'عادية', HIGH: 'مرتفعة', URGENT: 'عاجلة' };
      const colors: Record<string, string> = { LOW: 'text-muted', NORMAL: 'text-ink', HIGH: 'text-amber-600', URGENT: 'text-red-600 font-bold' };
      return <span className={`text-sm ${colors[t.priority] || ''}`}>{labels[t.priority] || t.priority}</span>;
    }},
    { key: 'created_at', label: 'التاريخ', render: (t: Ticket) => new Date(t.created_at).toLocaleDateString('ar-EG') },
    { key: 'actions', label: '', className: 'w-20', render: (t: Ticket) => (
      <button onClick={() => openTicket(t)} className="p-2 rounded-lg hover:bg-cream"><MessageCircle className="w-4 h-4 text-ink" /></button>
    )},
  ];

  return (
    <div>
      <ToastManager toasts={toasts} removeToast={removeToast} />
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-ink" style={{ fontFamily: 'Outfit, sans-serif' }}>الدعم الفني</h2>
        <p className="text-muted mt-1">إدارة تذاكر الدعم والرد على العملاء</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-white border-2 border-line rounded-2xl animate-pulse" />)}</div>
      ) : (
        <DataTable columns={columns} data={tickets} searchPlaceholder="بحث في التذاكر..." searchKeys={['subject']} emptyMessage="لا توجد تذاكر دعم" />
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.subject || 'تفاصيل التذكرة'} wide>
        {selected && (
          <div className="flex flex-col h-[60vh]">
            <div className="flex items-center gap-3 pb-4 border-b-2 border-line mb-4">
              {statusBadge(selected.status)}
              {isClosed && <Lock className="w-4 h-4 text-muted" />}
              <span className="text-sm text-muted">{selected.user?.full_name} — {selected.user?.email}</span>
              <span className="text-xs text-muted mr-auto">{new Date(selected.created_at).toLocaleDateString('ar-EG')}</span>
            </div>

            <div className="flex gap-2 mb-4">
              {['OPEN', 'PENDING', 'RESOLVED', 'CLOSED'].map((s) => (
                <button key={s} onClick={() => updateStatus(selected, s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${selected.status === s ? 'border-terracotta bg-terracotta text-white' : 'border-line text-ink hover:border-terracotta'}`}>
                  {{ OPEN: 'مفتوح', PENDING: 'قيد الانتظار', RESOLVED: 'تم الحل', CLOSED: 'مغلق' }[s]}
                </button>
              ))}
            </div>

            {selected.description && (
              <div className="p-3 bg-cream/50 rounded-xl mb-4 text-sm text-ink">{selected.description}</div>
            )}

            <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
              {messages.length === 0 && <p className="text-center text-muted text-sm py-4">لا توجد رسائل بعد</p>}
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender_id === user?.id ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.sender_id === user?.id ? 'bg-terracotta text-white rounded-br-md' : 'bg-cream text-ink rounded-bl-md border border-line'}`}>
                    <p className="whitespace-pre-wrap">{m.body}</p>
                    <p className={`text-[10px] mt-1 ${m.sender_id === user?.id ? 'text-white/60' : 'text-muted'}`}>{new Date(m.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEnd} />
            </div>

            <div className="flex gap-2 pt-2 border-t-2 border-line">
              <input value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendReply()}
                placeholder={isClosed ? 'هذا التذكرة مغلق' : 'اكتب ردك...'}
                className="flex-1 border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none" disabled={sending || isClosed} />
              <button onClick={sendReply} disabled={sending || !reply.trim() || isClosed}
                className="px-4 py-2.5 bg-terracotta text-white rounded-xl font-bold disabled:opacity-50 hover:bg-terracotta-dark transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

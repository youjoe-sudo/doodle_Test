import { supabase } from '@lib/supabase/client';
import { useAuth } from '@contexts/AuthContext';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, ArrowRight, MessageCircle, Lock } from 'lucide-react';
import { useDocumentTitle } from '@hooks/useDocumentTitle';

type Ticket = {
  id: string; subject: string; description: string; status: string;
  priority: string; created_at: string;
};

type Message = {
  id: string; ticket_id: string; sender_id: string; body: string; created_at: string;
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'مفتوح', PENDING: 'قيد الانتظار', RESOLVED: 'تم الحل', CLOSED: 'مغلق',
};
const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-700', PENDING: 'bg-amber-100 text-amber-700',
  RESOLVED: 'bg-green-100 text-green-700', CLOSED: 'bg-gray-100 text-gray-700',
};

export const SupportPage = () => {
  useDocumentTitle('الدعم الفني');
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Chat state
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => { if (user?.id) fetchTickets(); }, [user?.id]);

  const fetchTickets = async () => {
    setLoading(true);
    const { data } = await supabase.from('support_tickets')
      .select('*').order('created_at', { ascending: false });
    setTickets(data || []);
    setLoading(false);
  };

  const fetchMessages = useCallback(async (ticketId: string) => {
    const { data } = await supabase.from('support_messages')
      .select('*').eq('ticket_id', ticketId).order('created_at');
    setMessages(data || []);
    setTimeout(() => messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  // Subscribe to real-time messages for selected ticket
  useEffect(() => {
    if (!selectedTicket) return;

    fetchMessages(selectedTicket.id);

    const channel = supabase
      .channel(`ticket-${selectedTicket.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'support_messages',
        filter: `ticket_id=eq.${selectedTicket.id}`,
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
  }, [selectedTicket?.id, fetchMessages]);

  // Listen for ticket status changes (closure lock)
  useEffect(() => {
    if (!selectedTicket) return;

    const channel = supabase
      .channel(`ticket-status-${selectedTicket.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'support_tickets',
        filter: `id=eq.${selectedTicket.id}`,
      }, (payload) => {
        const updated = payload.new as Ticket;
        setSelectedTicket((prev) => prev ? { ...prev, status: updated.status } : prev);
        setTickets((prev) => prev.map((t) => t.id === updated.id ? { ...t, status: updated.status } : t));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedTicket?.id]);

  const handleCreateTicket = async () => {
    if (!subject.trim() || !message.trim() || !user?.id) return;
    setSubmitting(true);
    try {
      await supabase.from('support_tickets').insert({
        user_id: user.id, subject: subject.trim(), description: message.trim(),
      });
      setSubject(''); setMessage('');
      fetchTickets();
    } catch (err) {
      console.error('Error creating ticket:', err);
    } finally { setSubmitting(false); }
  };

  const handleSendReply = async () => {
    if (!reply.trim() || !selectedTicket || !user?.id) return;
    setSending(true);
    try {
      await supabase.from('support_messages').insert({
        ticket_id: selectedTicket.id, sender_id: user.id, body: reply.trim(),
      });
      setReply('');
    } catch (err) {
      console.error('Error sending reply:', err);
    } finally { setSending(false); }
  };

  const isClosed = selectedTicket?.status === 'RESOLVED' || selectedTicket?.status === 'CLOSED';

  // Chat view
  if (selectedTicket) {
    return (
      <div className="max-w-4xl mx-auto px-6">
        <button onClick={() => setSelectedTicket(null)} className="flex items-center gap-2 text-muted hover:text-ink mb-6 transition-colors">
          <ArrowRight className="w-4 h-4" /> العودة للتذاكر
        </button>

        {/* Ticket header */}
        <div className="bg-white border-2 border-line rounded-2xl p-5 mb-4 shadow-[4px_4px_0px_0px_#E2E8F0]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-ink" style={{ fontFamily: 'Outfit, sans-serif' }}>{selectedTicket.subject}</h2>
              <p className="text-sm text-muted mt-1">{new Date(selectedTicket.created_at).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="flex items-center gap-2">
              {isClosed && <Lock className="w-4 h-4 text-muted" />}
              <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold ${STATUS_COLORS[selectedTicket.status] || ''}`}>
                {STATUS_LABELS[selectedTicket.status] || selectedTicket.status}
              </span>
            </div>
          </div>
          {selectedTicket.description && (
            <p className="mt-3 text-sm text-muted bg-cream/50 rounded-xl p-3">{selectedTicket.description}</p>
          )}
        </div>

        {/* Messages */}
        <div className="bg-white border-2 border-line rounded-2xl shadow-[4px_4px_0px_0px_#E2E8F0] flex flex-col" style={{ height: '50vh' }}>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.length === 0 && (
              <p className="text-center text-muted text-sm py-8">ابدأ المحادثة...</p>
            )}
            {messages.map((msg) => {
              const isMine = msg.sender_id === user?.id;
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm ${
                    isMine
                      ? 'bg-terracotta text-white rounded-br-md'
                      : 'bg-cream text-ink border border-line rounded-bl-md'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.body}</p>
                    <p className={`text-[10px] mt-1.5 ${isMine ? 'text-white/60' : 'text-muted'}`}>
                      {new Date(msg.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEnd} />
          </div>

          {/* Reply input */}
          <div className="p-4 border-t-2 border-line">
            {isClosed ? (
              <div className="flex items-center justify-center gap-2 py-3 bg-cream rounded-xl text-muted text-sm">
                <Lock className="w-4 h-4" />
                <span>هذا التذكرة مغلقة. لا يمكن إرسال رسائل جديدة.</span>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendReply()}
                  placeholder="اكتب رسالتك..."
                  className="flex-1 border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none transition-colors"
                  disabled={sending}
                />
                <button
                  onClick={handleSendReply}
                  disabled={sending || !reply.trim()}
                  className="px-5 py-2.5 bg-terracotta text-white rounded-xl font-bold border-2 border-ink shadow-[3px_3px_0px_0px_#1E293B] hover:shadow-[5px_5px_0px_0px_#1E293B] hover:-translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1E293B] transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Ticket list view
  return (
    <div className="max-w-4xl mx-auto px-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-ink" style={{ fontFamily: 'Outfit, sans-serif' }}>الدعم الفني</h2>
        <p className="text-muted mt-1">تواصل مع فريق الدعم للحصول على المساعدة</p>
      </div>

      {/* Create ticket */}
      <div className="bg-white border-2 border-line rounded-2xl p-6 mb-8 shadow-[4px_4px_0px_0px_#E2E8F0]">
        <h3 className="font-bold text-ink mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>طلب دعم جديد</h3>
        <input
          type="text" placeholder="الموضوع" value={subject} onChange={(e) => setSubject(e.target.value)}
          className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm mb-3 focus:border-terracotta focus:outline-none transition-colors"
        />
        <textarea
          rows={3} placeholder="وصف المشكلة..." value={message} onChange={(e) => setMessage(e.target.value)}
          className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm resize-none mb-4 focus:border-terracotta focus:outline-none transition-colors"
        />
        <button
          onClick={handleCreateTicket} disabled={submitting || !subject.trim() || !message.trim()}
          className="px-6 py-2.5 bg-terracotta text-white font-bold rounded-full border-2 border-ink shadow-[3px_3px_0px_0px_#1E293B] hover:shadow-[5px_5px_0px_0px_#1E293B] hover:-translate-y-0.5 transition-all disabled:opacity-50"
        >
          {submitting ? 'جاري الإرسال...' : 'إرسال'}
        </button>
      </div>

      {/* Ticket list */}
      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white border-2 border-line rounded-2xl animate-pulse" />)}</div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12 text-muted">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>لم تقم بإنشاء أي طلبات دعم بعد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className="w-full text-right bg-white border-2 border-line rounded-2xl p-5 shadow-[4px_4px_0px_0px_#E2E8F0] hover:shadow-[6px_6px_0px_0px_#E2E8F0] hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-ink">{ticket.subject}</h4>
                  <p className="text-sm text-muted mt-1">{ticket.description?.slice(0, 80)}{ticket.description && ticket.description.length > 80 ? '...' : ''}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted">{new Date(ticket.created_at).toLocaleDateString('ar-EG')}</span>
                  <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${STATUS_COLORS[ticket.status] || ''}`}>
                    {STATUS_LABELS[ticket.status] || ticket.status}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@lib/supabase/client';
import { useAuth } from '@contexts/AuthContext';
import { Bell, Check, Info, Tag, Package } from 'lucide-react';

const typeIcon = (type: string) => {
  switch (type) {
    case 'promotion': return <Tag className="w-4 h-4 text-blush" />;
    case 'order': return <Package className="w-4 h-4 text-sage" />;
    default: return <Info className="w-4 h-4 text-terracotta" />;
  }
};

export const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    fetchNotifications();

    const handleInsert = (payload: any) => {
      setNotifications((prev) => [payload.new, ...prev].slice(0, 20));
      setUnread((prev) => prev + 1);
    };

    const uniqueId = Math.random().toString(36).slice(2, 10);
    const ch = supabase.channel(`bell-${user.id}-${uniqueId}`);
    channelRef.current = ch;

    ch.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, handleInsert)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: 'user_id=is.null' }, handleInsert)
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current).catch(() => {});
        channelRef.current = null;
      }
    };
  }, [user?.id]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${user!.id},user_id.is.null`)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) {
        console.error('NotificationBell fetch error:', error.message, error);
        return;
      }
      setNotifications(data || []);
      setUnread((data || []).filter((n) => !n.is_read).length);
    } catch (err) {
      console.error('NotificationBell unexpected error:', err);
    }
  };

  const handleNotificationClick = async (n: any) => {
    if (!n.is_read) {
      await markAsRead(n.id);
    }
    setOpen(false);
    if (n.link) {
      navigate(n.link);
    }
  };

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    setUnread((prev) => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnread(0);
  };

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="relative w-10 h-10 rounded-full flex items-center justify-center text-ink hover:bg-cream transition-colors"
        aria-label="Notifications">
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-terracotta text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-paper animate-pulse">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-80 bg-white border-2 border-line rounded-2xl shadow-[6px_6px_0px_0px_#E2E8F0] z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b-2 border-line">
            <h3 className="font-bold text-ink text-sm">Notifications</h3>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-terracotta font-bold hover:underline">Mark all read</button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-muted text-sm py-8">No notifications yet</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-line/50 transition-colors hover:bg-cream/50 ${!n.is_read ? 'bg-terracotta/5' : ''} ${n.link ? 'cursor-pointer' : ''}`}>
                  <div className="mt-0.5 shrink-0">{typeIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-ink text-sm leading-tight">{n.title}</p>
                    <p className="text-xs text-muted mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-muted mt-1">{new Date(n.created_at).toLocaleString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  {!n.is_read && (
                    <button onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }} className="mt-0.5 shrink-0 p-1 rounded-lg hover:bg-cream" title="Mark as read">
                      <Check className="w-3.5 h-3.5 text-sage" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

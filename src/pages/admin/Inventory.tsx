import { useState, useEffect } from 'react';
import { supabase } from '@lib/supabase/client';
import { useAuth } from '@contexts/AuthContext';
import { ToastManager, useToasts } from '@components/admin/Toast';
import { DataTable } from '@components/admin/DataTable';
import { Package, Minus, Plus } from 'lucide-react';

export const AdminInventory = () => {
  const { user } = useAuth();
  const { toasts, addToast, removeToast } = useToasts();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStock, setEditingStock] = useState<Record<string, number>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => { if (user?.id) fetchProducts(); }, [user?.id]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('id, name_en, name_ar, original_price, stock, is_published').order('name_en');
    setProducts(data || []);
    setLoading(false);
  };

  const handleStockChange = (id: string, delta: number) => {
    const current = editingStock[id] ?? products.find((p) => p.id === id)?.stock ?? 0;
    setEditingStock({ ...editingStock, [id]: Math.max(0, current + delta) });
  };

  const handleSaveStock = async (id: string) => {
    setSavingId(id);
    const newStock = editingStock[id] ?? 0;
    const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', id);
    if (error) addToast(error.message, 'error');
    else { addToast('تم تحديث المخزون'); setProducts(products.map((p) => p.id === id ? { ...p, stock: newStock } : p)); }
    setSavingId(null);
  };

  const columns = [
    { key: 'name_en', label: 'المنتج', render: (p: any) => <div><p className="font-medium text-ink">{p.name_en}</p><p className="text-xs text-muted">{p.name_ar}</p></div> },
    { key: 'price', label: 'السعر', render: (p: any) => <span className="font-bold text-ink">{p.original_price?.toLocaleString()} EGP</span> },
    { key: 'stock', label: 'المخزون', render: (p: any) => {
      const val = editingStock[p.id] ?? p.stock;
      const changed = val !== p.stock;
      return (
        <div className="flex items-center gap-2">
          <button onClick={() => handleStockChange(p.id, -1)} className="w-8 h-8 rounded-lg border-2 border-line hover:border-terracotta flex items-center justify-center transition-colors"><Minus className="w-3 h-3" /></button>
          <input type="number" min={0} value={val} onChange={(e) => setEditingStock({ ...editingStock, [p.id]: Math.max(0, +e.target.value) })} className="w-16 text-center border-2 border-line rounded-lg px-2 py-1.5 text-sm font-bold focus:border-terracotta focus:outline-none" dir="ltr" />
          <button onClick={() => handleStockChange(p.id, 1)} className="w-8 h-8 rounded-lg border-2 border-line hover:border-terracotta flex items-center justify-center transition-colors"><Plus className="w-3 h-3" /></button>
          {changed && (
            <button onClick={() => handleSaveStock(p.id)} disabled={savingId === p.id} className="px-3 py-1.5 bg-terracotta text-white text-xs font-bold rounded-lg border border-ink shadow-[2px_2px_0px_0px_#1E293B] hover:shadow-[3px_3px_0px_0px_#1E293B] transition-all disabled:opacity-50">
              {savingId === p.id ? '...' : 'حفظ'}
            </button>
          )}
        </div>
      );
    }},
    { key: 'status', label: 'الحالة', render: (p: any) => (
      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${p.stock <= 3 ? 'bg-red-100 text-red-700' : p.stock <= 10 ? 'bg-amber-100 text-amber-700' : 'bg-sage/15 text-sage'}`}>
        {p.stock <= 3 ? 'مخزون منخفض' : p.stock <= 10 ? 'متوسط' : 'متوفر'}
      </span>
    )},
  ];

  return (
    <div>
      <ToastManager toasts={toasts} removeToast={removeToast} />
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-ink" style={{ fontFamily: 'Outfit, sans-serif' }}>المخزون</h2>
        <p className="text-muted mt-1">تتبع وإدارة مخزون المنتجات</p>
      </div>
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white border-2 border-line rounded-2xl animate-pulse" />)}</div>
      ) : (
        <DataTable columns={columns} data={products} searchPlaceholder="بحث في المنتجات..." searchKeys={['name_en', 'name_ar']} emptyMessage="لا توجد منتجات" />
      )}
    </div>
  );
};

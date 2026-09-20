import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

type Column<T> = {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchKeys?: string[];
  emptyMessage?: string;
};

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchPlaceholder,
  searchKeys = [],
  emptyMessage = 'لا توجد بيانات',
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim() || searchKeys.length === 0) return data;
    const q = search.toLowerCase();
    return data.filter((item) =>
      searchKeys.some((key) => String(item[key] ?? '').toLowerCase().includes(q))
    );
  }, [data, search, searchKeys]);

  return (
    <div>
      {searchPlaceholder && searchKeys.length > 0 && (
        <div className="mb-4 relative max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pr-10 pl-4 py-2.5 border-2 border-line rounded-xl text-sm bg-white focus:border-terracotta focus:outline-none transition-colors"
          />
        </div>
      )}

      <div className="overflow-x-auto border-2 border-line rounded-2xl bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-line bg-cream/50">
              {columns.map((col) => (
                <th key={col.key} className={`px-4 py-3 text-right font-bold text-ink text-xs uppercase tracking-wide ${col.className || ''}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-muted">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filtered.map((item, i) => (
                <tr key={item.id || i} className="border-b border-line last:border-0 hover:bg-cream/30 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 ${col.className || ''}`}>
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted mt-2">{filtered.length} من أصل {data.length} سجل</p>
    </div>
  );
}

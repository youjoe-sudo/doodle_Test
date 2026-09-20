import { ShoppingCart } from 'lucide-react';

export const ProductCardPreview = () => {
  return (
    <div className="sticker-card overflow-hidden group">
      <div className="aspect-square bg-gradient-to-br from-cream to-blush/20 flex items-center justify-center overflow-hidden">
        <div className="w-16 h-16 bg-terracotta/10 rounded-2xl flex items-center justify-center
          transition-transform duration-300 group-hover:scale-110">
          <ShoppingCart className="w-7 h-7 text-terracotta/40" />
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-body font-medium text-ink text-sm line-clamp-2 mb-2">اسم المنتج</h4>
        <div className="flex items-baseline gap-2">
          <span className="text-terracotta font-bold">150 EGP</span>
        </div>
      </div>
    </div>
  );
};

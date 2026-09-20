import { useCart } from '@hooks/useCart';
import { useNavigate } from 'react-router-dom';

export const CartPage = () => {
  const { items, cartTotal, cartCount, removeItem, increaseQuantity, decreaseQuantity } = useCart();
  const navigate = useNavigate();

  if (cartCount === 0) {
    return (
      <div className="min-h-96 flex flex-col items-center justify-center text-muted">
        <svg className="w-16 h-16 mx-4 mb-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1l4 4L23 1"></path>
        </svg>
        <span>سلة التسوق فارغة</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h2 className="text-3xl font-display ink text-terracotta mb-6">سلة التسوق</h2>

      <div className="bg-cream rounded-xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-3 font-medium text-terracotta">المنتج</th>
                <th className="p-3 font-medium text-terracotta">السعر</th>
                <th className="p-3 font-medium text-terracotta">الكمية</th>
                <th className="p-3 font-medium text-terracotta">الإجمالي</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const itemPrice = item.salePrice || item.originalPrice;
                const itemTotal = itemPrice * item.quantity;
                return (
                  <tr key={item.productId} className="border-b">
                    <td className="p-3">
                      <div className="flex items-center">
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded mr-3" />
                        )}
                        <div>
                          <p className="font-medium">{item.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-terracotta font-medium">{itemPrice.toLocaleString()} EGP</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center">
                        <button
                          onClick={() => decreaseQuantity(item.productId)}
                          className="px-2 py-1 border border-line rounded-md text-terracotta hover:bg-terracotta/10"
                        >
                          -
                        </button>
                        <span className="mx-2 w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => increaseQuantity(item.productId)}
                          className="px-2 py-1 border border-line rounded-md text-terracotta hover:bg-terracotta/10"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-terracotta font-medium">{itemTotal.toLocaleString()} EGP</span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-terracotta hover:underline text-sm"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex justify-between">
          <span className="text-terracotta font-medium">الإجمالي</span>
          <span className="text-2xl font-bold text-terracotta">{cartTotal.toLocaleString()} EGP</span>
        </div>
        <button
          onClick={() => navigate('/checkout')}
          className="w-full py-3 bg-terracotta text-white font-bold rounded-full hover:bg-terracotta-dark transition-colors"
        >
          الدفع
        </button>
      </div>
    </div>
  );
};

import { createContext, useContext, useState, ReactNode } from 'react';
import { MenuItem } from '@/data/menuData';

export interface SelectedSupplement {
  name: string;
  price: number;
}

export interface CartItem {
  cartItemId: string; // معرف فريد للوجبة مع التخصيص
  item: MenuItem;
  quantity: number;
  selectedSupplements?: SelectedSupplement[];
  selectedSauces?: string[];
  removedIngredients?: string[];
  comment?: string;
  unitPrice: number; // السعر الأساسي + سعر الإضافات
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (
    item: MenuItem,
    supplements?: SelectedSupplement[],
    sauces?: string[],
    removed?: string[],
    comment?: string
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isTakeAway: boolean;
  setIsTakeAway: (takeAway: boolean) => void;
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  totalPrice: 0,
  isCartOpen: false,
  setIsCartOpen: () => {},
  isTakeAway: false,
  setIsTakeAway: () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTakeAway, setIsTakeAway] = useState(false);

  const addToCart = (
    item: MenuItem,
    supplements: SelectedSupplement[] = [],
    sauces: string[] = [],
    removed: string[] = [],
    comment: string = ''
  ) => {
    // حساب تكلفة الإضافات للقطعة الواحدة
    const suppsTotal = supplements.reduce((sum, s) => sum + s.price, 0);
    const unitPrice = item.price + suppsTotal;

    // إنشاء معرف فريد مبني على الخيارات لتحديد التفرد
    const cartItemId = `${item.id}-${supplements.map(s => s.name).sort().join(',')}-${sauces.sort().join(',')}-${removed.sort().join(',')}-${comment}`;

    setCartItems(prev => {
      const existing = prev.find(c => c.cartItemId === cartItemId);
      if (existing) {
        return prev.map(c =>
          c.cartItemId === cartItemId ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [
        ...prev,
        {
          cartItemId,
          item,
          quantity: 1,
          selectedSupplements: supplements,
          selectedSauces: sauces,
          removedIngredients: removed,
          comment,
          unitPrice,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems(prev => prev.filter(c => c.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCartItems(prev =>
      prev
        .map(c =>
          c.cartItemId === cartItemId
            ? { ...c, quantity: Math.max(1, c.quantity + delta) }
            : c
        )
        .filter(c => c.quantity > 0)
    );
  };

  const clearCart = () => setCartItems([]);

  const totalItems = cartItems.reduce((sum, c) => sum + c.quantity, 0);
  const totalPrice = cartItems.reduce((sum, c) => sum + c.unitPrice * c.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
        isTakeAway,
        setIsTakeAway,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getApiUrl } from '../config';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart должен использоваться внутри CartProvider');
  }
  return context;
};

export const CartProvider = ({ children, userId }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCart = async () => {
    if (!userId) {
      const localCart = localStorage.getItem('localCart');
      if (localCart) {
        setCartItems(JSON.parse(localCart));
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(getApiUrl(`/cart/user/${userId}`));
      
      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setCartItems(result.data || []);
      } else {
        throw new Error(result.message || 'Ошибка при загрузке корзины');
      }
    } catch (error) {
      console.error('Ошибка загрузки корзины:', error);
      setError(error.message);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      localStorage.setItem('localCart', JSON.stringify(cartItems));
    }
  }, [cartItems, userId]);

  const addToCart = async (product, quantity = 1) => {
    const isCustomProduct = product.isCustom;

    if (isCustomProduct) {
      setCartItems(prev => {
        const existingIndex = prev.findIndex(item => item.isCustom && item.id === product.id);
        
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantity
          };
          return updated;
        }
        return [...prev, { ...product, quantity }];
      });
      return true;
    }

    if (!userId) {
      setCartItems(prev => {
        const existingIndex = prev.findIndex(item => item.id === product.id);
        
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantity
          };
          return updated;
        }
        return [...prev, {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity,
          description: product.description,
          image: product.image || product.images?.[0],
          category: product.category,
          in_stock: product.in_stock,
          isCustom: false
        }];
      });
      return true;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(getApiUrl('/cart/add'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId: product.id, quantity })
      });

      const result = await response.json();
      
      if (result.success) {
        await loadCart();
        return true;
      }
      throw new Error(result.message || 'Ошибка при добавлении в корзину');
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    const isCustomProduct = typeof productId === 'string' && productId.startsWith('custom-');
    
    if (isCustomProduct || !userId) {
      setCartItems(prev => {
        if (quantity <= 0) {
          return prev.filter(item => item.id !== productId);
        }
        return prev.map(item => item.id === productId ? { ...item, quantity } : item);
      });
      return true;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(getApiUrl('/cart/update'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId, quantity })
      });

      const result = await response.json();
      
      if (result.success) {
        await loadCart();
        return true;
      }
      throw new Error(result.message || 'Ошибка при обновлении количества');
    } catch (error) {
      console.error('Ошибка обновления количества:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    const isCustomProduct = typeof productId === 'string' && productId.startsWith('custom-');
    
    if (isCustomProduct || !userId) {
      setCartItems(prev => prev.filter(item => item.id !== productId));
      return true;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(getApiUrl('/cart/remove'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId })
      });

      const result = await response.json();
      
      if (result.success) {
        await loadCart();
        return true;
      }
      throw new Error(result.message || 'Ошибка при удалении из корзины');
    } catch (error) {
      console.error('Ошибка удаления из корзины:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!userId) {
      setCartItems([]);
      localStorage.removeItem('localCart');
      return true;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(getApiUrl('/cart/clear'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const result = await response.json();
      
      if (result.success) {
        setCartItems([]);
        return true;
      }
      throw new Error(result.message || 'Ошибка при очистке корзины');
    } catch (error) {
      console.error('Ошибка очистки корзины:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => cartItems.length;

  const getTotalQuantity = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  const getItemQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const refreshCart = () => loadCart();

  const clearError = () => setError(null);

  const value = {
    cartItems,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    calculateSubtotal,
    getCartItemsCount,
    getTotalQuantity,
    isInCart,
    getItemQuantity,
    refreshCart,
    clearError,
    userId
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getApiUrl } from '../config';

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites должен использоваться внутри FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children, userId }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadFavorites = async () => {
    if (!userId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(getApiUrl(`/favorites/user/${userId}`));
      
      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setFavorites(result.data);
      } else {
        throw new Error(result.message || 'Ошибка при загрузке избранного');
      }
    } catch (error) {
      console.error('Ошибка загрузки избранного:', error);
      setError(error.message);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [userId]);

  const addToFavorites = async (product) => {
    if (!userId) {
      setError('Для добавления в избранное необходимо авторизоваться');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(getApiUrl('/favorites/add'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId: product.id })
      });

      const result = await response.json();
      
      if (result.success) {
        setFavorites(prev => {
          const exists = prev.find(item => item.id === product.id);
          if (!exists) {
            return [...prev, { ...product, added_date: new Date().toISOString() }];
          }
          return prev;
        });
        return true;
      }
      throw new Error(result.message || 'Ошибка при добавлении в избранное');
    } catch (error) {
      console.error('Ошибка добавления в избранное:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (productId) => {
    if (!userId) {
      setError('Для управления избранным необходимо авторизоваться');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(getApiUrl('/favorites/remove'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId })
      });

      const result = await response.json();
      
      if (result.success) {
        setFavorites(prev => prev.filter(item => item.id !== productId));
        return true;
      }
      throw new Error(result.message || 'Ошибка при удалении из избранного');
    } catch (error) {
      console.error('Ошибка удаления из избранного:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (product) => {
    const isFavorite = favorites.some(item => item.id === product.id);
    
    if (isFavorite) {
      return await removeFromFavorites(product.id);
    } else {
      return await addToFavorites(product);
    }
  };

  const isFavorite = (id) => {
    return favorites.some(item => item.id === id);
  };

  const clearFavorites = async () => {
    if (!userId) {
      setError('Для управления избранным необходимо авторизоваться');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      const deletePromises = favorites.map(item => 
        fetch(getApiUrl('/favorites/remove'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, productId: item.id })
        })
      );
      
      await Promise.all(deletePromises);
      setFavorites([]);
      return true;
    } catch (error) {
      console.error('Ошибка очистки избранного:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getFavoritesCount = () => favorites.length;

  const refreshFavorites = () => loadFavorites();

  const clearError = () => setError(null);

  const value = {
    favorites,
    loading,
    error,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    getFavoritesCount,
    clearFavorites,
    refreshFavorites,
    clearError,
    userId
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};
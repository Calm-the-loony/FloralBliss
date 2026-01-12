const pool = require('../config/db');

// Добавить товар в корзину
const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity = 1 } = req.body;

    console.log('🛒 Добавление в корзину:', { userId, productId, quantity });

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: 'Необходимы userId и productId'
      });
    }

    // Проверяем существование товара
    const [product] = await pool.query(
      'SELECT id, name, price, images FROM products WHERE id = ?',
      [productId]
    );

    if (product.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Товар не найден'
      });
    }

    // Добавляем или обновляем количество в корзине
    const [result] = await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
      [userId, productId, quantity, quantity]
    );

    res.json({
      success: true,
      message: 'Товар добавлен в корзину',
      cartItem: {
        id: result.insertId || productId,
        productId: productId,
        quantity: quantity,
        product: product[0]
      }
    });

  } catch (error) {
    console.error('❌ Ошибка добавления в корзину:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера: ' + error.message
    });
  }
};

// Обновить количество товара
const updateQuantity = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    console.log('📊 Обновление количества:', { userId, productId, quantity });

    if (!userId || !productId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Необходимы userId, productId и quantity'
      });
    }

    if (quantity <= 0) {
      // Если количество 0 или меньше, удаляем товар
      return removeFromCart(req, res);
    }

    const [result] = await pool.query(
      'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?',
      [quantity, userId, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Товар не найден в корзине'
      });
    }

    res.json({
      success: true,
      message: 'Количество обновлено',
      productId: productId,
      quantity: quantity
    });

  } catch (error) {
    console.error('❌ Ошибка обновления количества:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера: ' + error.message
    });
  }
};

// Удалить товар из корзины
const removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    console.log('🗑️ Удаление из корзины:', { userId, productId });

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: 'Необходимы userId и productId'
      });
    }

    const [result] = await pool.query(
      'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    res.json({
      success: true,
      message: result.affectedRows > 0 ? 'Товар удален из корзины' : 'Товар не был в корзине',
      removed: result.affectedRows > 0,
      productId: productId
    });

  } catch (error) {
    console.error('❌ Ошибка удаления из корзины:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера: ' + error.message
    });
  }
};

// Получить корзину пользователя
const getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log('📋 Получение корзины для пользователя:', userId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Необходим userId'
      });
    }

    const [cartItems] = await pool.query(`
      SELECT 
        ci.product_id as id,
        ci.quantity,
        p.name,
        p.price,
        p.description,
        p.images,
        p.category_id,
        p.in_stock,
        c.name as category_name
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ci.user_id = ?
      ORDER BY ci.created_at DESC
    `, [userId]);

    // Форматируем данные
    const formattedCart = cartItems.map(item => {
      let images = ['/images/placeholder-flower.jpg'];
      try {
        if (item.images) {
          const parsed = JSON.parse(item.images);
          images = Array.isArray(parsed) ? parsed : [parsed];
        }
      } catch (e) {
        console.log('Ошибка парсинга images:', e.message);
      }

      return {
        id: item.id,
        name: item.name,
        price: parseFloat(item.price) || 0,
        quantity: item.quantity,
        description: item.description || 'Красивый букет для особого момента',
        image: images[0],
        images: images,
        category: { name: item.category_name || "Букеты" },
        in_stock: Boolean(item.in_stock)
      };
    });

    // Рассчитываем итоги
    const subtotal = formattedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = formattedCart.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      success: true,
      data: formattedCart,
      subtotal: subtotal,
      totalItems: totalItems,
      count: formattedCart.length
    });

  } catch (error) {
    console.error('❌ Ошибка получения корзины:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера: ' + error.message
    });
  }
};

// Очистить корзину
const clearCart = async (req, res) => {
  try {
    const { userId } = req.body;

    console.log('🧹 Очистка корзины для пользователя:', userId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Необходим userId'
      });
    }

    const [result] = await pool.query(
      'DELETE FROM cart_items WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: `Корзина очищена, удалено ${result.affectedRows} товаров`,
      clearedCount: result.affectedRows
    });

  } catch (error) {
    console.error('❌ Ошибка очистки корзины:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера: ' + error.message
    });
  }
};

module.exports = {
  addToCart,
  updateQuantity,
  removeFromCart,
  getCart,
  clearCart
};
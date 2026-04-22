const pool = require('../config/db');

const addToFavorites = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    console.log('📥 Добавление в избранное:', { userId, productId });

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: 'Необходимы userId и productId'
      });
    }

    const [result] = await pool.query(
      'INSERT IGNORE INTO user_favorites (user_id, product_id) VALUES (?, ?)',
      [userId, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(409).json({
        success: false,
        message: 'Товар уже в избранном'
      });
    }

    res.json({
      success: true,
      message: 'Товар добавлен в избранное',
      favoriteId: result.insertId
    });

  } catch (error) {
    console.error('Ошибка добавления в избранное:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера: ' + error.message
    });
  }
};
const removeFromFavorites = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    console.log('Удаление из избранного:', { userId, productId });

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: 'Необходимы userId и productId'
      });
    }

    const [result] = await pool.query(
      'DELETE FROM user_favorites WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    res.json({
      success: true,
      message: result.affectedRows > 0 ? 'Товар удален из избранного' : 'Товар не был в избранном',
      removed: result.affectedRows > 0
    });

  } catch (error) {
    console.error('Ошибка удаления из избранного:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера: ' + error.message
    });
  }
};

// Получить избранное пользователя
const getFavorites = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log('Получение избранного для пользователя:', userId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Необходим userId'
      });
    }

    const [favorites] = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.price,
        p.description,
        p.images,
        p.category_id,
        p.in_stock,
        uf.created_at as added_date
      FROM user_favorites uf
      JOIN products p ON uf.product_id = p.id
      WHERE uf.user_id = ?
      ORDER BY uf.created_at DESC
    `, [userId]);

    const formattedFavorites = favorites.map(item => {
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
        description: item.description || 'Красивый букет для особого момента',
        images: images,
        category: { name: "Букеты" },
        in_stock: Boolean(item.in_stock),
        added_date: item.added_date
      };
    });

    res.json({
      success: true,
      data: formattedFavorites,
      count: formattedFavorites.length
    });

  } catch (error) {
    console.error('Ошибка получения избранного:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера: ' + error.message
    });
  }
};

// Проверить, находится ли товар в избранном
const checkFavorite = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: 'Необходимы userId и productId'
      });
    }

    const [result] = await pool.query(
      'SELECT id FROM user_favorites WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    res.json({
      success: true,
      isFavorite: result.length > 0
    });

  } catch (error) {
    console.error('Ошибка проверки избранного:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера: ' + error.message
    });
  }
};

module.exports = {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  checkFavorite
};
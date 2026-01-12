const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Получить все компоненты для букетов
router.get('/', async (req, res) => {
  try {
    const [components] = await pool.query(`
      SELECT * FROM bouquet_components 
      WHERE is_active = 1 
      ORDER BY type, name
    `);

    res.json({
      success: true,
      data: components
    });
  } catch (error) {
    console.error('Ошибка получения компонентов:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении компонентов'
    });
  }
});

// Получить компоненты по типу
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    
    const [components] = await pool.query(`
      SELECT * FROM bouquet_components 
      WHERE type = ? AND is_active = 1
      ORDER BY name
    `, [type]);

    res.json({
      success: true,
      data: components
    });
  } catch (error) {
    console.error('Ошибка получения компонентов по типу:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении компонентов'
    });
  }
});

module.exports = router;
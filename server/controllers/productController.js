const pool = require('../config/db');

const processImages = (images) => {
  if (!images) return ['/images/placeholder-flower.jpg'];
  
  try {
    if (Array.isArray(images)) {
      return images.length > 0 ? images : ['/images/placeholder-flower.jpg'];
    }
    
    if (typeof images === 'string') {
      try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        } else if (typeof parsed === 'string' && parsed.trim() !== '') {
          return [parsed];
        }
      } catch (parseError) {
        if (images.trim() !== '') {
          return [images];
        }
      }
    }
    
    return ['/images/placeholder-flower.jpg'];
  } catch (error) {
    console.error('Ошибка обработки изображений:', error);
    return ['/images/placeholder-flower.jpg'];
  }
};

const getProductsByType = async (type = null) => {
  try {
    let query = `
      SELECT 
        p.id,
        p.name,
        p.price,
        p.original_price,
        p.description,
        p.images,
        p.category_id,
        p.type,
        p.in_stock,
        p.is_customizable,
        p.created_at,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.in_stock = TRUE
    `;
    
    const params = [];
    
    if (type) {
      query += ` AND p.type = ?`;
      params.push(type);
    }
    
    query += ` ORDER BY p.created_at DESC`;
    
    const [products] = await pool.query(query, params);
    
    return products.map(product => ({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price) || 0,
      original_price: product.original_price ? parseFloat(product.original_price) : null,
      description: product.description || `Красивый ${type === 'plant' ? 'растение' : type === 'composition' ? 'композиция' : 'букет'} для особого момента`,
      images: processImages(product.images),
      category: { 
        id: product.category_id,
        name: product.category_name || "Без категории",
        slug: product.category_slug
      },
      category_id: product.category_id,
      type: product.type || 'bouquet',
      in_stock: Boolean(product.in_stock),
      is_customizable: Boolean(product.is_customizable),
      created_at: product.created_at
    }));
  } catch (error) {
    console.error('Ошибка получения продуктов:', error);
    throw error;
  }
};

const getBouquets = async (req, res) => {
  try {
    console.log('💐 Получение букетов из БД...');
    
    const formattedProducts = await getProductsByType('bouquet');
    
    console.log(`✅ Найдено ${formattedProducts.length} букетов`);
    res.json({
      success: true,
      data: formattedProducts,
      count: formattedProducts.length
    });
  } catch (error) {
    console.error('❌ Ошибка получения букетов:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении букетов: ' + error.message
    });
  }
};

const getPlants = async (req, res) => {
  try {
    console.log('🌿 Получение растений из БД...');
    
    const formattedProducts = await getProductsByType('plant');
    
    console.log(`✅ Найдено ${formattedProducts.length} растений`);
    res.json({
      success: true,
      data: formattedProducts,
      count: formattedProducts.length
    });
  } catch (error) {
    console.error('❌ Ошибка получения растений:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении растений: ' + error.message
    });
  }
};

const getCompositions = async (req, res) => {
  try {
    console.log('🎨 Получение композиций из БД...');
    
    const formattedProducts = await getProductsByType('composition');
    
    console.log(`✅ Найдено ${formattedProducts.length} композиций`);
    res.json({
      success: true,
      data: formattedProducts,
      count: formattedProducts.length
    });
  } catch (error) {
    console.error('❌ Ошибка получения композиций:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении композиций: ' + error.message
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    console.log('📦 Получение всех товаров из БД...');
    
    const formattedProducts = await getProductsByType();
    
    console.log(`✅ Найдено ${formattedProducts.length} товаров`);
    res.json({
      success: true,
      data: formattedProducts,
      count: formattedProducts.length
    });
  } catch (error) {
    console.error('❌ Ошибка получения товаров:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении товаров: ' + error.message
    });
  }
};

const getFeaturedProducts = async (req, res) => {
  try {
    console.log('⭐ Получение featured товаров...');
    
    const [products] = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.price,
        p.original_price,
        p.description,
        p.images,
        p.category_id,
        p.type,
        p.in_stock,
        p.is_customizable,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.in_stock = TRUE
      ORDER BY p.created_at DESC
      LIMIT 6
    `);

    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price) || 0,
      original_price: product.original_price ? parseFloat(product.original_price) : null,
      description: product.description || 'Красивый продукт',
      images: processImages(product.images),
      category: { 
        id: product.category_id,
        name: product.category_name || "Без категории",
        slug: product.category_slug
      },
      type: product.type || 'bouquet',
      in_stock: Boolean(product.in_stock),
      is_customizable: Boolean(product.is_customizable)
    }));

    res.json({
      success: true,
      data: formattedProducts,
      count: formattedProducts.length
    });
  } catch (error) {
    console.error('❌ Ошибка получения товаров:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении товаров: ' + error.message
    });
  }
};

const createOrUpdateProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      original_price,
      description,
      images,
      category_id,
      type = 'bouquet',
      in_stock = true,
      is_customizable = false
    } = req.body;

    let imagesToStore = null;
    if (images && Array.isArray(images) && images.length > 0) {
      const validImages = images.filter(img => {
        if (typeof img === 'string' && img.trim() !== '') {
          return img.startsWith('http') || img.startsWith('/') || img.startsWith('data:image');
        }
        return false;
      });
      
      if (validImages.length > 0) {
        imagesToStore = JSON.stringify(validImages);
      }
    }

    const [result] = await pool.query(
      `INSERT INTO products (name, price, original_price, description, images, category_id, type, in_stock, is_customizable)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       price = VALUES(price),
       original_price = VALUES(original_price),
       description = VALUES(description),
       images = VALUES(images),
       category_id = VALUES(category_id),
       type = VALUES(type),
       in_stock = VALUES(in_stock),
       is_customizable = VALUES(is_customizable)`,
      [
        name,
        price,
        original_price || null,
        description || null,
        imagesToStore,
        category_id || null,
        type,
        in_stock,
        is_customizable
      ]
    );

    res.json({
      success: true,
      data: { id: result.insertId || req.body.id },
      message: 'Продукт успешно сохранен'
    });
  } catch (error) {
    console.error('❌ Ошибка сохранения продукта:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при сохранении продукта: ' + error.message
    });
  }
};

module.exports = {
  getBouquets,
  getPlants,
  getCompositions,
  getAllProducts,
  getFeaturedProducts,
  createOrUpdateProduct
};
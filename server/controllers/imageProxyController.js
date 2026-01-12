const axios = require('axios');
const sharp = require('sharp');

const proxyImage = async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL параметр обязателен'
      });
    }

    const decodedUrl = decodeURIComponent(url);
    
    try {
      new URL(decodedUrl);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Некорректный URL'
      });
    }

    const response = await axios({
      method: 'GET',
      url: decodedUrl,
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    if (!response.data) {
      throw new Error('Изображение не загружено');
    }

    const contentType = response.headers['content-type'] || 'image/jpeg';
    
    if (!contentType.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        message: 'URL должен указывать на изображение'
      });
    }

    if (req.query.optimize === 'true') {
      const { width, height, quality } = req.query;
      
      let image = sharp(response.data);
      
      if (width || height) {
        image = image.resize(
          width ? parseInt(width) : null,
          height ? parseInt(height) : null,
          {
            fit: 'inside',
            withoutEnlargement: true
          }
        );
      }
      
      if (quality) {
        image = image.jpeg({ quality: parseInt(quality) });
      } else {
        image = image.jpeg({ quality: 80 });
      }
      
      const optimizedBuffer = await image.toBuffer();
      
      res.set('Content-Type', 'image/jpeg');
      res.set('Cache-Control', 'public, max-age=86400');
      res.send(optimizedBuffer);
    } else {
      res.set('Content-Type', contentType);
      res.set('Cache-Control', 'public, max-age=86400');
      res.send(response.data);
    }

  } catch (error) {
    console.error('Ошибка прокси изображения:', error.message);
    
    let statusCode = 500;
    let errorMessage = 'Ошибка при загрузке изображения';
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      statusCode = 404;
      errorMessage = 'Изображение не найдено или сервер недоступен';
    } else if (error.code === 'ETIMEDOUT') {
      statusCode = 408;
      errorMessage = 'Таймаут при загрузке изображения';
    } else if (error.response) {
      statusCode = error.response.status;
      errorMessage = `Ошибка сервера изображения: ${error.response.status}`;
    }
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getImageMetadata = async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL параметр обязателен'
      });
    }

    const decodedUrl = decodeURIComponent(url);
    
    try {
      new URL(decodedUrl);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Некорректный URL'
      });
    }

    const response = await axios({
      method: 'GET',
      url: decodedUrl,
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Range': 'bytes=0-10000'
      },
      timeout: 5000
    });

    const metadata = await sharp(response.data).metadata();
    
    res.json({
      success: true,
      metadata: {
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        size: response.data.length,
        hasAlpha: metadata.hasAlpha,
        space: metadata.space
      }
    });

  } catch (error) {
    console.error('Ошибка получения метаданных:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Не удалось получить метаданные изображения',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const downloadImage = async (req, res) => {
  try {
    const { url, filename } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL обязателен'
      });
    }

    const decodedUrl = decodeURIComponent(url);
    
    try {
      new URL(decodedUrl);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Некорректный URL'
      });
    }

    const response = await axios({
      method: 'GET',
      url: decodedUrl,
      responseType: 'arraybuffer',
      timeout: 10000
    });

    const contentType = response.headers['content-type'];
    let extension = 'jpg';
    
    if (contentType.includes('png')) {
      extension = 'png';
    } else if (contentType.includes('gif')) {
      extension = 'gif';
    } else if (contentType.includes('webp')) {
      extension = 'webp';
    }
    
    const finalFilename = filename 
      ? `${filename}.${extension}`
      : `image_${Date.now()}.${extension}`;
    
    res.json({
      success: true,
      message: 'Изображение успешно загружено',
      data: {
        filename: finalFilename,
        size: response.data.length,
        type: contentType,
        url: decodedUrl
      }
    });

  } catch (error) {
    console.error('Ошибка скачивания изображения:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Не удалось скачать изображение',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const createThumbnail = async (req, res) => {
  try {
    const { url } = req.query;
    const { width = 300, height = 300 } = req.query;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL обязателен'
      });
    }

    const decodedUrl = decodeURIComponent(url);
    
    try {
      new URL(decodedUrl);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Некорректный URL'
      });
    }

    const response = await axios({
      method: 'GET',
      url: decodedUrl,
      responseType: 'arraybuffer',
      timeout: 10000
    });

    const thumbnail = await sharp(response.data)
      .resize(parseInt(width), parseInt(height), {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 70 })
      .toBuffer();
    
    res.set('Content-Type', 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(thumbnail);

  } catch (error) {
    console.error('Ошибка создания превью:', error.message);
    
    const placeholder = await sharp({
      create: {
        width: parseInt(req.query.width) || 300,
        height: parseInt(req.query.height) || 300,
        channels: 3,
        background: { r: 240, g: 240, b: 240 }
      }
    })
      .jpeg()
      .toBuffer();
    
    res.set('Content-Type', 'image/jpeg');
    res.send(placeholder);
  }
};

const checkImageAvailability = async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL обязателен'
      });
    }

    const decodedUrl = decodeURIComponent(url);
    
    try {
      new URL(decodedUrl);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Некорректный URL'
      });
    }

    const response = await axios({
      method: 'HEAD',
      url: decodedUrl,
      timeout: 5000
    });

    const contentType = response.headers['content-type'];
    const contentLength = response.headers['content-length'];
    const lastModified = response.headers['last-modified'];
    
    res.json({
      success: true,
      available: true,
      data: {
        contentType,
        contentLength: contentLength ? parseInt(contentLength) : null,
        lastModified,
        url: decodedUrl
      }
    });

  } catch (error) {
    console.error('Ошибка проверки доступности:', error.message);
    
    res.json({
      success: true,
      available: false,
      error: error.message,
      url: req.query.url
    });
  }
};

module.exports = {
  proxyImage,
  getImageMetadata,
  downloadImage,
  createThumbnail,
  checkImageAvailability
};
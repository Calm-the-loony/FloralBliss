class ImageLoaderService {
  constructor() {
    this.imageCache = new Map();
    this.loadingQueue = [];
    this.maxConcurrentLoads = 3;
    this.currentLoads = 0;
  }

  getImageUrl(imagePath) {
    if (!imagePath || imagePath.trim() === '') {
      return '/api/images/placeholder';
    }

    if (imagePath.startsWith('http')) {
      return `/api/images/proxy?url=${encodeURIComponent(imagePath)}`;
    }

    if (imagePath.startsWith('/')) {
      return imagePath;
    }

    return '/api/images/placeholder';
  }

  parseImages(imagesData) {
    if (!imagesData) return [];
    
    try {
      if (Array.isArray(imagesData)) {
        return imagesData.filter(img => img && img.trim() !== '');
      }
      
      if (typeof imagesData === 'string') {
        try {
          const parsed = JSON.parse(imagesData);
          if (Array.isArray(parsed)) {
            return parsed.filter(img => img && img.trim() !== '');
          }
        } catch {
          return [imagesData];
        }
      }
    } catch (error) {
      console.error('Ошибка парсинга изображений:', error);
    }
    
    return [];
  }

  async loadSingleImage(imagePath) {
    const cacheKey = imagePath;
    
    if (this.imageCache.has(cacheKey)) {
      return this.imageCache.get(cacheKey);
    }

    const imageUrl = this.getImageUrl(imagePath);
    
    const loadPromise = new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        console.log('✅ Изображение загружено:', imagePath);
        this.imageCache.set(cacheKey, img.src);
        this.currentLoads--;
        this.processQueue();
        resolve(img.src);
      };
      
      img.onerror = (error) => {
        console.warn('❌ Ошибка загрузки изображения:', imagePath, error);
        this.currentLoads--;
        this.processQueue();
        
        const placeholderUrl = '/api/images/placeholder';
        const placeholderImg = new Image();
        placeholderImg.onload = () => {
          this.imageCache.set(cacheKey, placeholderUrl);
          resolve(placeholderUrl);
        };
        placeholderImg.onerror = () => {
          this.imageCache.set(cacheKey, '');
          resolve('');
        };
        placeholderImg.src = placeholderUrl;
      };
      
      img.src = imageUrl;
    });

    this.imageCache.set(cacheKey, loadPromise);
    
    return loadPromise;
  }

  enqueueImageLoad(imagePath) {
    return new Promise((resolve) => {
      const task = async () => {
        try {
          const result = await this.loadSingleImage(imagePath);
          resolve(result);
        } catch (error) {
          resolve('/api/images/placeholder');
        }
      };
      
      this.loadingQueue.push(task);
      this.processQueue();
    });
  }

  processQueue() {
    while (this.loadingQueue.length > 0 && this.currentLoads < this.maxConcurrentLoads) {
      this.currentLoads++;
      const task = this.loadingQueue.shift();
      task();
    }
  }

  async preloadImages(imagePaths) {
    const uniquePaths = [...new Set(imagePaths.filter(path => path && path.trim() !== ''))];
    
    const immediateLoads = uniquePaths.slice(0, 3);
    const queuedLoads = uniquePaths.slice(3);
    
    const results = {};
    
    await Promise.allSettled(
      immediateLoads.map(async (path) => {
        try {
          results[path] = await this.loadSingleImage(path);
        } catch {
          results[path] = '/api/images/placeholder';
        }
      })
    );
    
    queuedLoads.forEach(path => {
      this.enqueueImageLoad(path).then(url => {
        results[path] = url;
      });
    });
    
    return results;
  }

  clearCache() {
    this.imageCache.clear();
  }
}

const imageLoaderService = new ImageLoaderService();
export default imageLoaderService;
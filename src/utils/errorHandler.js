// src/utils/errorHandler.js
export class ApiError extends Error {
  constructor(message, statusCode, details = {}) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  // Если это наша кастомная ошибка
  if (error instanceof ApiError) {
    return {
      type: 'API_ERROR',
      code: error.statusCode,
      message: error.message,
      details: error.details,
      timestamp: error.timestamp
    };
  }
  
  // Ошибка сети
  if (!navigator.onLine) {
    return {
      type: 'NETWORK_ERROR',
      code: 0,
      message: 'Нет подключения к интернету',
      details: { originalError: error.message }
    };
  }
  
  // Ошибка от сервера (HTTP ошибки)
  if (error.response) {
    return {
      type: 'HTTP_ERROR',
      code: error.response.status,
      message: getHttpErrorMessage(error.response.status),
      details: error.response.data || {}
    };
  }
  
  // Ошибка при выполнении запроса
  if (error.request) {
    return {
      type: 'REQUEST_ERROR',
      code: 503,
      message: 'Сервер не отвечает',
      details: { originalError: error.message }
    };
  }
  
  // Неизвестная ошибка
  return {
    type: 'UNKNOWN_ERROR',
    code: 500,
    message: 'Произошла неизвестная ошибка',
    details: { originalError: error.message }
  };
};

const getHttpErrorMessage = (statusCode) => {
  const messages = {
    400: 'Некорректный запрос',
    401: 'Требуется авторизация',
    403: 'Доступ запрещен',
    404: 'Ресурс не найден',
    409: 'Конфликт данных',
    422: 'Ошибка валидации',
    429: 'Слишком много запросов',
    500: 'Внутренняя ошибка сервера',
    502: 'Плохой шлюз',
    503: 'Сервис недоступен',
    504: 'Таймаут шлюза'
  };
  
  return messages[statusCode] || `Ошибка сервера: ${statusCode}`;
};

export const redirectToErrorPage = (errorType, router) => {
  const routes = {
    '403': '/403',
    '404': '/404',
    '500': '/500',
    'NETWORK_ERROR': '/network-error'
  };
  
  const route = routes[errorType] || '/500';
  router.navigate(route);
};

export const showErrorNotification = (error, notificationService) => {
  const errorConfigs = {
    'API_ERROR': {
      title: 'Ошибка API',
      message: error.message,
      type: 'error'
    },
    'NETWORK_ERROR': {
      title: 'Проблема с подключением',
      message: 'Проверьте интернет-соединение',
      type: 'warning'
    },
    'HTTP_ERROR': {
      title: `Ошибка ${error.code}`,
      message: error.message,
      type: 'error'
    },
    'REQUEST_ERROR': {
      title: 'Сервер не отвечает',
      message: 'Попробуйте позже',
      type: 'error'
    },
    'UNKNOWN_ERROR': {
      title: 'Неизвестная ошибка',
      message: 'Пожалуйста, обратитесь в поддержку',
      type: 'error'
    }
  };
  
  const config = errorConfigs[error.type] || errorConfigs.UNKNOWN_ERROR;
  notificationService.show(config);
};
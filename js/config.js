// API Configuration
const API_CONFIG = {
    baseUrl: 'http://exam-api-courses.std-900.ist.mospolytech.ru/api',
    apiKey: '13dbb247-3839-4069-8e81-64e1240cca8a'
};

// Endpoints
const ENDPOINTS = {
    courses: '/courses',
    tutors: '/tutors',
    orders: '/orders',
    orderById: (id) => `/orders/${id}`,
    tutorById: (id) => `/tutors/${id}`,
    courseById: (id) => `/courses/${id}`
};

// Build URL with API key
function buildUrl(endpoint, params = {}) {
    const url = new URL(API_CONFIG.baseUrl + endpoint);
    url.searchParams.append('api_key', API_CONFIG.apiKey);
    
    Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
    });
    
    return url.toString();
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_CONFIG, ENDPOINTS, buildUrl };
}
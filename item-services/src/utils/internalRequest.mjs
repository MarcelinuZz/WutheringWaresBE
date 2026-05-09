const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;
const TOKEN_SERVICE_URL = process.env.TOKEN_SERVICE_URL;

const internalHeaders = {
    'Content-Type': 'application/json',
    'x-internal-api-key': INTERNAL_API_KEY
};

export const requestTokenService = async (endpoint, method = 'POST', body = {}) => {
    const response = await fetch(`${TOKEN_SERVICE_URL}${endpoint}`, {
        method,
        headers: internalHeaders,
        body: method !== 'GET' ? JSON.stringify(body) : undefined
    });

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.message || 'Token service error');
        error.status = response.status;
        throw error;
    }

    return data;
};

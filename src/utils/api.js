const API_BASE_URL = 'http://localhost:5500/api';

export const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        credentials: 'include',
        ...options,
    };

    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(url, config);

        // Check if response is JSON
        const contentType = response.headers.get('content-type');

        if (!contentType || !contentType.includes('application/json')) {
            // If not JSON, get text to see what we actually received
            const text = await response.text();
            console.error('Non-JSON response received:', text);
            throw new Error(`Server returned non-JSON response. Status: ${response.status}`);
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || response.statusText);
        }

        return data;
    } catch (error) {
        // Enhanced error logging
        console.error('API Request failed:', {
            url,
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
};
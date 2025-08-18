import { apiRequest } from '../utils/api.js';
import { API_ENDPOINTS } from '../utils/constants.js';

export const authService = {
    signUp: async (userData) => {
        return await apiRequest(API_ENDPOINTS.SIGN_UP, {
            method: 'POST',
            body: userData,
        });
    },

    signIn: async (credentials) => {
        const response = await apiRequest(API_ENDPOINTS.SIGN_IN, {
            method: 'POST',
            body: credentials,
        });
        
        // Extract token from response and store in localStorage
        if (response && response.token) {
            localStorage.setItem('token', response.token);
        }
        
        return response;
    },

    signOut: async () => {
        const response = await apiRequest(API_ENDPOINTS.SIGN_OUT, {
            method: 'POST',
        });
        
        // Clear token from localStorage
        localStorage.removeItem('token');
        
        return response;
    },

    checkAuth: async () => {
        return await apiRequest('/auth/me', {
            method: 'GET',
        });
    },
};
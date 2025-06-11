import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authService } from '../services/authService.js';

const AuthContext = createContext();

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOADING':
            return { ...state, loading: true, error: null };
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                loading: false,
                isAuthenticated: true,
                user: action.payload.user,
                outlet: action.payload.outlet,
                permissions: action.payload.permissions,
                error: null
            };
        case 'LOGOUT':
            return {
                ...state,
                loading: false,
                isAuthenticated: false,
                user: null,
                outlet: null,
                permissions: [],
                error: null
            };
        case 'ERROR':
            return {
                ...state,
                loading: false,
                error: action.payload
            };
        case 'CLEAR_ERROR':
            return { ...state, error: null };
        default:
            return state;
    }
};

const initialState = {
    isAuthenticated: false,
    user: null,
    outlet: null,
    permissions: [],
    loading: true,
    error: null,
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    const clearError = useCallback(() => {
        dispatch({ type: 'CLEAR_ERROR' });
    }, []);

    // Helper function to check permissions
    const hasPermission = useCallback((permissionType) => {
        return state.permissions.some(perm =>
            perm.type === permissionType && perm.isGranted === true
        );
    }, [state.permissions]);

    // Helper function to get outlet details from localStorage
    const getStoredOutletDetails = useCallback(() => {
        try {
            const storedOutlet = localStorage.getItem('outletDetails');
            return storedOutlet ? JSON.parse(storedOutlet) : null;
        } catch (error) {
            console.error('Error parsing stored outlet details:', error);
            return null;
        }
    }, []);

    // Helper function to store outlet details in localStorage
    const storeOutletDetails = useCallback((outletData) => {
        try {
            localStorage.setItem('outletDetails', JSON.stringify(outletData));
        } catch (error) {
            console.error('Error storing outlet details:', error);
        }
    }, []);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        dispatch({ type: 'LOADING' });
        try {
            const response = await authService.checkAuth();
            if (response && response.user) {
                const userData = {
                    user: response.user,
                    outlet: response.user.outlet,
                    permissions: response.user.staffDetails?.permissions || []
                };

                // Store outlet details in localStorage
                if (response.user.outlet) {
                    storeOutletDetails(response.user.outlet);
                }

                dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
            } else {
                dispatch({ type: 'LOGOUT' });
            }
        } catch (error) {
            dispatch({ type: 'LOGOUT' });
        }
    };

    const signUp = async (userData) => {
        dispatch({ type: 'LOADING' });
        try {
            const response = await authService.signUp(userData);
            const loginData = {
                user: response.user,
                outlet: response.user.outlet,
                permissions: response.user.staffDetails?.permissions || []
            };

            // Store outlet details in localStorage
            if (response.user.outlet) {
                storeOutletDetails(response.user.outlet);
            }

            dispatch({ type: 'LOGIN_SUCCESS', payload: loginData });
            return response;
        } catch (error) {
            dispatch({ type: 'ERROR', payload: error.message });
            throw error;
        }
    };

    const signIn = async (credentials) => {
        dispatch({ type: 'LOADING' });
        try {
            const response = await authService.signIn(credentials);
            console.log('SignIn success:', response);

            const loginData = {
                user: response.user,
                outlet: response.user.outlet,
                permissions: response.user.staffDetails?.permissions || []
            };

            // Store outlet details in localStorage
            if (response.user.outlet) {
                storeOutletDetails(response.user.outlet);
                console.log('Outlet details stored in localStorage:', response.user.outlet);
            }

            dispatch({ type: 'LOGIN_SUCCESS', payload: loginData });
            return response;
        } catch (error) {
            console.error('SignIn error:', error);
            dispatch({ type: 'ERROR', payload: error.message });
            throw error;
        }
    };

    const signOut = async () => {
        dispatch({ type: 'LOADING' });
        try {
            await authService.signOut();
            // Clear outlet details from localStorage
            localStorage.removeItem('outletDetails');
            dispatch({ type: 'LOGOUT' });
        } catch (error) {
            dispatch({ type: 'ERROR', payload: error.message });
            // Clear outlet details even if signout fails
            localStorage.removeItem('outletDetails');
            dispatch({ type: 'LOGOUT' });
        }
    };

    const value = {
        ...state,
        signUp,
        signIn,
        signOut,
        clearError,
        hasPermission,
        getStoredOutletDetails,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext };
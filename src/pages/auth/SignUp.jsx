import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import { ROUTES } from '../../utils/constants.js';
import toast from 'react-hot-toast';

const SignUp = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        retypePassword: '',
    });
    const [formErrors, setFormErrors] = useState({});

    const { signUp, loading, error, clearError, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // * Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate(ROUTES.DASHBOARD, { replace: true });
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        return () => {
            if (clearError) clearError();
        };
    }, [clearError]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                if (clearError) clearError();
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [error, clearError]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.name) {
            errors.name = 'Name is required';
        }

        if (!formData.email) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Email is invalid';
        }

        if (!formData.phone.trim()) {
            errors.phone = 'Phone number is required';
        } else if (!/^\+?[0-9]{7,15}$/.test(formData.phone)) {
            errors.phone = 'Phone number is invalid';
        }

        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        if (!formData.retypePassword) {
            errors.retypePassword = 'Please confirm your password';
        } else if (formData.password !== formData.retypePassword) {
            errors.retypePassword = 'Passwords do not match';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const response = await signUp(formData);
            if (response) {
                toast.success('Staff Successfully signed UP');
                navigate(ROUTES.SIGN_IN, { replace: true });
            }
        } catch (err) {
            console.error('Staff signup error:', err.message);
        }
    };

    return (
        <div 
            className="min-h-screen w-full flex items-center justify-center p-4"
            style={{
                backgroundColor: 'black',
                backgroundImage: `url('/src/assets/stbg.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-xl w-full max-w-md">
                <div className="text-center">
                    <img src="/src/assets/logo2.jpg" alt="Logo" className="mx-auto h-20 w-auto mb-4" />
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">
                        Create Your Account
                    </h2>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="text-sm font-semibold text-gray-700 block mb-1">
                            Full Name
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            className={`w-full px-4 py-3 bg-white rounded-lg border-2 ${formErrors.name ? 'border-red-500' : 'border-gray-900'} focus:outline-none focus:ring-2 focus:ring-yellow-500 transition duration-200`}
                        />
                        {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                    </div>

                    <div>
                        <label htmlFor="email" className="text-sm font-semibold text-gray-700 block mb-1">
                            Email Address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            className={`w-full px-4 py-3 bg-white rounded-lg border-2 ${formErrors.email ? 'border-red-500' : 'border-gray-900'} focus:outline-none focus:ring-2 focus:ring-yellow-500 transition duration-200`}
                        />
                        {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                    </div>

                    <div>
                        <label htmlFor="phone" className="text-sm font-semibold text-gray-700 block mb-1">
                            Phone Number
                        </label>
                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            autoComplete="tel"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter your phone number"
                            className={`w-full px-4 py-3 bg-white rounded-lg border-2 ${formErrors.phone ? 'border-red-500' : 'border-gray-900'} focus:outline-none focus:ring-2 focus:ring-yellow-500 transition duration-200`}
                        />
                        {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                    </div>

                    <div>
                        <label htmlFor="password" className="text-sm font-semibold text-gray-700 block mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a password"
                            className={`w-full px-4 py-3 bg-white rounded-lg border-2 ${formErrors.password ? 'border-red-500' : 'border-gray-900'} focus:outline-none focus:ring-2 focus:ring-yellow-500 transition duration-200`}
                        />
                        {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                    </div>

                    <div>
                        <label htmlFor="retypePassword" className="text-sm font-semibold text-gray-700 block mb-1">
                            Confirm Password
                        </label>
                        <input
                            id="retypePassword"
                            name="retypePassword"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={formData.retypePassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            className={`w-full px-4 py-3 bg-white rounded-lg border-2 ${formErrors.retypePassword ? 'border-red-500' : 'border-gray-900'} focus:outline-none focus:ring-2 focus:ring-yellow-500 transition duration-200`}
                        />
                        {formErrors.retypePassword && <p className="text-red-500 text-xs mt-1">{formErrors.retypePassword}</p>}
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-yellow-500 text-black font-bold py-3 px-4 rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition duration-200 ease-in-out disabled:bg-yellow-300 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </div>
                </form>

                <p className="mt-8 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link
                        to={ROUTES.SIGN_IN}
                        className="font-medium text-yellow-600 hover:text-yellow-500"
                    >
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignUp;
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import { ROUTES } from '../../utils/constants.js';

const SignUp = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone:'',
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
            await signUp(formData);
        } catch (err) {
            console.error('Staff signup error:', err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Or{' '}
                        <Link
                            to={ROUTES.SIGN_IN}
                            className="font-medium text-blue-600 hover:text-blue-500"
                        >
                            sign in to your existing account
                        </Link>
                    </p>
                </div>

                <Card className="p-8">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <Input
                            label="Name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            error={formErrors.name}
                            placeholder="Enter your name"
                        />

                        <Input
                            label="Email address"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            error={formErrors.email}
                            placeholder="Enter your email"
                        />

                        <Input
                            label="Phone Number"
                            name="phone"
                            type="tel"
                            autoComplete="tel"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            error={formErrors.phone}
                            placeholder="Enter your phone number"
                        />

                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            error={formErrors.password}
                            placeholder="Enter your password"
                        />

                        <Input
                            label="Confirm Password"
                            name="retypePassword"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={formData.retypePassword}
                            onChange={handleChange}
                            error={formErrors.retypePassword}
                            placeholder="Confirm your password"
                        />

                        <Button
                            type="submit"
                            className="w-full"
                            loading={loading}
                            disabled={loading}
                        >
                            Sign up
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default SignUp;
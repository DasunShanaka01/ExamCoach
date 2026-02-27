import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const Login = () => {
    // Step 1: Login
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Step 2: OTP Verification (if required)
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState('');
    const [userId, setUserId] = useState(null);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await authAPI.login({ email, password });

            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Redirect based on role
                if (data.user.role === 'admin') {
                    navigate('/admin/dashboard');
                } else if (data.user.role === 'teacher') {
                    navigate('/teacher/dashboard');
                } else {
                    navigate('/student/home');
                }
            } else {
                if (data.requiresVerification) {
                    setUserId(data.userId);
                    setStep(2);
                    setError(data.error); // Show the "new OTP sent" message
                } else {
                    setError(data.error);
                }
            }
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleOTPSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId, otp })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Usually only students do this self-verification, but generalize redirect
                if (data.user.role === 'admin') {
                    navigate('/admin/dashboard');
                } else if (data.user.role === 'teacher') {
                    navigate('/teacher/dashboard');
                } else {
                    navigate('/student/home');
                }
            } else {
                setError(data.error || 'Invalid OTP');
            }
        } catch (err) {
            setError('Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen p-5 bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all hover:scale-105">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                        {step === 1 ? 'Welcome Back' : 'Verify Email'}
                    </h2>
                    <p className="text-gray-600">
                        {step === 1 ? 'Login to ExamCoach' : 'Enter the OTP to verify your account'}
                    </p>
                </div>

                {error && (
                    <div className={`bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-md mb-6 ${step === 1 ? 'animate-shake' : ''}`}>
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleLoginSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                placeholder="your.email@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                placeholder="••••••••"
                            />
                            <div className="text-right mt-2">
                                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                                    Forgot Password?
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all mt-6 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleOTPSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
                                A 6-digit OTP has been sent to your email
                            </label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                maxLength="6"
                                className="w-full text-center tracking-[1em] font-mono text-2xl px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                placeholder="------"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform transition-all mt-6 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                        >
                            {loading ? 'Verifying...' : 'Verify Email & Login'}
                        </button>
                    </form>
                )}

                {step === 1 && (
                    <p className="mt-6 text-center text-gray-600">
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                        >
                            Register as Student
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
};

export default Login;

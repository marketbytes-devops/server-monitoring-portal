import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import { useToast } from '../components/Toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { addToast } = useToast();

    React.useEffect(() => {
        const savedEmail = localStorage.getItem('remembered_email');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await login(email, password);
            const { access, refresh, role, permissions, email: userEmail, username } = res.data;
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            localStorage.setItem('user_role', role);
            localStorage.setItem('user_email', userEmail);
            localStorage.setItem('user_username', username);
            localStorage.setItem('user_permissions', JSON.stringify(permissions));

            if (rememberMe) {
                localStorage.setItem('remembered_email', email);
            } else {
                localStorage.removeItem('remembered_email');
            }

            addToast("Welcome Back! Syncing workspace...", "success");
            navigate('/');
        } catch (err) {
            console.error(err);
            addToast("Access Denied. Invalid credentials.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden">
            {/* Background Decorative Elements - Monochrome Purity */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-zinc-50 rounded-full blur-[120px] opacity-70"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-zinc-50 rounded-full blur-[120px] opacity-70"></div>
            </div>

            <div className="relative z-10 w-full max-w-md p-4">
                <div className="bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-12 border border-black/5">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-black text-white rounded-2xl font-medium text-3xl mb-8 shadow-2xl shadow-black/20">
                            MB
                        </div>
                        <h2 className="text-4xl font-medium text-black uppercase leading-none tracking-tighter">System Core</h2>
                        <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-[0.4em] mt-4">Authorized Personnel Access Only</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-[10px] font-medium text-zinc-600 uppercase tracking-widest mb-3 px-1">Email Identifier</label>
                            <input
                                type="email"
                                required
                                placeholder="name@domain.com"
                                className="input-noir"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-medium text-zinc-600 uppercase tracking-widest mb-3 px-1">Access Token</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••••••"
                                    className="input-noir"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-black transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <div className="w-5 h-5 bg-zinc-50 border border-black/10 rounded-md peer-checked:bg-black peer-checked:border-black transition-all duration-300"></div>
                                    <div className="absolute inset-0 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-300">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                                <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest group-hover:text-black transition-colors">Persistence Mode</span>
                            </label>

                            <Link to="/forgot-password" size="sm" className="text-[9px] font-medium text-zinc-400 uppercase tracking-[0.2em] hover:text-black transition-colors border-b border-transparent hover:border-black/10 pb-1">
                                Recovery Protocol
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-black text-white rounded-2xl font-medium text-xs uppercase tracking-[0.3em] shadow-2xl shadow-black/20 hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? "Authenticating..." : "Establish Session"}
                        </button>
                    </form>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-[9px] font-medium text-zinc-300 uppercase tracking-[0.5em] opacity-50">
                        MB // PRIVILEGED ACCESS V4.0
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;

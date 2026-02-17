import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sendOtp, resetPassword } from '../services/api';
import { useToast } from '../components/Toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { addToast } = useToast();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await sendOtp(email);
            addToast("Synchronization code sent to your email.", "success");
            setStep(2);
        } catch (err) {
            addToast("Failed to send OTP. Verify email entity.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await resetPassword(email, otp, newPassword);
            addToast("Account credentials synchronized. Please login.", "success");
            navigate('/login');
        } catch (err) {
            addToast("Reset failed. Invalid sync code.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden">
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
                        <h2 className="text-4xl font-medium text-black tracking-tighter uppercase leading-none">Recover Access</h2>
                        <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-[0.4em] mt-4">Re-synchronize your credentials</p>
                    </div>

                    {step === 1 ? (
                        <form className="space-y-6" onSubmit={handleSendOtp}>
                            <div>
                                <label className="block text-[10px] font-medium text-zinc-600 uppercase tracking-widest mb-3 px-1">Registered Email</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="name@domain.com"
                                    className="input-noir"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-black text-white rounded-2xl font-medium text-xs uppercase tracking-[0.3em] shadow-2xl shadow-black/20 hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
                            >
                                {loading ? "Initializing..." : "Send Sync Code"}
                            </button>
                        </form>
                    ) : (
                        <form className="space-y-6" onSubmit={handleReset}>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-medium text-zinc-600 uppercase tracking-widest mb-3 px-1">Synchronization Code</label>
                                    <input
                                        type="text"
                                        required
                                        className="input-noir text-center tracking-[0.5em]"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-medium text-zinc-600 uppercase tracking-widest mb-3 px-1">New Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="input-noir"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-black text-white rounded-2xl font-medium text-xs uppercase tracking-[0.3em] shadow-2xl shadow-black/20 hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
                            >
                                {loading ? "Updating..." : "Reset Credentials"}
                            </button>
                        </form>
                    )}

                    <div className="pt-6 text-center">
                        <Link to="/login" className="text-[9px] font-medium text-zinc-600 uppercase tracking-[0.2em] hover:text-black transition-colors border-b border-transparent hover:border-black/10 pb-1">
                            Return to Entry
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;

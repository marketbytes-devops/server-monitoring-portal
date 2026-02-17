import React, { useState } from 'react';
import {
    UserIcon,
    ShieldCheckIcon,
    KeyIcon,
    SignalIcon,
    ArrowPathIcon,
    FingerPrintIcon,
    ShieldExclamationIcon
} from '@heroicons/react/24/outline';
import { getAuth } from '../services/auth';
import { useToast } from '../components/Toast';

const Profile = () => {
    const { addToast } = useToast();
    const auth = getAuth();
    const [loading, setLoading] = useState(false);

    // Form state for password change
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const handlePasswordChange = (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            addToast("Key synchronization failed. Passwords do not match.", "error");
            return;
        }
        setLoading(true);
        // Simulate API call for now or implement if backend is ready
        setTimeout(() => {
            addToast("Access keys rotated successfully.", "success");
            setPasswords({ current: '', new: '', confirm: '' });
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Identity Area */}
            <div className="relative h-64 rounded-[3rem] overflow-hidden group shadow-2xl">
                <div className="absolute inset-0 bg-black">
                    <div className="absolute inset-0 bg-linear-to-br from-zinc-800/50 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-700"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                </div>

                <div className="absolute inset-0 flex items-center px-16">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-4xl bg-white text-black flex items-center justify-center text-5xl font-medium shadow-2xl border-4 border-black group-hover:rotate-6 transition-transform duration-700">
                            {auth.role === 'SUPERADMIN' ? 'S' : 'U'}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-black rounded-full shadow-lg"></div>
                    </div>

                    <div className="ml-10 space-y-2">
                        <div className="flex items-center space-x-3">
                            <h1 className="text-4xl font-medium text-white tracking-tighter uppercase">{auth.role === 'SUPERADMIN' ? 'Entity Root' : 'Operator'} 01</h1>
                            <span className="px-3 py-1 bg-white/10 text-white/40 text-[9px] font-bold uppercase tracking-[0.3em] rounded-full border border-white/5">Authenticated</span>
                        </div>
                        <p className="text-zinc-400 text-sm font-normal tracking-wide opacity-80 uppercase leading-none italic">Authorized personnel within the MarketBytes Cluster</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left: Info Matrix */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[2.5rem] p-12 shadow-2xl shadow-black/2 border border-black/5">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-2xl font-medium text-black uppercase tracking-tight">Identity Matrix</h2>
                            <FingerPrintIcon className="w-6 h-6 text-zinc-300" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Core Identifier</label>
                                <p className="text-lg font-medium text-black">{auth.username || 'Syncing...'}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Email Identifier</label>
                                <p className="text-lg font-medium text-black">{auth.email || 'Syncing...'}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Synchronization State</label>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-black animate-pulse"></div>
                                    <p className="text-lg font-medium text-black uppercase tracking-tight">Active Pulse</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Access Role</label>
                                <p className="text-lg font-medium text-black uppercase tracking-tight">{auth.role}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Security Protocol</label>
                                <p className="text-lg font-medium text-black uppercase tracking-tight">JWT / HS256</p>
                            </div>
                        </div>

                        <div className="mt-12 pt-10 border-t border-zinc-50">
                            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.4em] mb-8">Authorization Capability Matrix</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <PermissionCard active={true} label="View" icon={<SignalIcon className="w-4 h-4" />} />
                                <PermissionCard active={auth.permissions.can_create} label="Create" icon={<ArrowPathIcon className="w-4 h-4" />} />
                                <PermissionCard active={auth.permissions.can_edit} label="Edit" icon={<KeyIcon className="w-4 h-4" />} />
                                <PermissionCard active={auth.permissions.can_delete} label="Delete" icon={<ShieldExclamationIcon className="w-4 h-4" />} />
                            </div>
                        </div>
                    </div>

                    {/* Preferences / Placeholder */}
                    <div className="bg-zinc-50 rounded-[2.5rem] p-12 border border-black/5 flex items-center justify-between group cursor-pointer hover:bg-black transition-all duration-500">
                        <div className="space-y-2">
                            <h3 className="text-xl font-medium text-black group-hover:text-white uppercase tracking-tight transition-colors">Neural Interface Settings</h3>
                            <p className="text-zinc-500 group-hover:text-zinc-400 text-xs transition-colors">Configure system appearance and notification protocols.</p>
                        </div>
                        <div className="p-4 bg-white rounded-2xl border border-black/5 group-hover:bg-zinc-800 group-hover:border-white/10 transition-all">
                            <ArrowPathIcon className="w-6 h-6 text-black group-hover:text-white" />
                        </div>
                    </div>
                </div>

                {/* Right: Security Settings */}
                <div className="space-y-8">
                    <div className="bg-black rounded-[3rem] p-12 shadow-2xl border border-white/5">
                        <div className="flex items-center space-x-4 mb-10">
                            <div className="p-3 bg-white text-black rounded-2xl shadow-xl">
                                <KeyIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-medium text-white uppercase tracking-tight leading-none">Access Key</h2>
                                <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1.5 font-bold">Rotation Protocol</p>
                            </div>
                        </div>

                        <form onSubmit={handlePasswordChange} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block px-1">Current Key</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-white/30 transition-all placeholder:text-zinc-800"
                                    value={passwords.current}
                                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block px-1">New Access Key</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-white/30 transition-all placeholder:text-zinc-800"
                                    value={passwords.new}
                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block px-1">Confirm New Key</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-white/30 transition-all placeholder:text-zinc-800"
                                    value={passwords.confirm}
                                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-white text-black rounded-2xl font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-zinc-200 active:scale-95 transition-all shadow-xl shadow-white/5 mt-4 disabled:opacity-50"
                            >
                                {loading ? 'Syncing...' : 'Rotate Access Key'}
                            </button>
                        </form>

                        <div className="mt-10 p-6 bg-white/5 rounded-3xl border border-white/5">
                            <div className="flex items-start space-x-4">
                                <ShieldCheckIcon className="w-5 h-5 text-white/40 mt-0.5" />
                                <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
                                    Last synchronized rotation was <span className="text-white opacity-60">24 days ago</span>. We recommend rotating your access key every 90 days to maintain core purity.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PermissionCard = ({ active, label, icon }) => (
    <div className={`p-6 rounded-3xl border flex flex-col items-center justify-center text-center space-y-3 transition-all duration-500 ${active ? 'bg-zinc-900 border-black text-white shadow-xl translate-y-[-2px]' : 'bg-transparent border-zinc-100 text-zinc-300'}`}>
        <div className={`p-3 rounded-2xl ${active ? 'bg-white/10' : 'bg-zinc-50'}`}>
            {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </div>
);

export default Profile;

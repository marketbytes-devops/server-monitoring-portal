import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, BellIcon, Bars3Icon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { useToast } from './Toast';
import { getAuth } from '../services/auth';
import { logout } from '../services/api';

const TopBar = ({ toggleSidebar }) => {
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [auth, setAuth] = useState(getAuth());

    useEffect(() => {
        // Sync auth on mount
        setAuth(getAuth());
    }, []);

    return (
        <div className="h-20 sticky top-0 z-50 glass flex items-center justify-between px-10 border-b border-black/5">
            {/* Left: Search Area */}
            <div className="flex items-center space-x-6">
                <button
                    onClick={toggleSidebar}
                    className="p-2.5 bg-zinc-50 hover:bg-black hover:text-white rounded-xl transition-all duration-500 border border-black/5 group"
                >
                    <Bars3Icon className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
                </button>
                <div className="relative group">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-5 top-1/2 transform -translate-y-1/2 text-zinc-300 group-focus-within:text-black transition-colors duration-500 z-10" />
                    <input
                        type="text"
                        placeholder="Search system nodes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-noir pl-14! w-80! bg-zinc-50/50! rounded-full!"
                    />
                </div>
            </div>

            {/* Right: Actions & Profile */}
            <div className="flex items-center space-x-8">
                {auth.permissions.can_create && (
                    <button
                        onClick={() => navigate('/monitors/create')}
                        className="bg-black text-white px-6 py-3 rounded-2xl text-[10px] font-medium uppercase tracking-[0.25em] hover:bg-zinc-800 active:scale-95 transition-all shadow-2xl shadow-black/10"
                    >
                        Activate Pulse
                    </button>
                )}

                {/* Vertical Divider */}
                <div className="h-8 w-px bg-zinc-200/60"></div>

                {/* Notifications & Profile */}
                <div className="flex items-center space-x-6">
                    <button className="relative p-2 text-zinc-600 hover:text-black transition-colors duration-500">
                        <BellIcon className="w-6 h-6" />
                        <span className="absolute top-2.5 right-2.5 block h-1.5 w-1.5 rounded-full bg-black"></span>
                    </button>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-4 cursor-pointer group">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-medium text-black leading-none group-hover:text-zinc-600 transition-colors">Admin Entity</p>
                                <p className="text-[9px] text-zinc-600 uppercase tracking-widest mt-1.5 font-normal">{auth.role}</p>
                            </div>
                            <div className="relative">
                                <img
                                    className="h-11 w-11 rounded-2xl border border-black/5 shadow-xl object-cover group-hover:scale-105 transition-transform duration-500"
                                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                    alt="User"
                                />
                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-black border-2 border-white rounded-full"></div>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={() => logout()}
                            className="p-2.5 bg-zinc-50 hover:bg-black hover:text-white rounded-xl transition-all duration-500 border border-black/5"
                            title="Terminate Session"
                        >
                            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBar;

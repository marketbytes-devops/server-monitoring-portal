import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, BellIcon, Bars3Icon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { useToast } from './Toast';
import { getAuth } from '../services/auth';
import api, { logout } from '../services/api';

const TopBar = ({ toggleSidebar }) => {
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [auth, setAuth] = useState(getAuth());
    const [incidents, setIncidents] = useState([]);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    useEffect(() => {
        setAuth(getAuth());
        fetchIncidents();

        // Refresh incidents every 30 seconds
        const interval = setInterval(fetchIncidents, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchIncidents = async () => {
        try {
            const res = await api.get('incidents/');
            // Get last 5 ongoing/recent incidents
            setIncidents(res.data.slice(0, 5));
        } catch (error) {
            console.error("Failed to fetch notification pulse", error);
        }
    };

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
                    <div className="relative">
                        <button
                            onClick={() => setIsNotifOpen(!isNotifOpen)}
                            className={`relative p-2 ${isNotifOpen ? 'text-black' : 'text-zinc-600'} hover:text-black transition-colors duration-500`}
                        >
                            <BellIcon className="w-6 h-6" />
                            {incidents.some(i => !i.resolved_at) && (
                                <span className="absolute top-2.5 right-2.5 block h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        {isNotifOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsNotifOpen(false)}></div>
                                <div className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-black/5 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="p-5 border-b border-zinc-50 bg-zinc-50/50">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-[10px] font-bold text-black uppercase tracking-[0.2em]">Pulse Alerts</h3>
                                            <span className="text-[8px] bg-black text-white px-2 py-0.5 rounded-md font-bold uppercase tracking-widest">
                                                {incidents.filter(i => !i.resolved_at).length} ACTIVE
                                            </span>
                                        </div>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto no-scrollbar">
                                        {incidents.length > 0 ? (
                                            incidents.map((incident) => (
                                                <div
                                                    key={incident.id}
                                                    onClick={() => {
                                                        navigate(`/incidents`);
                                                        setIsNotifOpen(false);
                                                    }}
                                                    className="p-5 hover:bg-zinc-50 transition-colors border-b border-zinc-50 last:border-0 cursor-pointer group"
                                                >
                                                    <div className="flex items-start space-x-4">
                                                        <div className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${incident.resolved_at ? 'bg-zinc-200' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[11px] font-bold text-black uppercase tracking-tight truncate group-hover:text-red-500 transition-colors">
                                                                {incident.url_name} Offline
                                                            </p>
                                                            <p className="text-[10px] text-zinc-500 mt-1 line-clamp-1">{incident.error_message}</p>
                                                            <p className="text-[8px] text-zinc-400 mt-2 font-medium">
                                                                {new Date(incident.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} //
                                                                <span className="ml-1">{incident.resolved_at ? 'RESOLVED' : 'ONGOING'}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-10 text-center">
                                                <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-black/5">
                                                    <BellIcon className="w-6 h-6 text-zinc-200" />
                                                </div>
                                                <p className="text-[9px] font-medium text-zinc-400 uppercase tracking-widest leading-relaxed">
                                                    No system failures<br />detected in current perimeter
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        onClick={() => {
                                            navigate('/alert-contacts');
                                            setIsNotifOpen(false);
                                        }}
                                        className="p-4 bg-zinc-50 flex items-center justify-center border-t border-zinc-100 hover:bg-black group transition-all duration-300 cursor-pointer"
                                    >
                                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest group-hover:text-white transition-colors">Setup Notifications Entities</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

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

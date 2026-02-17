import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getMonitors } from '../services/api';
import { getAuth } from '../services/auth';
import {
    ClockIcon,
    ArrowUpRightIcon,
    CircleStackIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../components/Toast';

const Dashboard = () => {
    const [monitors, setMonitors] = useState([]);
    const [stats, setStats] = useState({ up: 0, down: 0, total: 0, avgResponse: '0ms' });
    const { refreshTrigger } = useOutletContext() || {};
    const navigate = useNavigate();
    const { addToast } = useToast();
    const auth = getAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getMonitors();
                setMonitors(res.data);
                calculateStats(res.data);
            } catch (error) {
                console.error("Failed to fetch monitors", error);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [refreshTrigger]);

    const calculateStats = (data) => {
        const up = data.filter(m => m.last_record?.is_up).length;
        const down = data.filter(m => m.last_record && !m.last_record.is_up).length;
        const avg = data.length > 0
            ? Math.round(data.reduce((acc, m) => acc + (m.last_record?.response_time || 0), 0) / data.length * 1000)
            : 0;
        const uptime = data.length > 0
            ? (data.reduce((acc, m) => acc + (m.uptime_percentage_24h || 0), 0) / data.length).toFixed(2)
            : 0;
        setStats({ up, down, total: data.length, avgResponse: `${avg}ms`, fleetUptime: `${uptime}%` });
    };

    const handleAction = (name) => {
        addToast(`Action "${name}" triggered!`, "info");
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="space-y-3">
                <div className="flex items-center space-x-3 text-[10px] font-medium text-black tracking-[0.3em] uppercase">
                    <div className="w-10 h-px bg-black"></div>
                    <span>System Core v4.0 // Prime</span>
                </div>
                <h1 className="text-6xl font-medium text-black uppercase leading-none tracking-tighter">
                    Monitoring<span className="text-zinc-300">.</span>System
                </h1>
                <p className="text-[10px] font-normal text-zinc-600 uppercase tracking-[0.4em] mb-4">Autonomous Pulse Network</p>
                <p className="text-base text-zinc-600 max-w-xl font-normal leading-relaxed">
                    Synchronized workspace for marketbytesdevops. Your operational efficiency is at <span className="text-black font-medium border-b-2 border-black">Optimum.</span>
                </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Fleet Uptime"
                    value={stats.fleetUptime}
                    label="NETWORK RELIABILITY"
                    icon={<CircleStackIcon className="w-6 h-6 text-gray-700" />}
                />
                <StatCard
                    title="Active Nodes"
                    value={stats.up}
                    label={`${stats.total} TOTAL CONTEXTS`}
                    icon={<ArrowPathIcon className="w-6 h-6 text-gray-700" />}
                    badge="LIVE PULSE"
                />
                <StatCard
                    title="Avg Latency"
                    value={stats.avgResponse}
                    label="SYSTEM RESPONSE"
                    icon={<ClockIcon className="w-6 h-6 text-gray-700" />}
                />
                <StatCard
                    title="Pulse Failures"
                    value={stats.down}
                    label="CRITICAL EVENTS"
                    icon={<ExclamationTriangleIcon className="w-6 h-6 text-gray-700" />}
                />
            </div>

            {/* Main Content Layout */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Growth Analytics Area */}
                <div className="flex-3 bg-white rounded-[2.5rem] p-12 shadow-2xl shadow-black/3 border border-black/5 flex flex-col min-h-[500px]">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-3xl font-medium text-black uppercase tracking-tight">Growth Analytics</h2>
                            <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-[0.2em] mt-2">Uptime Pulse Flow & Conversion</p>
                        </div>
                        <button className="p-4 bg-zinc-50 rounded-2xl hover:bg-black hover:text-white transition-all duration-500">
                            <ArrowUpRightIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Monitor List Placeholder / Simplified List */}
                    <div className="flex-1 space-y-4">
                        {monitors.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center mb-6 border border-black/5">
                                    <MagnifyingGlassIcon className="w-10 h-10 text-zinc-200" />
                                </div>
                                <p className="text-zinc-600 font-normal uppercase tracking-widest text-[10px]">No monitors detected</p>
                            </div>
                        ) : (
                            monitors.map((mon) => (
                                <div
                                    key={mon.id}
                                    onClick={() => navigate(`/monitors/${mon.id}`)}
                                    className="flex items-center justify-between p-6 bg-zinc-50/30 rounded-3xl border border-transparent hover:border-black/5 hover:bg-white hover:shadow-xl hover:shadow-black/2 transition-all duration-500 group cursor-pointer"
                                >
                                    <div className="flex items-center space-x-6">
                                        <div className="relative">
                                            <div className={`w-3 h-3 rounded-full ${mon.last_record?.is_up ? 'bg-black' : 'bg-zinc-300'} shadow-sm`}></div>
                                            {!mon.last_record?.is_up && mon.last_record && (
                                                <div className="absolute -inset-1 rounded-full bg-zinc-300/20 animate-ping"></div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-3">
                                                <p className="text-sm font-medium text-black tracking-tight">{mon.name}</p>
                                                <span className="px-2 py-0.5 bg-black text-white text-[8px] font-bold rounded-md uppercase tracking-wider leading-tight">
                                                    {mon.monitor_type}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-3 mt-1">
                                                <p className="text-[9px] text-zinc-400 font-normal uppercase tracking-widest">{mon.url}</p>
                                                {mon.check_ssl && mon.ssl_expiry && (
                                                    <span className="text-[8px] text-zinc-500 font-medium uppercase tracking-tighter">
                                                        • SSL Expires: {new Date(mon.ssl_expiry).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-12">
                                        {!mon.last_record?.is_up && mon.last_record && (
                                            <div className="text-right hidden sm:block">
                                                <p className="text-[10px] text-red-500 font-medium uppercase tracking-widest leading-none">Offline</p>
                                                <p className="text-[8px] text-zinc-400 mt-1 truncate max-w-[100px]">{mon.last_record.error_message}</p>
                                            </div>
                                        )}
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-black">{mon.last_record?.response_time ? (mon.last_record.response_time * 1000).toFixed(0) : 0}ms</p>
                                            <p className="text-[9px] text-zinc-600 font-normal uppercase mt-0.5">Latency</p>
                                        </div>
                                        <button className="p-2 transition-transform duration-500 group-hover:translate-x-1">
                                            <ChevronRightIcon className="w-5 h-5 text-zinc-300 group-hover:text-black" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Command Sidebar */}
                <div className="flex-1 space-y-6">
                    <div className="bg-black rounded-[2.5rem] p-10 shadow-2xl border border-white/5 h-full flex flex-col">
                        <h2 className="text-3xl font-medium text-white uppercase tracking-tight mb-2">Command</h2>
                        <p className="text-[10px] text-zinc-500 font-normal uppercase tracking-[0.2em] mb-10">Neural Interface Access</p>

                        <div className="space-y-4">
                            {auth.permissions.can_create && (
                                <CommandButton
                                    label="PROJECTS"
                                    icon={<PlusIcon className="w-5 h-5" />}
                                    onClick={() => navigate('/monitors/create')}
                                />
                            )}
                            <CommandButton
                                label="SECURITY"
                                icon={<ShieldCheckIcon className="w-5 h-5" />}
                                onClick={() => handleAction('Security')}
                            />
                            <CommandButton
                                label="ANALYTICS"
                                icon={<ArrowUpRightIcon className="w-5 h-5" />}
                                onClick={() => handleAction('Analytics')}
                            />
                        </div>

                        <div className="mt-auto pt-12">
                            <div className="bg-white/5 rounded-4xl p-8 border border-white/10 overflow-hidden relative group cursor-pointer hover:bg-white hover:text-black text-zinc-300 transition-all duration-700">
                                <div className="z-10 relative">
                                    <p className="text-[9px] font-normal uppercase tracking-[0.3em] mb-3 opacity-60">Core Status</p>
                                    <h3 className="text-xl font-medium uppercase leading-tight">System<br />Purity</h3>
                                    <p className="text-4xl font-medium mt-6 tracking-tighter cursor-default">99.9%</p>
                                </div>
                                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-black/5 transition-all duration-700"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, label, icon, badge }) => (
    <div className="bg-white rounded-4xl p-8 shadow-2xl shadow-black/2 border border-black/5 flex items-center justify-between relative overflow-hidden group hover:shadow-black/5 hover:-translate-y-1 transition-all duration-500">
        <div className="z-10">
            <p className="text-[9px] font-medium text-zinc-600 uppercase tracking-[0.25em] mb-2">{title}</p>
            <h3 className="text-4xl font-medium text-black tracking-tighter">{value}</h3>
            <p className="text-[9px] font-normal text-zinc-600 uppercase mt-3 tracking-widest">
                <span className="w-1 h-1 bg-black rounded-full inline-block mr-2 align-middle"></span>
                {label}
            </p>
        </div>
        <div className="bg-zinc-50 p-5 rounded-3xl group-hover:bg-black group-hover:text-white transition-all duration-500 shadow-sm border border-black/5">
            {icon}
        </div>
        {badge && (
            <div className="absolute top-6 right-10 flex items-center space-x-2">
                <span className="text-[8px] font-medium text-black uppercase tracking-[0.2em]">{badge}</span>
                <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-20"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
                </span>
            </div>
        )}
    </div>
);

const CommandButton = ({ label, icon, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white hover:text-black hover:shadow-2xl transition-all duration-500 text-left group"
    >
        <div className="flex items-center space-x-4">
            <div className="p-2.5 bg-white text-black rounded-xl group-hover:rotate-12 transition-transform duration-500">
                {icon}
            </div>
            <span className="text-[10px] font-medium text-zinc-300 group-hover:text-black uppercase tracking-[0.2em]">{label}</span>
        </div>
        <ChevronRightIcon className="w-4 h-4 text-white/30 group-hover:text-black transition-colors" />
    </button>
);

const ShieldCheckIcon = (props) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
)

export default Dashboard;

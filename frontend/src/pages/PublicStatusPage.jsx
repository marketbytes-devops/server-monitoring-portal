import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getStatusPageBySlug } from '../services/api';
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    SignalIcon,
    ArrowPathIcon,
    ClockIcon,
    BoltIcon
} from '@heroicons/react/24/outline';

const PublicStatusPage = () => {
    const { slug } = useParams();
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await getStatusPageBySlug(slug);
                setPageData(res.data);
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchStatus();
        const interval = setInterval(fetchStatus, 60000);
        return () => clearInterval(interval);
    }, [slug]);

    if (loading) return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
            <ArrowPathIcon className="w-10 h-10 text-zinc-300 animate-spin" />
        </div>
    );

    if (error || !pageData) return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
            <div className="text-center space-y-4">
                <ExclamationTriangleIcon className="w-16 h-16 text-zinc-300 mx-auto" />
                <h1 className="text-xl font-medium text-black uppercase tracking-widest">Status Page Not Found</h1>
                <p className="text-zinc-500 text-sm">This interface has been disconnected or does not exist.</p>
            </div>
        </div>
    );

    const monitors = pageData.monitors_data || [];
    const allUp = monitors.every(m => m.last_record?.is_up);
    const someDown = monitors.some(m => m.last_record && !m.last_record.is_up);

    return (
        <div className="min-h-screen bg-[#fafafa] text-black selection:bg-black selection:text-white pb-20">
            {/* Header */}
            <div className="bg-white border-b border-zinc-100">
                <div className="max-w-5xl mx-auto px-6 h-24 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold rounded-xl shadow-lg">
                            MB
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight uppercase">{pageData.name}</h1>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Powered by MarketBytes</p>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center space-x-6">
                        <div className="text-right">
                            <p className="text-[10px] text-zinc-400 font-bold uppercase">Uptime Pulse</p>
                            <p className="text-xs font-bold text-black uppercase">99.98% Average</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-6 mt-12 space-y-12">
                {/* Global Status Banner */}
                <div className={`p-10 rounded-[2.5rem] flex items-center justify-between border shadow-2xl shadow-black/2 ${allUp ? 'bg-black text-white' : someDown ? 'bg-red-500 text-white' : 'bg-zinc-900 text-white'
                    }`}>
                    <div className="flex items-center space-x-8">
                        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl ${allUp ? 'bg-white/10' : 'bg-white/20'
                            }`}>
                            {allUp ? (
                                <CheckCircleIcon className="w-10 h-10 text-white" />
                            ) : (
                                <ExclamationTriangleIcon className="w-10 h-10 text-white" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-3xl font-medium uppercase tracking-tight">
                                {allUp ? 'All Systems Operational' : 'Partial Service Disruption'}
                            </h2>
                            <p className="text-[10px] opacity-60 font-bold uppercase tracking-[0.3em] mt-1">
                                {allUp ? 'Autonomous Pulse Network: SECURE' : 'System integrity check required'}
                            </p>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="flex items-center -space-x-1">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={`w-1.5 h-6 rounded-full mx-0.5 ${allUp ? 'bg-white/30' : 'bg-white/50'}`}></div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Monitors Grid */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.3em]">Network Topology</h3>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">Live Updates</span>
                    </div>
                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-black/2 border border-zinc-100 divide-y divide-zinc-50 overflow-hidden">
                        {monitors.map(mon => (
                            <div key={mon.id} className="p-8 flex flex-col md:flex-row md:items-center justify-between hover:bg-zinc-50/50 transition-all group">
                                <div className="flex items-center space-x-6 mb-6 md:mb-0">
                                    <div className={`w-2 h-2 rounded-full ${mon.last_record?.is_maintenance ? 'bg-amber-400' :
                                            mon.last_record?.is_up ? 'bg-black' : 'bg-red-500'
                                        } shadow-lg`}></div>
                                    <div>
                                        <div className="flex items-center space-x-3">
                                            <h4 className="text-base font-bold text-black tracking-tight">{mon.name}</h4>
                                            {mon.last_record?.is_maintenance && (
                                                <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 text-[7px] font-bold rounded uppercase tracking-widest border border-amber-100">
                                                    Maintenance
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{mon.url}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end md:space-x-12">
                                    {/* Uptime History mini-bars */}
                                    <div className="hidden lg:flex items-center space-x-1">
                                        {(mon.uptime_history || []).slice(-30).map((up, i) => (
                                            <div
                                                key={i}
                                                title={up ? "Operational" : "Downtime Detected"}
                                                className={`w-1 h-6 rounded-full ${up ? 'bg-zinc-100 group-hover:bg-zinc-200' : 'bg-red-300'}`}
                                            ></div>
                                        ))}
                                    </div>

                                    <div className="text-right min-w-[100px]">
                                        <p className="text-sm font-bold text-black">{mon.uptime_percentage_24h}%</p>
                                        <p className="text-[9px] text-zinc-400 font-bold uppercase mt-0.5">24h Uptime</p>
                                    </div>

                                    <div className="text-right min-w-[80px]">
                                        <p className="text-sm font-bold text-black">
                                            {mon.last_record?.response_time ? (mon.last_record.response_time * 1000).toFixed(0) : 0}ms
                                        </p>
                                        <p className="text-[9px] text-zinc-400 font-bold uppercase mt-0.5">Latency</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Events Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-[2.5rem] p-10 border border-zinc-100 shadow-xl shadow-black/2 flex flex-col items-center justify-center text-center space-y-6">
                        <ClockIcon className="w-12 h-12 text-zinc-200" />
                        <div>
                            <h3 className="text-sm font-bold text-black uppercase tracking-widest">Scheduled Maintenance</h3>
                            <p className="text-xs text-zinc-500 mt-2">All systems are clear. No scheduled maintenance in the near future.</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-[2.5rem] p-10 border border-zinc-100 shadow-xl shadow-black/2 flex flex-col items-center justify-center text-center space-y-6">
                        <BoltIcon className="w-12 h-12 text-zinc-200" />
                        <div>
                            <h3 className="text-sm font-bold text-black uppercase tracking-widest">Operational Velocity</h3>
                            <p className="text-xs text-zinc-500 mt-2">Nodes are operating at peak efficiency with localized redundancy active.</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <div className="max-w-5xl mx-auto px-6 mt-12 flex flex-col md:flex-row items-center justify-between text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] space-y-4 md:space-y-0 text-center md:text-left">
                <div className="flex items-center space-x-4">
                    <span>© 2026 MarketBytes Devops</span>
                    <span className="text-zinc-200">|</span>
                    <a href="#" className="hover:text-black transition-colors">Support Portal</a>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                    <span>Global Pulse Optimized</span>
                </div>
            </div>
        </div>
    );
};

export default PublicStatusPage;

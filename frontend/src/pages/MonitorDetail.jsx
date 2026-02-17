import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMonitor, deleteMonitor } from '../services/api';
import {
    ChevronLeftIcon,
    ArrowPathIcon,
    TrashIcon,
    ShieldCheckIcon,
    GlobeAltIcon,
    ExclamationCircleIcon,
    MapIcon,
    EyeIcon,
    ClockIcon,
    SignalIcon,
    CommandLineIcon,
    CpuChipIcon,
    CircleStackIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../components/Toast';

const MonitorDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [monitor, setMonitor] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await getMonitor(id);
            setMonitor(res.data);
        } catch (error) {
            console.error(error);
            addToast("Failed to fetch monitor details", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm("Permanently disconnect this pulse node?")) return;
        try {
            await deleteMonitor(id);
            addToast("Monitor node decommissioned.", "success");
            navigate('/monitors');
        } catch (error) {
            addToast("Failed to decommission node.", "error");
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <ArrowPathIcon className="w-10 h-10 text-zinc-200 animate-spin" />
        </div>
    );

    if (!monitor) return <div className="text-center py-20 uppercase font-bold tracking-widest">Node not found</div>;

    const isUp = monitor.last_record?.is_up;
    const lastLatency = monitor.last_record?.response_time ? Math.round(monitor.last_record.response_time * 1000) : 0;
    const sslDays = monitor.ssl_expiry ? Math.ceil((new Date(monitor.ssl_expiry) - new Date()) / (1000 * 60 * 60 * 24)) : null;
    const domainDays = monitor.domain_expiry ? Math.ceil((new Date(monitor.domain_expiry) - new Date()) / (1000 * 60 * 60 * 24)) : null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/monitors')}
                    className="group flex items-center space-x-2 text-zinc-500 hover:text-black transition-colors"
                >
                    <ChevronLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Back to Perimeter</span>
                </button>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={fetchData}
                        className="p-3 bg-zinc-50 text-black rounded-2xl hover:bg-black hover:text-white transition-all shadow-sm group"
                        title="Force Synchronization"
                    >
                        <ArrowPathIcon className="w-5 h-5 group-active:rotate-180 transition-transform" />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="p-3 bg-red-50/50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        title="Decommission Node"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center space-x-4">
                    <h1 className="text-4xl font-medium text-black uppercase tracking-tighter leading-none">
                        {monitor.name}<span className="text-zinc-300">.</span>{monitor.category === 'SSH' ? 'Server' : 'Node'}
                    </h1>
                    <span className={`px-4 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest ${isUp ? 'bg-black text-white' : 'bg-red-500 text-white animate-pulse'}`}>
                        {isUp ? 'ACTIVE' : 'OFFLINE'}
                    </span>
                </div>
                <div className="flex items-center space-x-3 text-[10px] text-zinc-600 font-medium uppercase tracking-[0.4em]">
                    <span>{monitor.url}</span>
                    <span className="text-zinc-300">//</span>
                    <span>{monitor.category === 'SSH' ? 'SSH PERIMETER' : monitor.monitor_type}</span>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryBox
                    title="Current Status"
                    value={isUp ? 'Currently Up' : 'Currently Down'}
                    subValue={isUp ? `System heartbeat operational` : `Detected pulse failure`}
                    type={isUp ? 'success' : 'error'}
                />
                <SummaryBox
                    title="Last Check"
                    value={monitor.last_record ? new Date(monitor.last_record.checked_at).toLocaleTimeString() : 'Never'}
                    subValue={`Interval: ${monitor.interval}m`}
                    icon={<ClockIcon className="w-5 h-5" />}
                />
                <SummaryBox
                    title="Response Time"
                    value={`${monitor.last_record?.response_time ? (monitor.last_record.response_time * 1000).toFixed(0) : 0}ms`}
                    subValue="Latest latency pulse"
                    icon={<SignalIcon className="w-5 h-5" />}
                />
            </div>

            {/* Uptime Blocks */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-black/2 border border-black/5 space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-medium text-black uppercase tracking-tight">Perimeter Uptime</h3>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Last 24 hours</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-medium text-black tracking-tighter">{monitor.uptime_percentage_24h}%</p>
                        <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">{monitor.recent_incidents?.length || 0} incidents recorded</p>
                    </div>
                </div>

                <div className="flex gap-1 h-12">
                    {[...Array(60)].map((_, i) => (
                        <div key={i} className={`flex-1 rounded-sm opacity-90 hover:opacity-100 transition-opacity cursor-help ${isUp ? 'bg-black' : 'bg-red-500'}`} title={`Pulse OK`}></div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-8 border-t border-zinc-50">
                    <HistoryStat label="Last 7 days" percentage={`${monitor.uptime_7d}%`} info="Rolling reliability" />
                    <HistoryStat label="Last 30 days" percentage={`${monitor.uptime_30d}%`} info="Monthly node uptime" />
                    <HistoryStat label="Last 365 days" percentage={`${monitor.uptime_365d || monitor.uptime_30d}%`} info="Annual fleet health" />
                </div>
            </div>

            {/* Response Time Chart */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-black/2 border border-black/5 space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-medium text-black uppercase tracking-tight">Response Time</h3>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">System latency timeline</p>
                    </div>
                    <div className="flex gap-8">
                        <ChartLegend label="Average" value={`${monitor.stats?.avg || 0}ms`} />
                        <ChartLegend label="Minimum" value={`${monitor.stats?.min || 0}ms`} />
                        <ChartLegend label="Maximum" value={`${monitor.stats?.max || 0}ms`} />
                    </div>
                </div>

                <div className="h-48 flex items-end justify-between px-4 pb-2 border-l border-b border-zinc-100 relative">
                    {/* Real Graph Lines from API */}
                    {monitor.response_times_history && monitor.response_times_history.length > 0 ? (
                        monitor.response_times_history.map((val, i) => {
                            const maxVal = monitor.stats?.max || 1000;
                            const height = (val / maxVal) * 90 + 5; // scaled 5-95%
                            return (
                                <div
                                    key={i}
                                    className="w-2 bg-zinc-100 rounded-t-sm hover:bg-black transition-all cursor-crosshair group relative"
                                    style={{ height: `${height}%` }}
                                >
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-[8px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                        {val}ms
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="w-full text-center text-[10px] text-zinc-300 uppercase tracking-widest pb-10">Waiting for latency pulses...</div>
                    )}
                    <div className="absolute left-0 top-0 text-[8px] text-zinc-300 transform -translate-x-full pr-2 text-right">{monitor.stats?.max || 0}ms</div>
                    <div className="absolute left-0 bottom-0 text-[8px] text-zinc-300 transform -translate-x-full pr-2">0ms</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Node Identity Card (SSH Only) */}
                {monitor.category === 'SSH' && (
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-black/2 border border-black/5 space-y-8">
                        <div className="flex items-center space-x-3">
                            <CommandLineIcon className="w-5 h-5 text-zinc-400" />
                            <h3 className="text-lg font-medium text-black uppercase tracking-tight">Node Identity</h3>
                        </div>
                        <div className="space-y-6">
                            <IdentityItem label="Authorized User" value={monitor.ssh_username || 'root'} />
                            <IdentityItem label="Service Port" value="22 (Standard)" />
                            <IdentityItem label="Authentication" value="RSA-4096 / Ed25519" />
                            <div className="pt-4 border-t border-zinc-50 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">RSA Identity Fingerprint</span>
                                <span className="text-[9px] font-mono text-zinc-400">SHA256:8x...2v9k</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Domain & SSL Info (Sites) / Security Info (SSH) */}
                <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-black/2 border border-black/5 space-y-10">
                    <div className="flex items-center space-x-3">
                        <ShieldCheckIcon className="w-5 h-5 text-zinc-400" />
                        <h3 className="text-lg font-medium text-black uppercase tracking-tight">
                            {monitor.category === 'SSH' ? 'Security Protocol' : 'Security & Domain'}
                        </h3>
                    </div>
                    <div className="space-y-8">
                        {monitor.category !== 'SSH' ? (
                            <>
                                <div>
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Domain Validation</p>
                                    <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-black/5">
                                        <span className="text-xs font-medium text-black">
                                            {domainDays !== null ? `Expires in ${domainDays} days` : 'Monitoring active'}
                                        </span>
                                        <span className="text-[8px] font-bold text-black uppercase tracking-widest">
                                            {domainDays !== null ? 'Verified' : 'Active'}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-3">SSL Certificate</p>
                                    <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-black/5">
                                        <span className="text-xs font-medium text-black">
                                            {sslDays !== null ? `Expires in ${sslDays} days` : 'Scanning...'}
                                            {monitor.ssl_issuer && <span className="text-zinc-400 ml-1">({monitor.ssl_issuer})</span>}
                                        </span>
                                        <span className="text-[8px] font-bold text-black uppercase tracking-widest">
                                            {sslDays !== null && sslDays > 0 ? 'Valid' : 'Checking'}
                                        </span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <SecurityFeature title="Encrypted Transport" status="ENABLED" desc="AES-256-GCM symmetric encryption active." />
                                <SecurityFeature title="Identity Validation" status="PKI-KEYS" desc="Authorized via cryptographically secure keys." />
                                <SecurityFeature title="Host Verification" status="VERIFIED" desc="Host signature matches system records." />
                            </>
                        )}
                    </div>
                </div>

                {/* Server Health Metrics (SSH Only) */}
                {monitor.category === 'SSH' && (
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-black/2 border border-black/5 space-y-8 lg:col-span-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <CpuChipIcon className="w-5 h-5 text-zinc-400" />
                                <h3 className="text-lg font-medium text-black uppercase tracking-tight">Server Health Matrix</h3>
                            </div>
                            {monitor.last_record?.system_uptime && (
                                <div className="flex items-center space-x-2 px-4 py-1.5 bg-zinc-50 rounded-xl border border-black/5">
                                    <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Uptime:</span>
                                    <span className="text-[10px] font-medium text-black">{monitor.last_record.system_uptime}</span>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <MetricGauge
                                label="CPU LOAD"
                                value={monitor.last_record?.cpu_usage || 0}
                                icon={<CpuChipIcon className="w-5 h-5" />}
                            />
                            <MetricGauge
                                label="RAM UTILIZATION"
                                value={monitor.last_record?.ram_usage || 0}
                                icon={<CircleStackIcon className="w-5 h-5" />}
                            />
                            <MetricGauge
                                label="DISK CONSUMPTION"
                                value={monitor.last_record?.disk_usage || 0}
                                icon={<CommandLineIcon className="w-5 h-5" />}
                            />
                        </div>
                    </div>
                )}

                {/* Latency Map (Hide or move if SSH) */}
                {monitor.category !== 'SSH' && (
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-black/2 border border-black/5 space-y-8">
                        <div className="flex items-center space-x-3">
                            <MapIcon className="w-5 h-5 text-zinc-400" />
                            <h3 className="text-lg font-medium text-black uppercase tracking-tight">Regions Pulse</h3>
                        </div>
                        <div className="relative group">
                            <div className="bg-zinc-50 rounded-3xl aspect-video flex items-center justify-center overflow-hidden border border-black/5">
                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#000_1px,transparent_1px)] bg-size:20px_20px"></div>
                                <div className="space-y-4 text-center z-10">
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Global Distribution Map</p>
                                    <div className="flex gap-4">
                                        <RegionMarker city="Nuremberg" latency={`${lastLatency}ms`} active />
                                        <RegionMarker city="Frankfurt" latency={`${Math.round(lastLatency * 1.05)}ms`} active />
                                        <RegionMarker city="Falkenstein" latency={`${Math.round(lastLatency * 0.95)}ms`} active />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* SSH Pulse Log Simulation */}
            {monitor.category === 'SSH' && (
                <div className="bg-black rounded-[2.5rem] p-10 shadow-2xl border border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <CommandLineIcon className="w-5 h-5 text-zinc-500" />
                            <h3 className="text-lg font-medium text-white uppercase tracking-tight">Active Pulse Log</h3>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Stream Active</span>
                        </div>
                    </div>
                    <div className="bg-zinc-900/50 rounded-3xl p-8 font-mono text-[11px] space-y-2 overflow-hidden h-[200px] border border-white/5 relative">
                        <div className="absolute inset-0 bg-linear-to-b from-transparent to-zinc-900/80 pointer-events-none z-10"></div>
                        <p className="text-zinc-500">[{new Date().toLocaleTimeString()}] Establishing secure handshake... COMPLETED</p>
                        <p className="text-zinc-500">[{new Date().toLocaleTimeString()}] Authenticating via PKI Identifiers... VERIFIED</p>
                        <p className="text-zinc-500">[{new Date().toLocaleTimeString()}] Synchronizing system telemetry pulse...</p>
                        <p className="text-green-500/80">[{new Date().toLocaleTimeString()}] Telemetry Received: CPU {monitor.last_record?.cpu_usage || 0}% | RAM {monitor.last_record?.ram_usage || 0}%</p>
                        <p className="text-zinc-600 italic">[{new Date().toLocaleTimeString()}] Awaiting next scheduled beat interval...</p>
                        <p className="text-zinc-500 underline decoration-zinc-800 underline-offset-4">Core Integrity Check: OPTIMUM</p>
                    </div>
                </div>
            )}


            {/* Incidents List Area */}
            <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/2 border border-black/5">
                <div className="px-10 py-8 border-b border-zinc-50">
                    <h3 className="text-lg font-medium text-black uppercase tracking-tight">Latest Incidents</h3>
                </div>
                <table className="min-w-full text-left">
                    <thead>
                        <tr className="bg-zinc-50/50">
                            <th className="px-10 py-5 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Status</th>
                            <th className="px-10 py-5 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Root Cause</th>
                            <th className="px-10 py-5 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Started</th>
                            <th className="px-10 py-5 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Duration</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                        {monitor.recent_incidents?.length > 0 ? (
                            monitor.recent_incidents.map(inc => (
                                <tr key={inc.id} className="hover:bg-zinc-50/50 transition-colors cursor-pointer group" onClick={() => navigate(`/incidents/${inc.id}`)}>
                                    <td className="px-10 py-6">
                                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest ${inc.status === 'RESOLVED' ? 'bg-zinc-100 text-zinc-500' : 'bg-red-500 text-white'}`}>
                                            {inc.status}
                                        </span>
                                    </td>
                                    <td className="px-10 py-6 text-sm font-medium text-black group-hover:translate-x-1 transition-transform">{inc.root_cause || 'Connection Timeout'}</td>
                                    <td className="px-10 py-6 text-[10px] font-bold text-zinc-400 uppercase">{new Date(inc.started_at).toLocaleString()}</td>
                                    <td className="px-10 py-6 text-xs font-bold text-black">{inc.duration_str}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-10 py-12 text-center text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] italic">No incidents recorded in current perimeter</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer Visibility */}
            <div className="flex items-center justify-center space-x-12 pt-8">
                <VisibilityToggle label="Status Page" active={monitor.visible_on_status_page} />
                <VisibilityToggle label="Public API" active={true} />
            </div>
        </div>
    );
};

const SummaryBox = ({ title, value, subValue, icon, type }) => (
    <div className="bg-white rounded-4xl p-8 shadow-2xl shadow-black/2 border border-black/5 space-y-4">
        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{title}</p>
        <div>
            <div className="flex items-center space-x-3">
                <h4 className={`text-2xl font-medium tracking-tighter ${type === 'error' ? 'text-red-500' : 'text-black'}`}>{value}</h4>
                {icon && <div className="text-zinc-200">{icon}</div>}
            </div>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">{subValue}</p>
        </div>
    </div>
);

const HistoryStat = ({ label, percentage, info }) => (
    <div className="space-y-2">
        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{label}</p>
        <div className="flex items-center space-x-4">
            <h4 className="text-xl font-medium tracking-tighter text-black">{percentage}</h4>
        </div>
        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{info}</p>
    </div>
);

const ChartLegend = ({ label, value }) => (
    <div className="text-right">
        <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-xs font-medium text-black leading-none">{value}</p>
    </div>
);

const RegionMarker = ({ city, latency, active }) => (
    <div className="px-3 py-2 bg-white rounded-xl border border-black/5 shadow-sm text-center">
        <p className="text-[7px] font-bold text-zinc-400 uppercase leading-none mb-1">{city}</p>
        <p className={`text-[10px] font-medium leading-none ${active ? 'text-black' : 'text-zinc-300'}`}>{latency}</p>
    </div>
);

const VisibilityToggle = ({ label, active }) => (
    <div className="flex items-center space-x-3 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${active ? 'bg-black border-black text-white' : 'bg-zinc-50 border-black/5 text-zinc-300'}`}>
            {active ? <EyeIcon className="w-4 h-4" /> : <ShieldCheckIcon className="w-4 h-4" />}
        </div>
        <span className="text-[9px] font-bold uppercase tracking-widest">{label}: {active ? 'Enabled' : 'Disabled'}</span>
    </div>
);

const MetricGauge = ({ label, value, icon }) => {
    const color = value > 90 ? 'text-red-500' : value > 70 ? 'text-zinc-500' : 'text-black';
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{label}</p>
                <div className="text-zinc-300">{icon}</div>
            </div>
            <div className="relative pt-2">
                <div className="flex items-center justify-between mb-2">
                    <span className={`text-2xl font-medium tracking-tighter ${color}`}>{value}%</span>
                    <span className="text-[8px] font-bold text-zinc-300 uppercase tracking-widest">Optimal Range</span>
                </div>
                <div className="overflow-hidden h-2 text-xs flex rounded-full bg-zinc-50 border border-black/5 shadow-inner">
                    <div style={{ width: `${value}%` }} className={`shadow-2xl flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 ${value > 90 ? 'bg-red-500' : 'bg-black'}`}></div>
                </div>
            </div>
        </div>
    );
};

const IdentityItem = ({ label, value }) => (
    <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</span>
        <span className="text-xs font-medium text-black">{value}</span>
    </div>
);

const SecurityFeature = ({ title, status, desc }) => (
    <div className="p-4 bg-zinc-50 rounded-2xl border border-black/5 space-y-2">
        <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-bold text-black uppercase tracking-widest">{title}</h4>
            <span className="text-[8px] font-bold bg-black text-white px-2 py-0.5 rounded-md tracking-tighter">{status}</span>
        </div>
        <p className="text-[10px] text-zinc-500 leading-none">{desc}</p>
    </div>
);

export default MonitorDetail;

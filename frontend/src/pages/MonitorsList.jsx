import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMonitors } from '../services/api';
import {
    MagnifyingGlassIcon,
    PlusIcon,
    ArrowPathIcon,
    ChevronRightIcon,
    GlobeAltIcon,
    CommandLineIcon,
    PencilSquareIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../components/Toast';

const MonitorsList = () => {
    const [monitors, setMonitors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const { addToast } = useToast();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getMonitors();
            setMonitors(res.data);
        } catch (error) {
            console.error(error);
            addToast("Failed to fetch monitors", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredMonitors = monitors.filter(m =>
        m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.url?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-5xl font-medium text-black uppercase leading-none tracking-tighter">
                        Network<span className="text-zinc-300">.</span>Pulse
                    </h1>
                    <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-[0.4em]">Managed Monitoring Perimeter</p>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="relative group">
                        <MagnifyingGlassIcon className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black transition-colors" />
                        <input
                            type="text"
                            placeholder="SEARCH NODES..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-zinc-100/50 border border-black/5 rounded-2xl pl-14 pr-6 py-4 text-[10px] font-bold tracking-widest outline-none focus:bg-white focus:ring-2 focus:ring-black transition-all w-64 uppercase"
                        />
                    </div>
                    <button
                        onClick={() => navigate('/monitors/create')}
                        className="bg-black text-white px-8 py-4 rounded-2xl flex items-center space-x-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10 group"
                    >
                        <PlusIcon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Active Pulse</span>
                    </button>
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="p-4 bg-white rounded-2xl border border-black/5 hover:bg-zinc-50 transition-colors disabled:opacity-50"
                    >
                        <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-black/2 border border-black/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                <th className="px-10 py-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status / Name</th>
                                <th className="px-10 py-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Type</th>
                                <th className="px-10 py-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Response</th>
                                <th className="px-10 py-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Uptime (24h)</th>
                                <th className="px-10 py-6"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {filteredMonitors.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-10 py-24 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center mb-6 border border-black/5">
                                                <GlobeAltIcon className="w-10 h-10 text-zinc-200" />
                                            </div>
                                            <p className="text-zinc-600 font-medium uppercase tracking-widest text-[10px]">No active pulses found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredMonitors.map((mon) => (
                                    <tr
                                        key={mon.id}
                                        onClick={() => navigate(`/monitors/${mon.id}`)}
                                        className="hover:bg-zinc-50/50 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-10 py-6">
                                            <div className="flex items-center space-x-6">
                                                <div className="relative">
                                                    <div className={`w-3 h-3 rounded-full ${mon.last_record?.is_up ? 'bg-black' : 'bg-zinc-200'} shadow-sm`}></div>
                                                    {mon.last_record?.is_up && (
                                                        <div className="absolute -inset-1 rounded-full bg-black/10 animate-ping"></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-black tracking-tight">{mon.name}</p>
                                                    <p className="text-[9px] text-zinc-400 font-normal uppercase tracking-widest mt-0.5">{mon.url}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center space-x-2">
                                                {mon.category === 'SSH' ? <CommandLineIcon className="w-4 h-4 text-zinc-400" /> : <GlobeAltIcon className="w-4 h-4 text-zinc-400" />}
                                                <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-[8px] font-bold rounded-md uppercase tracking-wider">
                                                    {mon.monitor_type}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <p className="text-sm font-medium text-black">{mon.last_record?.response_time ? (mon.last_record.response_time * 1000).toFixed(0) : 0}ms</p>
                                            <p className="text-[9px] text-zinc-400 font-medium uppercase mt-0.5">Latency</p>
                                        </td>
                                        <td className="px-10 py-6">
                                            <p className="text-sm font-medium text-black">{mon.uptime_percentage_24h}%</p>
                                            <div className="w-24 h-1 bg-zinc-100 rounded-full mt-2 overflow-hidden">
                                                <div
                                                    className="h-full bg-black rounded-full"
                                                    style={{ width: `${mon.uptime_percentage_24h}%` }}
                                                ></div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="flex items-center justify-end space-x-4">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/monitors/${mon.id}/edit`);
                                                    }}
                                                    className="p-2 bg-zinc-50 hover:bg-black hover:text-white rounded-xl transition-all border border-black/5 group/edit"
                                                    title="Edit Node"
                                                >
                                                    <PencilSquareIcon className="w-4 h-4 text-zinc-400 group-hover/edit:text-white transition-colors" />
                                                </button>
                                                <ChevronRightIcon className="w-5 h-5 text-zinc-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MonitorsList;

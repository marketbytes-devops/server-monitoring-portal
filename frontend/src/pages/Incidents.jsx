import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIncidents } from '../services/api';
import { ShieldExclamationIcon, ArrowPathIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useToast } from '../components/Toast';

const Incidents = () => {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { addToast } = useToast();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getIncidents();
            setIncidents(res.data);
        } catch (e) {
            console.error(e);
            addToast("Failed to fetch incidents.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-4xl font-medium text-black uppercase leading-none tracking-tighter">
                        Incidents<span className="text-zinc-300">.</span>Log
                    </h1>
                    <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-[0.3em]">Network perimeter interruption history</p>
                </div>
                <button
                    onClick={fetchData}
                    disabled={loading}
                    className="flex items-center space-x-2 bg-black text-white px-6 py-3 rounded-2xl font-medium text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-black/10 hover:bg-zinc-800 active:scale-95 transition-all disabled:opacity-50"
                >
                    <ArrowPathIcon className={`w-5 h-5 text-zinc-500 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-black/2 border border-black/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead>
                            <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Monitor</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Root Cause</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Started / Resolved</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Duration</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Visibility</th>
                                <th className="px-8 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {incidents.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-8 py-12 text-center">
                                        <div className="flex flex-col items-center py-12">
                                            <ShieldExclamationIcon className="w-12 h-12 text-zinc-100 mb-2" />
                                            <p className="text-zinc-400 font-medium italic text-xs">No service incidents recorded.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                incidents.map(incident => (
                                    <tr
                                        key={incident.id}
                                        onClick={() => navigate(`/incidents/${incident.id}`)}
                                        className="hover:bg-zinc-50/50 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full border ${incident.status === 'RESOLVED' ? 'bg-zinc-50 text-black border-zinc-200' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                                {incident.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <p className="text-sm font-medium text-black">{incident.monitor_name}</p>
                                            <p className="text-[10px] text-zinc-400 font-medium uppercase mt-0.5">Project Entity</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-[10px] font-mono text-zinc-400 truncate max-w-xs px-3 py-2 bg-zinc-50 rounded-lg group-hover:bg-white transition-colors">
                                                {incident.root_cause || 'Analyzing...'}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <p className="text-[10px] font-bold text-black uppercase">{new Date(incident.started_at).toLocaleString()}</p>
                                            <p className="text-[10px] text-zinc-300 font-bold uppercase mt-1">{incident.resolved_at ? new Date(incident.resolved_at).toLocaleString() : '--:--:--'}</p>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <p className="text-xs font-bold text-black">{incident.duration_str}</p>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <span className="px-2 py-0.5 bg-zinc-100 text-zinc-500 text-[8px] font-bold rounded uppercase tracking-wider">Public</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <ChevronRightIcon className="w-5 h-5 text-zinc-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
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
export default Incidents;

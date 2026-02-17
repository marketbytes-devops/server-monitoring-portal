import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getIncident } from '../services/api';
import {
    ChevronLeftIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    EnvelopeIcon,
    MapPinIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../components/Toast';

const IncidentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [incident, setIncident] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await getIncident(id);
            setIncident(res.data);
        } catch (error) {
            console.error(error);
            addToast("Failed to fetch incident details", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    if (loading) return (
        <div className="flex items-center justify-center min-vh-100 h-[400px]">
            <ArrowPathIcon className="w-10 h-10 text-zinc-200 animate-spin" />
        </div>
    );

    if (!incident) return <div className="text-center py-20 uppercase font-bold tracking-widest">Incident data not found</div>;

    const isResolved = incident.status === 'RESOLVED';

    return (
        <div className="max-w-full mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Simple Top Back */}
            <div>
                <button
                    onClick={() => navigate(-1)}
                    className="group flex items-center space-x-2 text-zinc-400 hover:text-black transition-colors"
                >
                    <ChevronLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Return to node pulse</span>
                </button>
            </div>

            {/* Premium Header */}
            <div className="space-y-6">
                <h1 className="text-5xl font-medium text-black uppercase tracking-tighter leading-tight">
                    {isResolved ? 'Resolved incident' : 'Active critical incident'} on <br />
                    <span className="text-zinc-400">{incident.monitor_name}</span>
                </h1>
                <div className="flex items-center space-x-6">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.4em]">HTTP/S monitor for {incident.monitor?.url || 'Synchronized URL'}</p>
                    <div className="h-px w-20 bg-zinc-100"></div>
                </div>
            </div>

            {/* Quick Summary Grid */}
            <div className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-black/2 border border-black/5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Root cause</p>
                        <p className="text-lg font-medium text-black leading-tight">{incident.root_cause || 'Connection Timeout'}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status</p>
                        <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${isResolved ? 'bg-black' : 'bg-red-500 animate-pulse'}`}></div>
                            <p className="text-lg font-medium text-black uppercase tracking-tight">{incident.status}</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Started at</p>
                        <p className="text-lg font-medium text-black leading-tight">{new Date(incident.started_at).toLocaleDateString()}<br /><span className="text-xs text-zinc-400">{new Date(incident.started_at).toLocaleTimeString()}</span></p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Duration</p>
                        <p className="text-lg font-medium text-black leading-tight">{incident.duration_str}</p>
                    </div>
                </div>
                {isResolved && incident.resolved_at && (
                    <div className="mt-12 pt-12 border-t border-zinc-50">
                        <div className="flex items-center space-x-4">
                            <CheckCircleIcon className="w-6 h-6 text-black" />
                            <p className="text-sm font-medium text-zinc-600">Incident was resolved at <span className="text-black font-bold uppercase tracking-tight">{new Date(incident.resolved_at).toLocaleString()}</span></p>
                        </div>
                    </div>
                )}
            </div>

            {/* Detailed Activity Log */}
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-medium text-black uppercase tracking-tight">Activity Log<span className="text-zinc-300">.</span>Pulse</h2>
                    <div className="flex items-center space-x-2 bg-zinc-50 px-4 py-1.5 rounded-xl border border-black/5">
                        <div className="w-2 h-2 rounded-full bg-black"></div>
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Real-time sync</span>
                    </div>
                </div>

                <div className="space-y-1">
                    {incident.activities && incident.activities.length > 0 ? (
                        incident.activities.map((log, idx) => (
                            <ActivityLogItem
                                key={log.id}
                                title={log.message}
                                timestamp={new Date(log.timestamp).toLocaleString()}
                                type={log.log_type}
                                isFirst={idx === 0}
                                isLast={idx === incident.activities.length - 1}
                            />
                        ))
                    ) : (
                        <div className="bg-zinc-50 rounded-4xl p-12 text-center border border-black/5 opacity-50">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Awaiting system pulse logs...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ActivityLogItem = ({ title, timestamp, type, result, isFirst, isLast }) => {
    const getIcon = () => {
        switch (type) {
            case 'SUCCESS': return <CheckCircleIcon className="w-5 h-5 text-white" />;
            case 'ERROR': return <ExclamationCircleIcon className="w-5 h-5 text-red-500" />;
            case 'INFO': return <EnvelopeIcon className="w-5 h-5 text-zinc-300" />;
            default: return <InformationCircleIcon className="w-5 h-5 text-zinc-200" />;
        }
    };

    return (
        <div className="flex items-start group">
            <div className="flex flex-col items-center mr-10 relative">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center z-10 transition-all duration-500 border ${type === 'SUCCESS' ? 'bg-black border-black shadow-lg shadow-black/10' : 'bg-white border-black/5 group-hover:scale-110'}`}>
                    {getIcon()}
                </div>
                {!isLast && <div className="w-px h-full bg-zinc-100 absolute top-10 bottom-0"></div>}
            </div>
            <div className="flex-1 py-1 pb-12">
                <div className="flex items-center justify-between mb-2">
                    <h4 className={`text-sm font-medium tracking-tight ${type === 'SUCCESS' ? 'text-black' : 'text-zinc-700'}`}>{title}</h4>
                    {result && (
                        <span className="px-2 py-0.5 bg-zinc-50 border border-zinc-100 rounded text-[7px] font-bold text-zinc-400 uppercase tracking-widest">{result}</span>
                    )}
                </div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{timestamp}</p>
            </div>
        </div>
    );
};

export default IncidentDetail;

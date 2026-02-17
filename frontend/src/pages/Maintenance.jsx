import React, { useState, useEffect } from 'react';
import {
    WrenchScrewdriverIcon,
    PlusIcon,
    CalendarIcon,
    ClockIcon,
    ChevronRightIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../components/Toast';
import { getAuth } from '../services/auth';
import { getMaintenanceWindows } from '../services/api';

const Maintenance = () => {
    const { addToast } = useToast();
    const [auth, setAuth] = useState(getAuth());
    const [windows, setWindows] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await getMaintenanceWindows();
            setWindows(res.data);
        } catch (error) {
            console.error(error);
            addToast("Failed to fetch maintenance windows", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setAuth(getAuth());
        fetchData();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-4xl font-medium text-black uppercase leading-none tracking-tighter">
                        Maintenance<span className="text-zinc-300">.</span>Windows
                    </h1>
                    <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-[0.3em]">Scheduled operational pauses</p>
                </div>
                {auth.permissions.can_create && (
                    <button
                        onClick={() => addToast("Maintenance window scheduling initialized.", "info")}
                        className="flex items-center space-x-3 bg-black text-white px-8 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-black/10 hover:bg-zinc-800 active:scale-95 transition-all"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>Plan Window</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    {windows.length === 0 ? (
                        <div className="bg-white rounded-[2.5rem] p-24 shadow-2xl shadow-black/2 border border-black/5 flex flex-col items-center justify-center text-center space-y-8 min-h-[500px]">
                            <div className="w-24 h-24 bg-zinc-50 rounded-4xl flex items-center justify-center border border-black/5 mb-2">
                                <WrenchScrewdriverIcon className="w-10 h-10 text-zinc-200" />
                            </div>
                            <div className="max-w-md">
                                <h2 className="text-2xl font-medium text-black uppercase tracking-tighter">No Scheduled Maintenance</h2>
                                <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-[0.2em] mt-3 leading-loose">
                                    Schedule maintenance windows to suppress alerts and maintain synchronized transparency during planned system upgrades.
                                </p>
                            </div>
                        </div>
                    ) : (
                        windows.map(window => (
                            <div key={window.id} className="bg-white rounded-4xl p-8 shadow-2xl shadow-black/2 border border-black/5 flex items-center justify-between group cursor-pointer hover:border-black/10 transition-all">
                                <div className="flex items-center space-x-6">
                                    <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center border border-black/5">
                                        <CalendarIcon className="w-6 h-6 text-black" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-black uppercase tracking-tight">{window.title}</h3>
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{window.date} // {window.duration}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-6">
                                    <span className="px-3 py-1 bg-zinc-100 text-zinc-500 text-[8px] font-bold rounded-lg uppercase tracking-widest">Upcoming</span>
                                    <ChevronRightIcon className="w-5 h-5 text-zinc-200 group-hover:text-black group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-zinc-50 rounded-[2.5rem] p-10 border border-black/5 space-y-8">
                        <div>
                            <h3 className="text-xl font-medium text-black uppercase tracking-tight mb-2">Operational</h3>
                            <p className="text-[10px] text-zinc-400 font-normal uppercase tracking-[0.2em]">Strategy & Planning</p>
                        </div>

                        <div className="space-y-6">
                            <SidebarItem icon={<ClockIcon className="w-5 h-5" />} title="Alert Suppression" desc="Silence notifications during maintenance." />
                            <SidebarItem icon={<ExclamationCircleIcon className="w-5 h-5" />} title="Uptime Padding" desc="Prevent maintenance from affecting statistics." />
                        </div>
                    </div>

                    <div className="bg-black rounded-[2.5rem] p-10 shadow-2xl border border-white/5">
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.3em] mb-4 text-center">System Integrity</p>
                        <h4 className="text-xl font-medium text-white uppercase text-center tracking-tight">Zero Delta<br />Environment</h4>
                        <div className="mt-8 flex justify-center">
                            <div className="w-16 h-16 rounded-full border-4 border-white/10 flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full bg-white animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SidebarItem = ({ icon, title, desc }) => (
    <div className="flex items-start space-x-4">
        <div className="p-3 bg-white rounded-xl border border-black/5 text-black">
            {icon}
        </div>
        <div>
            <h4 className="text-[11px] font-bold text-black uppercase tracking-widest">{title}</h4>
            <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">{desc}</p>
        </div>
    </div>
);

export default Maintenance;

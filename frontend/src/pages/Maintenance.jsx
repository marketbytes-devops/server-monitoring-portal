import React, { useState, useEffect } from 'react';
import {
    WrenchScrewdriverIcon,
    PlusIcon,
    CalendarIcon,
    ClockIcon,
    ChevronRightIcon,
    ExclamationCircleIcon,
    TrashIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../components/Toast';
import { getAuth } from '../services/auth';
import { getMaintenanceWindows, createMaintenanceWindow, deleteMaintenanceWindow, getMonitors } from '../services/api';
import CustomSelect from '../components/CustomSelect';
import CustomDateTimePicker from '../components/CustomDateTimePicker';

const Maintenance = () => {
    const { addToast } = useToast();
    const [auth, setAuth] = useState(getAuth());
    const [windows, setWindows] = useState([]);
    const [monitors, setMonitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [formData, setFormData] = useState({
        monitor: '',
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        is_active: true
    });

    const fetchData = async () => {
        try {
            const [windowsRes, monitorsRes] = await Promise.all([
                getMaintenanceWindows(),
                getMonitors()
            ]);
            setWindows(windowsRes.data);
            setMonitors(monitorsRes.data);
        } catch (error) {
            console.error(error);
            addToast("Failed to fetch maintenance data", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setAuth(getAuth());
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.monitor || !formData.start_time || !formData.end_time) {
            addToast("Please complete all required fields", "warning");
            return;
        }
        try {
            await createMaintenanceWindow(formData);
            addToast("Maintenance window scheduled successfully.", "success");
            setShowAdd(false);
            setFormData({
                monitor: '',
                title: '',
                description: '',
                start_time: '',
                end_time: '',
                is_active: true
            });
            fetchData();
        } catch (error) {
            console.error(error);
            addToast("Failed to schedule maintenance window.", "error");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Permanently cancel this maintenance window?")) return;
        try {
            await deleteMaintenanceWindow(id);
            setWindows(windows.filter(w => w.id !== id));
            addToast("Maintenance window removed.", "info");
        } catch (error) {
            console.error(error);
            addToast("Failed to remove window.", "error");
        }
    };

    const monitorOptions = monitors.map(m => ({ value: m.id, label: m.name }));

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
                        onClick={() => setShowAdd(!showAdd)}
                        className="flex items-center space-x-3 bg-black text-white px-8 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-black/10 hover:bg-zinc-800 active:scale-95 transition-all"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>{showAdd ? 'Cancel Plan' : 'Plan Window'}</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className={`${showAdd ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
                    {loading ? (
                        <div className="flex items-center justify-center min-h-[500px]">
                            <ArrowPathIcon className="w-10 h-10 text-zinc-200 animate-spin" />
                        </div>
                    ) : windows.length === 0 ? (
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
                            <div key={window.id} className="bg-white rounded-4xl p-8 shadow-2xl shadow-black/2 border border-black/5 flex items-center justify-between group hover:border-black/10 transition-all">
                                <div className="flex items-center space-x-6">
                                    <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center border border-black/5">
                                        <CalendarIcon className="w-6 h-6 text-black" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-black uppercase tracking-tight">{window.title}</h3>
                                        <div className="flex items-center space-x-3 mt-1">
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">
                                                {window.monitor_name} // {new Date(window.start_time).toLocaleString()}
                                            </p>
                                            <span className="text-xs text-zinc-300">→</span>
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">
                                                {new Date(window.end_time).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-6">
                                    <span className={`px-3 py-1 text-[8px] font-bold rounded-lg uppercase tracking-widest ${new Date(window.end_time) < new Date() ? 'bg-zinc-100 text-zinc-400' : 'bg-black text-white'}`}>
                                        {new Date(window.end_time) < new Date() ? 'Completed' : 'Upcoming'}
                                    </span>
                                    {auth.permissions.can_delete && (
                                        <button
                                            onClick={() => handleDelete(window.id)}
                                            className="p-3 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Create Form Section */}
                {showAdd && (
                    <div className="animate-in slide-in-from-right-8 duration-700">
                        <div className="bg-black rounded-[2.5rem] p-10 shadow-2xl border border-white/5 space-y-8 sticky top-8">
                            <div>
                                <h2 className="text-3xl font-medium text-white uppercase tracking-tight">Schedule Window</h2>
                                <p className="text-[10px] text-zinc-500 font-normal uppercase tracking-[0.2em] mt-1">Operational Pulse Pause</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-1">Window Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:bg-white focus:text-black outline-none transition-all"
                                        placeholder="e.g. Database Migration"
                                    />
                                </div>

                                <CustomSelect
                                    label="Target Pulse Node"
                                    options={[{ value: '', label: 'Select Node' }, ...monitorOptions]}
                                    value={formData.monitor}
                                    onChange={(e) => setFormData({ ...formData, monitor: e.target.value })}
                                    name="monitor"
                                    dark
                                />

                                <div className="grid grid-cols-1 gap-6">
                                    <CustomDateTimePicker
                                        label="Start Time"
                                        name="start_time"
                                        value={formData.start_time}
                                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                        dark
                                    />
                                    <CustomDateTimePicker
                                        label="End Time"
                                        name="end_time"
                                        value={formData.end_time}
                                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                        dark
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-1">Internal Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:bg-white focus:text-black outline-none transition-all h-24 scrollbar-hide"
                                        placeholder="Reason for operational pause..."
                                    />
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="w-full bg-white text-black py-5 rounded-2xl font-bold text-[11px] uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5"
                                    >
                                        Initialize Deployment
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Sidebar Info */}
                {!showAdd && (
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
                )}
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
            <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed lowercase">{desc}</p>
        </div>
    </div>
);

export default Maintenance;



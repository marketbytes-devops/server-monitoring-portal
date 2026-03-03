import React, { useState, useEffect } from 'react';
import {
    SignalIcon,
    PlusIcon,
    GlobeAltIcon,
    LinkIcon,
    ChevronRightIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../components/Toast';
import { getAuth } from '../services/auth';
import { getStatusPages, createStatusPage, deleteStatusPage, getMonitors } from '../services/api';
import { TrashIcon } from '@heroicons/react/24/outline';

const StatusPages = () => {
    const { addToast } = useToast();
    const [auth, setAuth] = useState(getAuth());
    const [pages, setPages] = useState([]);
    const [monitors, setMonitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [formData, setFormData] = useState({ name: '', slug: '', monitors: [], is_public: true });

    const fetchData = async () => {
        try {
            const [pagesRes, monitorsRes] = await Promise.all([getStatusPages(), getMonitors()]);
            setPages(pagesRes.data);
            setMonitors(monitorsRes.data);
        } catch (error) {
            console.error(error);
            addToast("Failed to fetch data", "error");
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
        try {
            await createStatusPage(formData);
            addToast("Status Page deployed successfully", "success");
            setShowAdd(false);
            setFormData({ name: '', slug: '', monitors: [], is_public: true });
            fetchData();
        } catch (error) {
            addToast("Failed to deploy status page", "error");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this status page?")) return;
        try {
            await deleteStatusPage(id);
            setPages(pages.filter(p => p.id !== id));
            addToast("Status page removed", "info");
        } catch (error) {
            addToast("Failed to remove page", "error");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-4xl font-medium text-black uppercase leading-none tracking-tighter">
                        Status<span className="text-zinc-300">.</span>Pages
                    </h1>
                    <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-[0.3em]">Public transparency interfaces</p>
                </div>
                {auth.permissions.can_create && (
                    <button
                        onClick={() => setShowAdd(!showAdd)}
                        className="flex items-center space-x-3 bg-black text-white px-8 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-black/10 hover:bg-zinc-800 active:scale-95 transition-all"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>{showAdd ? 'Cancel Deployment' : 'Create Public View'}</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className={`${showAdd ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
                    {pages.length === 0 ? (
                        <div className="bg-white rounded-[2.5rem] p-24 shadow-2xl shadow-black/2 border border-black/5 flex flex-col items-center justify-center text-center space-y-8">
                            <div className="w-24 h-24 bg-zinc-50 rounded-4xl flex items-center justify-center border border-black/5">
                                <SignalIcon className="w-10 h-10 text-zinc-200" />
                            </div>
                            <div className="max-w-md">
                                <h2 className="text-2xl font-medium text-black uppercase tracking-tighter">No Active Status Pages</h2>
                                <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-[0.2em] mt-3 leading-loose">
                                    Deploy public status pages to keep your clients synchronized with your system's operational health in real-time.
                                </p>
                            </div>
                        </div>
                    ) : (
                        pages.map(page => (
                            <div key={page.id} className="bg-white rounded-4xl p-8 shadow-2xl shadow-black/2 border border-black/5 flex items-center justify-between group hover:border-black/10 transition-all">
                                <div className="flex items-center space-x-6">
                                    <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center border border-black/5">
                                        <GlobeAltIcon className="w-6 h-6 text-black" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-black uppercase tracking-tight">{page.name}</h3>
                                        <div className="flex items-center space-x-4">
                                            <a
                                                href={`/status/${page.slug}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center space-x-2 text-zinc-400 hover:text-black transition-colors"
                                            >
                                                <LinkIcon className="w-3 h-3" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">{page.slug}</span>
                                            </a>
                                            <span className="text-[10px] text-zinc-300 uppercase font-bold tracking-widest">
                                                • {page.monitors?.length || 0} Monitors
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={() => handleDelete(page.id)}
                                        className="p-3 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                    <ChevronRightIcon className="w-5 h-5 text-zinc-200 group-hover:text-black group-hover:translate-x-1 transition-all" />
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
                                <h3 className="text-2xl font-medium text-white uppercase tracking-tight">Deploy Interface</h3>
                                <p className="text-[10px] text-zinc-500 font-normal uppercase tracking-[0.2em] mt-1">Status Page Parameters</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-1">Page Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:bg-white focus:text-black outline-none transition-all"
                                        placeholder="e.g. Public Infrastructure"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-1">URL Slug</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:bg-white focus:text-black outline-none transition-all"
                                        placeholder="public-status"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-1">Select Monitors</label>
                                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2 no-scrollbar">
                                        {monitors.map(mon => (
                                            <label key={mon.id} className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.monitors.includes(mon.id)}
                                                    onChange={(e) => {
                                                        const newMonitors = e.target.checked
                                                            ? [...formData.monitors, mon.id]
                                                            : formData.monitors.filter(id => id !== mon.id);
                                                        setFormData({ ...formData, monitors: newMonitors });
                                                    }}
                                                    className="w-4 h-4 rounded border-white/10 bg-transparent text-white focus:ring-0"
                                                />
                                                <span className="text-xs text-zinc-400 font-medium">{mon.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="w-full bg-white text-black py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5"
                                    >
                                        Initialize Deployment
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Info Sidebar (only shown if not adding for better layout) */}
                {!showAdd && (
                    <div className="space-y-6">
                        <div className="bg-black rounded-[2.5rem] p-10 shadow-2xl border border-white/5 space-y-8">
                            <div>
                                <h3 className="text-xl font-medium text-white uppercase tracking-tight mb-2">Transparency</h3>
                                <p className="text-[10px] text-zinc-500 font-normal uppercase tracking-[0.2em]">Build Customer Trust</p>
                            </div>

                            <div className="space-y-6">
                                <FeatureItem icon={<ShieldCheckIcon className="w-5 h-5" />} title="Verified Uptime" desc="Third-party audit of your systems." />
                                <SignalIcon className="hidden" /> {/* Keep icon logic if needed */}
                                <FeatureItem icon={<SignalIcon className="w-5 h-5" />} title="Live Timeline" desc="Automatic incident reporting." />
                            </div>

                            <div className="pt-12 border-t border-white/10">
                                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-4">Availability</p>
                                <div className="flex items-center space-x-4">
                                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-white w-[99.9%] rounded-full shadow-[0_0_10px_rgba(255,255,255,0.3)]"></div>
                                    </div>
                                    <span className="text-[10px] font-bold text-white uppercase">99.9%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const FeatureItem = ({ icon, title, desc }) => (
    <div className="flex items-start space-x-4">
        <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-white">
            {icon}
        </div>
        <div>
            <h4 className="text-[11px] font-bold text-white uppercase tracking-widest">{title}</h4>
            <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed lowercase">{desc}</p>
        </div>
    </div>
);

export default StatusPages;

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
import { getStatusPages } from '../services/api';

const StatusPages = () => {
    const { addToast } = useToast();
    const [auth, setAuth] = useState(getAuth());
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await getStatusPages();
            setPages(res.data);
        } catch (error) {
            console.error(error);
            addToast("Failed to fetch status pages", "error");
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
                        Status<span className="text-zinc-300">.</span>Pages
                    </h1>
                    <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-[0.3em]">Public transparency interfaces</p>
                </div>
                {auth.permissions.can_create && (
                    <button
                        onClick={() => addToast("Status Page deployment initialized.", "success")}
                        className="flex items-center space-x-3 bg-black text-white px-8 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-black/10 hover:bg-zinc-800 active:scale-95 transition-all"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>Create Public View</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
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
                            <div key={page.id} className="bg-white rounded-4xl p-8 shadow-2xl shadow-black/2 border border-black/5 flex items-center justify-between group cursor-pointer hover:border-black/10 transition-all">
                                <div className="flex items-center space-x-6">
                                    <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center border border-black/5">
                                        <GlobeAltIcon className="w-6 h-6 text-black" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-black uppercase tracking-tight">{page.name}</h3>
                                        <div className="flex items-center space-x-2 text-zinc-400">
                                            <LinkIcon className="w-3 h-3" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{page.slug}.status.io</span>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRightIcon className="w-5 h-5 text-zinc-200 group-hover:text-black group-hover:translate-x-1 transition-all" />
                            </div>
                        ))
                    )}
                </div>

                {/* Info Sidebar */}
                <div className="space-y-6">
                    <div className="bg-black rounded-[2.5rem] p-10 shadow-2xl border border-white/5 space-y-8">
                        <div>
                            <h3 className="text-xl font-medium text-white uppercase tracking-tight mb-2">Transparency</h3>
                            <p className="text-[10px] text-zinc-500 font-normal uppercase tracking-[0.2em]">Build Customer Trust</p>
                        </div>

                        <div className="space-y-6">
                            <FeatureItem icon={<ShieldCheckIcon className="w-5 h-5" />} title="Verified Uptime" desc="Third-party audit of your systems." />
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

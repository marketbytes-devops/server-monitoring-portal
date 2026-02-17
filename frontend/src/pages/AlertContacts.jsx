import React, { useState, useEffect } from 'react';
import {
    TrashIcon,
    EnvelopeIcon,
    GlobeAltIcon,
    ArrowPathIcon,
    PlusIcon,
    ChatBubbleLeftRightIcon,
    HashtagIcon
} from '@heroicons/react/24/outline';
import { getAlertContacts, deleteAlertContact, createAlertContact } from '../services/api';
import { useToast } from '../components/Toast';
import { getAuth } from '../services/auth';
import CustomSelect from '../components/CustomSelect';

const AlertContacts = () => {
    const { addToast } = useToast();
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [newContact, setNewContact] = useState({ name: '', contact_type: 'EMAIL', value: '' });
    const auth = getAuth();

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const res = await getAlertContacts();
            setContacts(res.data);
        } catch (error) {
            console.error(error);
            addToast("Failed to fetch contacts.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await createAlertContact(newContact);
            addToast("New contact synchronized successfully.", "success");
            setShowAdd(false);
            setNewContact({ name: '', contact_type: 'EMAIL', value: '' });
            fetchContacts();
        } catch (error) {
            addToast("Failed to synchronize contact.", "error");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Disconnect this contact synchronization?")) return;
        try {
            await deleteAlertContact(id);
            setContacts(prev => prev.filter(c => c.id !== id));
            addToast("Contact removed from synchronized list.", "info");
        } catch (error) {
            addToast("Failed to remove contact.", "error");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-4xl font-medium text-black uppercase leading-none tracking-tighter">
                        Alert<span className="text-zinc-300">.</span>Contacts
                    </h1>
                    <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-[0.3em]">Notification endpoints for system pulses</p>
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={fetchContacts}
                        disabled={loading}
                        className="p-3 hover:bg-zinc-50 rounded-2xl transition-all"
                    >
                        <ArrowPathIcon className={`w-5 h-5 text-zinc-300 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    {auth.permissions.can_create && (
                        <button
                            onClick={() => setShowAdd(!showAdd)}
                            className="flex items-center space-x-3 bg-black text-white px-8 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-black/10 hover:bg-zinc-800 active:scale-95 transition-all"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span>Synchronize New Contact</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Contacts List */}
                <div className={`transition-all duration-700 ${showAdd ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-black/2 border border-black/5 overflow-hidden">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                    <th className="px-10 py-6 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Entity</th>
                                    <th className="px-10 py-6 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Protocol</th>
                                    <th className="px-10 py-6 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Endpoint</th>
                                    <th className="px-10 py-6 text-right text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {contacts.length === 0 && !loading ? (
                                    <tr>
                                        <td colSpan="4" className="px-10 py-24 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mb-4 border border-black/5">
                                                    <ChatBubbleLeftRightIcon className="w-8 h-8 text-zinc-200" />
                                                </div>
                                                <p className="text-zinc-600 font-medium uppercase tracking-widest text-[9px]">No synchronized contacts</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    contacts.map(contact => (
                                        <tr key={contact.id} className="hover:bg-zinc-50/50 transition-colors group">
                                            <td className="px-10 py-6 whitespace-nowrap">
                                                <div className="flex items-center group-hover:translate-x-1 transition-transform">
                                                    <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center mr-4 group-hover:bg-white transition-colors border border-black/5">
                                                        {getIcon(contact.contact_type)}
                                                    </div>
                                                    <p className="text-sm font-medium text-black">{contact.name}</p>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 whitespace-nowrap">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{contact.contact_type}</span>
                                            </td>
                                            <td className="px-10 py-6 whitespace-nowrap">
                                                <p className="text-[11px] font-mono text-zinc-500 truncate max-w-[250px] bg-zinc-50 px-3 py-1.5 rounded-lg">{contact.value}</p>
                                            </td>
                                            <td className="px-10 py-6 whitespace-nowrap text-right">
                                                {auth.permissions.can_delete && (
                                                    <button
                                                        onClick={() => handleDelete(contact.id)}
                                                        className="p-3 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add Contact Panel */}
                {showAdd && (
                    <div className="animate-in slide-in-from-right-8 duration-700">
                        <div className="bg-black rounded-[2.5rem] p-10 shadow-2xl border border-white/5 space-y-8 sticky top-8">
                            <div>
                                <h3 className="text-2xl font-medium text-white uppercase tracking-tight">Configuration</h3>
                                <p className="text-[10px] text-zinc-500 font-normal uppercase tracking-[0.2em] mt-1">New Sync Protocol</p>
                            </div>

                            <form onSubmit={handleAdd} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-1">Friendly Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newContact.name}
                                        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:bg-white focus:text-black outline-none transition-all"
                                        placeholder="e.g. DevOps On-Call"
                                    />
                                </div>

                                <CustomSelect
                                    label="Protocol Type"
                                    name="contact_type"
                                    value={newContact.contact_type}
                                    onChange={(e) => setNewContact({ ...newContact, contact_type: e.target.value })}
                                    dark
                                    options={[
                                        { value: 'EMAIL', label: 'Email Address' },
                                        { value: 'WEBHOOK', label: 'Webhook URL' },
                                        { value: 'SLACK', label: 'Slack Channel' },
                                        { value: 'DISCORD', label: 'Discord Bot' }
                                    ]}
                                />

                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-1">Endpoint Value</label>
                                    <input
                                        type="text"
                                        required
                                        value={newContact.value}
                                        onChange={(e) => setNewContact({ ...newContact, value: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:bg-white focus:text-black outline-none transition-all"
                                        placeholder={newContact.contact_type === 'EMAIL' ? 'name@domain.com' : 'https://hooks.com/...'}
                                    />
                                </div>

                                <div className="pt-4 flex items-center space-x-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-white text-black py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5"
                                    >
                                        Initialize Sync
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAdd(false)}
                                        className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const getIcon = (type) => {
    switch (type) {
        case 'EMAIL': return <EnvelopeIcon className="w-5 h-5 text-black" />;
        case 'WEBHOOK': return <GlobeAltIcon className="w-5 h-5 text-black" />;
        case 'SLACK': return <ChatBubbleLeftRightIcon className="w-5 h-5 text-black" />;
        case 'DISCORD': return <HashtagIcon className="w-5 h-5 text-black" />;
        default: return <EnvelopeIcon className="w-5 h-5 text-black" />;
    }
};

export default AlertContacts;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createMonitor, updateMonitor, getMonitor, getAlertContacts } from '../services/api';
import { useToast } from '../components/Toast';
import {
    GlobeAltIcon,
    CommandLineIcon,
    ChevronLeftIcon,
    ShieldCheckIcon,
    BellAlertIcon,
    KeyIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import CustomSelect from '../components/CustomSelect';

const CreateMonitor = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState('SITES');
    const [loading, setLoading] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        category: 'SITES',
        monitor_type: 'HTTP',
        name: '',
        url: '',
        interval: 5,
        dns_monitoring: false,
        check_ssl_errors: false,
        check_ssl_expiry: true,
        check_domain_expiry: false,
        check_http_status: true,
        notify_email: true,
        notify_phone: false,
        visible_on_status_page: true,
        alert_contacts: [],
        team_assignment: 'Superadmin',
        ssh_username: 'root',
        ssh_key: '',
        ssh_password: ''
    });

    const [contacts, setContacts] = useState([]);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const res = await getAlertContacts();
                setContacts(res.data);
            } catch (error) {
                console.error("Failed to fetch contacts", error);
            }
        };

        const fetchMonitor = async () => {
            if (isEdit) {
                try {
                    const res = await getMonitor(id);
                    const data = res.data;
                    setFormData({
                        category: data.category,
                        monitor_type: data.monitor_type,
                        name: data.name,
                        url: data.url,
                        interval: data.interval,
                        dns_monitoring: data.dns_monitoring,
                        check_ssl_errors: data.check_ssl_errors,
                        check_ssl_expiry: data.check_ssl_expiry,
                        check_domain_expiry: data.check_domain_expiry,
                        check_http_status: true, // Assuming this as default or fetch if available
                        notify_email: data.notify_email,
                        notify_phone: data.notify_phone,
                        visible_on_status_page: data.visible_on_status_page,
                        alert_contacts: data.alert_contacts || []
                    });
                    setActiveTab(data.category);
                } catch (error) {
                    addToast("Failed to fetch node data", "error");
                }
            }
        };

        fetchContacts();
        fetchMonitor();
    }, [id, isEdit]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setFormData(prev => ({ ...prev, category: tab, monitor_type: tab === 'SITES' ? 'HTTP' : 'SSH' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEdit) {
                await updateMonitor(id, formData);
                addToast("Pulse node updated successfully", "success");
            } else {
                await createMonitor(formData);
                addToast("Pulse node activated successfully", "success");
            }
            navigate('/monitors');
        } catch (error) {
            console.error(error);
            addToast(isEdit ? "Failed to update pulse node" : "Failed to initialize pulse node", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-full mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="group flex items-center space-x-2 text-zinc-500 hover:text-black transition-colors"
                >
                    <ChevronLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Return to perimeter</span>
                </button>
                <div className="text-right">
                    <h1 className="text-4xl font-medium text-black uppercase tracking-tighter">
                        {isEdit ? 'Coordinate' : 'Active'}<span className="text-zinc-300">.</span>Pulse
                    </h1>
                    <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-[0.3em]">{isEdit ? 'Re-synchronize node parameters' : 'Initialize synchronized network node'}</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex p-1 bg-zinc-100/50 rounded-2xl w-fit">
                <button
                    onClick={() => handleTabChange('SITES')}
                    className={`flex items-center space-x-2 px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-500 ${activeTab === 'SITES' ? 'bg-black text-white shadow-xl' : 'text-zinc-400 hover:text-black'}`}
                >
                    <GlobeAltIcon className="w-4 h-4" />
                    <span>Sites Monitoring</span>
                </button>
                <button
                    onClick={() => handleTabChange('SSH')}
                    className={`flex items-center space-x-2 px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-500 ${activeTab === 'SSH' ? 'bg-black text-white shadow-xl' : 'text-zinc-400 hover:text-black'}`}
                >
                    <CommandLineIcon className="w-4 h-4" />
                    <span>SSH Perimeter</span>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {activeTab === 'SITES' ? (
                    /* SITES CONFIGURATION */
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-black/2 border border-black/5 space-y-10">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-medium text-black uppercase tracking-tight">Configuration</h2>
                                <p className="text-[10px] text-zinc-500 font-normal uppercase tracking-[0.2em] mt-1">Secondary Endpoint Mapping</p>
                            </div>
                            <div className="p-4 bg-zinc-50 rounded-2xl border border-black/5">
                                <GlobeAltIcon className="w-6 h-6 text-black" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <CustomSelect
                                label="Monitor Class"
                                name="monitor_type"
                                value={formData.monitor_type}
                                onChange={handleChange}
                                options={[
                                    { value: 'HTTP', label: 'HTTP(s)' },
                                    { value: 'KEYWORD', label: 'Keyword Match' },
                                    { value: 'PING', label: 'Ping' },
                                    { value: 'PORT', label: 'Port' },
                                    { value: 'CRON', label: 'Cron Job' },
                                    { value: 'API', label: 'API Monitoring' }
                                ]}
                            />

                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Project / Website Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. SakiVisa Portal"
                                    className="w-full bg-zinc-50 border border-black/5 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-black outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-3 md:col-span-2">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">URL / IP Address</label>
                                <input
                                    type="text"
                                    name="url"
                                    required
                                    value={formData.url}
                                    onChange={handleChange}
                                    placeholder="https://sakivisa.com or 104.21.75.11"
                                    className="w-full bg-zinc-50 border border-black/5 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-black outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Beat Interval (min)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="interval"
                                        min="1"
                                        value={formData.interval}
                                        onChange={handleChange}
                                        className="w-full bg-zinc-50 border border-black/5 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-black outline-none transition-all"
                                    />
                                    <ClockIcon className="w-5 h-5 absolute right-6 top-1/2 -translate-y-1/2 text-zinc-300" />
                                </div>
                            </div>

                            <CustomSelect
                                label="Team Assignment"
                                name="team_assignment"
                                value={formData.team_assignment}
                                options={[
                                    { value: 'Superadmin', label: 'Superadmin' },
                                    { value: 'User', label: 'User' }
                                ]}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                ) : (
                    /* SSH CONFIGURATION */
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-black/2 border border-black/5 space-y-10">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-medium text-black uppercase tracking-tight">SSH Perimeter</h2>
                                <p className="text-[10px] text-zinc-500 font-normal uppercase tracking-[0.2em] mt-1">Encrypted Node Access</p>
                            </div>
                            <div className="p-4 bg-zinc-50 rounded-2xl border border-black/5">
                                <CommandLineIcon className="w-6 h-6 text-black" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Host / IP Address</label>
                                <input
                                    type="text"
                                    name="url"
                                    required
                                    value={formData.url}
                                    onChange={handleChange}
                                    placeholder="e.g. 157.90.156.63"
                                    className="w-full bg-zinc-50 border border-black/5 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-black outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">SSH Username</label>
                                <input
                                    type="text"
                                    name="ssh_username"
                                    required
                                    value={formData.ssh_username}
                                    onChange={handleChange}
                                    placeholder="e.g. root or ubuntu"
                                    className="w-full bg-zinc-50 border border-black/5 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-black outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-3 md:col-span-2">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">SSH Private Key (OpenSSH Format)</label>
                                <textarea
                                    name="ssh_key"
                                    required
                                    rows="6"
                                    value={formData.ssh_key}
                                    onChange={handleChange}
                                    placeholder="-----BEGIN OPENSSH PRIVATE KEY-----&#10;..."
                                    className="w-full bg-zinc-50 border border-black/5 rounded-2xl px-6 py-4 text-sm font-mono focus:ring-2 focus:ring-black outline-none transition-all resize-none"
                                ></textarea>
                            </div>
                        </div>
                    </div>
                )}

                {/* Shared Advanced Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-black/2 border border-black/5 space-y-8">
                        <div className="flex items-center space-x-4 mb-2">
                            <div className="p-3 bg-zinc-50 rounded-xl border border-black/5">
                                <ShieldCheckIcon className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-medium uppercase tracking-tight">Perimeter Checks</h3>
                        </div>

                        <div className="space-y-5">
                            <Toggle label="DNS Monitoring" name="dns_monitoring" checked={formData.dns_monitoring} onChange={handleChange} />
                            <Toggle label="Check SSL Errors" name="check_ssl_errors" checked={formData.check_ssl_errors} onChange={handleChange} />
                            <Toggle label="SSL Expiry Reminders" name="check_ssl_expiry" checked={formData.check_ssl_expiry} onChange={handleChange} />
                            <Toggle label="Domain Expiry Reminders" name="check_domain_expiry" checked={formData.check_domain_expiry} onChange={handleChange} />
                            <Toggle label="Up HTTP Status Codes" name="check_http_status" checked={formData.check_http_status} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="bg-black rounded-[2.5rem] p-10 shadow-2xl border border-white/5 space-y-8">
                        <div className="flex items-center space-x-4 mb-2">
                            <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                                <BellAlertIcon className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-medium text-white uppercase tracking-tight">Notification</h3>
                        </div>

                        <div className="space-y-5">
                            <ToggleDark label="Notify via Email" name="notify_email" checked={formData.notify_email} onChange={handleChange} />
                            <ToggleDark label="Notify via Phone (SMS)" name="notify_phone" checked={formData.notify_phone} onChange={handleChange} />
                            <div className="h-px bg-white/10 my-2"></div>
                            <ToggleDark label="Visible on Status Page" name="visible_on_status_page" checked={formData.visible_on_status_page} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-6">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors"
                    >
                        Decline
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-black text-white px-16 py-5 rounded-3xl font-bold text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-black/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Synchronizing...' : isEdit ? 'Update Pulse Node' : 'Activate Pulse Node'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const Toggle = ({ label, name, checked, onChange }) => (
    <label className="flex items-center justify-between cursor-pointer group">
        <span className="text-sm font-medium text-zinc-600 group-hover:text-black transition-colors">{label}</span>
        <div className="relative">
            <input type="checkbox" name={name} checked={checked} onChange={onChange} className="sr-only" />
            <div className={`w-12 h-6 rounded-full transition-colors duration-500 ${checked ? 'bg-black' : 'bg-zinc-100'}`}></div>
            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-500 ${checked ? 'translate-x-6 outline outline-zinc-100' : ''}`}></div>
        </div>
    </label>
);

const ToggleDark = ({ label, name, checked, onChange }) => (
    <label className="flex items-center justify-between cursor-pointer group">
        <span className="text-sm font-medium text-white/50 group-hover:text-white transition-colors">{label}</span>
        <div className="relative">
            <input type="checkbox" name={name} checked={checked} onChange={onChange} className="sr-only" />
            <div className={`w-12 h-6 rounded-full transition-colors duration-500 ${checked ? 'bg-white' : 'bg-white/10'}`}></div>
            <div className={`absolute left-1 top-1 bg-zinc-900 w-4 h-4 rounded-full transition-transform duration-500 ${checked ? 'translate-x-6' : 'bg-white'}`}></div>
        </div>
    </label>
);

const InformationCircleIcon = (props) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default CreateMonitor;

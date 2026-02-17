import React, { useState, Fragment } from 'react';
import { Dialog, Transition, Listbox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/20/solid';
import api from '../services/api';
import { useToast } from './Toast';

const monitorTypes = [
    { id: 'HTTP', name: 'HTTP(s)' },
    { id: 'KEYWORD', name: 'Keyword' },
    { id: 'PING', name: 'Ping' },
    { id: 'PORT', name: 'Port' },
];

const CreateMonitorModal = ({ isOpen, closeModal, onMonitorCreated }) => {
    const [name, setName] = useState('');
    const [url, setUrl] = useState('https://');
    const [itemType, setItemType] = useState(monitorTypes[0]);
    const [interval, setInterval] = useState(5);
    const [keyword, setKeyword] = useState('');
    const [port, setPort] = useState(80);
    const [checkSsl, setCheckSsl] = useState(false);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('monitors/', {
                name,
                url,
                monitor_type: itemType.id,
                interval,
                keyword: itemType.id === 'KEYWORD' ? keyword : null,
                port: itemType.id === 'PORT' ? parseInt(port) : null,
                check_ssl: checkSsl
            });
            addToast(`Monitor "${name}" successfully synchronized!`, "success");
            onMonitorCreated();
            closeModal();
            // Reset form
            setName('');
            setUrl('https://');
            setKeyword('');
            setPort(80);
            setCheckSsl(false);
        } catch (error) {
            console.error(error);
            addToast("Synchronization failed. Check network or parameters.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-100" onClose={closeModal}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-md" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95 translate-y-8"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100 translate-y-0"
                            leaveTo="opacity-0 scale-95 translate-y-8"
                        >
                            <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-[3rem] bg-white p-12 text-left align-middle shadow-[0_32px_96px_-16px_rgba(0,0,0,0.15)] transition-all border border-black/5">
                                <div className="flex justify-between items-start mb-12">
                                    <div className="space-y-1">
                                        <Dialog.Title as="h3" className="text-4xl font-medium text-black uppercase leading-none tracking-tighter">
                                            New<span className="text-zinc-300">.</span>Pulse
                                        </Dialog.Title>
                                        <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-[0.3em]">Initialize new monitoring entity</p>
                                    </div>
                                    <button onClick={closeModal} className="p-3 hover:bg-zinc-50 rounded-2xl transition-all">
                                        <XMarkIcon className="w-6 h-6 text-zinc-300 hover:text-black transition-colors" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="space-y-8">
                                        <div>
                                            <label className="block text-[10px] font-medium text-zinc-600 uppercase tracking-widest mb-3 px-1">Monitor Class</label>
                                            <Listbox value={itemType} onChange={setItemType}>
                                                <div className="relative mt-1">
                                                    <Listbox.Button className="relative w-full cursor-pointer rounded-2xl bg-zinc-50 py-3.5 pl-5 pr-10 text-left sm:text-sm border border-black/5 focus:outline-none focus:bg-white focus:ring-4 focus:ring-black/5 transition-all font-medium text-black">
                                                        <span className="block truncate">{itemType.name}</span>
                                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                                                            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                                        </span>
                                                    </Listbox.Button>
                                                    <Transition
                                                        as={Fragment}
                                                        leave="transition ease-in duration-100"
                                                        leaveFrom="opacity-100"
                                                        leaveTo="opacity-0"
                                                    >
                                                        <Listbox.Options className="absolute mt-2 max-h-60 w-full overflow-auto rounded-2xl bg-white py-2 text-base shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10 border border-gray-100">
                                                            {monitorTypes.map((type) => (
                                                                <Listbox.Option
                                                                    key={type.id}
                                                                    className={({ active }) =>
                                                                        `relative cursor-default select-none py-3 pl-10 pr-4 transition-colors ${active ? 'bg-gray-50 text-black' : 'text-gray-900'
                                                                        }`
                                                                    }
                                                                    value={type}
                                                                >
                                                                    {({ selected }) => (
                                                                        <>
                                                                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                                                {type.name}
                                                                            </span>
                                                                            {selected ? (
                                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-black">
                                                                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                                                </span>
                                                                            ) : null}
                                                                        </>
                                                                    )}
                                                                </Listbox.Option>
                                                            ))}
                                                        </Listbox.Options>
                                                    </Transition>
                                                </div>
                                            </Listbox>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-medium text-zinc-600 uppercase tracking-widest mb-3 px-1">Friendly Entity Name</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Primary API Endpoint"
                                                className="input-noir"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-medium text-zinc-600 uppercase tracking-widest mb-3 px-1">URL / IP Address</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="input-noir"
                                                    value={url}
                                                    onChange={(e) => setUrl(e.target.value)}
                                                />
                                            </div>

                                            {itemType.id === 'KEYWORD' && (
                                                <div className="md:col-span-2">
                                                    <label className="block text-[10px] font-medium text-zinc-600 uppercase tracking-widest mb-3 px-1">Keyword to Match</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="e.g. status:ok"
                                                        className="input-noir"
                                                        value={keyword}
                                                        onChange={(e) => setKeyword(e.target.value)}
                                                    />
                                                </div>
                                            )}

                                            {itemType.id === 'PORT' && (
                                                <div>
                                                    <label className="block text-[10px] font-medium text-zinc-600 uppercase tracking-widest mb-3 px-1">Port Number</label>
                                                    <input
                                                        type="number"
                                                        required
                                                        className="input-noir"
                                                        value={port}
                                                        onChange={(e) => setPort(e.target.value)}
                                                    />
                                                </div>
                                            )}

                                            <div className={itemType.id === 'PORT' ? 'md:col-span-1' : 'md:col-span-1'}>
                                                <label className="block text-[10px] font-medium text-zinc-600 uppercase tracking-widest mb-3 px-1">Beat Interval (min)</label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="1"
                                                    className="input-noir"
                                                    value={interval}
                                                    onChange={(e) => setInterval(e.target.value)}
                                                />
                                            </div>

                                            <div className="md:col-span-2 flex items-center space-x-4 p-5 bg-zinc-50 rounded-2xl border border-black/5">
                                                <input
                                                    type="checkbox"
                                                    id="checkSsl"
                                                    checked={checkSsl}
                                                    onChange={(e) => setCheckSsl(e.target.checked)}
                                                    className="w-5 h-5 rounded-lg border-black/10 text-black focus:ring-black"
                                                />
                                                <label htmlFor="checkSsl" className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest cursor-pointer select-none">
                                                    Enable SSL Expiry Monitoring
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-6 bg-black text-white rounded-4xl font-medium text-xs uppercase tracking-[0.3em] shadow-2xl shadow-black/20 hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-50"
                                        >
                                            {loading ? 'Initializing Pulse...' : 'Activate Monitoring'}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default CreateMonitorModal;

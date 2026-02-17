import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { createTeamMember, updateTeamMember } from '../services/api';
import { useToast } from './Toast';
import CustomSelect from './CustomSelect';

const TeamUserModal = ({ isOpen, closeModal, onUserCreated, editUser = null }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('USER');
    const [canCreate, setCanCreate] = useState(false);
    const [canEdit, setCanEdit] = useState(false);
    const [canDelete, setCanDelete] = useState(false);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        if (editUser) {
            setName(editUser.username);
            setEmail(editUser.email);
            setRole(editUser.role);
            setCanCreate(editUser.can_create);
            setCanEdit(editUser.can_edit);
            setCanDelete(editUser.can_delete);
            setPassword(''); // Don't show password
        } else {
            setName('');
            setEmail('');
            setPassword('');
            setRole('USER');
            setCanCreate(false);
            setCanEdit(false);
            setCanDelete(false);
        }
    }, [editUser, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const data = {
            username: name,
            email,
            role,
            can_create: canCreate,
            can_edit: canEdit,
            can_delete: canDelete,
        };
        if (password) data.password = password;

        try {
            if (editUser) {
                await updateTeamMember(editUser.id, data);
                addToast("Entity matrix updated.", "success");
            } else {
                await createTeamMember(data);
                addToast("New entity synchronized to core.", "success");
            }
            onUserCreated();
            closeModal();
        } catch (error) {
            addToast("Synchronization failed. Check parameters.", "error");
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
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95 translate-y-8"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100 translate-y-0"
                            leaveTo="opacity-0 scale-95 translate-y-8"
                        >
                            <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-[3rem] bg-white p-12 text-left align-middle shadow-2xl transition-all border border-black/5">
                                <div className="flex justify-between items-start mb-10">
                                    <div>
                                        <Dialog.Title as="h3" className="text-3xl font-medium text-black uppercase tracking-tight">
                                            {editUser ? 'Modify' : 'Synchronize'} Entity
                                        </Dialog.Title>
                                        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-[0.2em] mt-2">Team Personnel Matrix</p>
                                    </div>
                                    <button onClick={closeModal} className="p-2 hover:bg-zinc-50 rounded-xl transition-colors">
                                        <XMarkIcon className="w-6 h-6 text-zinc-300" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-medium text-zinc-600 uppercase tracking-widest mb-3 px-1">Username</label>
                                            <input
                                                type="text"
                                                required
                                                className="input-noir"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-medium text-zinc-600 uppercase tracking-widest mb-3 px-1">Email Address</label>
                                            <input
                                                type="email"
                                                required
                                                className="input-noir"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-medium text-zinc-600 uppercase tracking-widest mb-3 px-1">Password {editUser && '(Leave blank to keep)'}</label>
                                            <input
                                                type="password"
                                                required={!editUser}
                                                className="input-noir"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <CustomSelect
                                                label="Core Role"
                                                value={role}
                                                onChange={(e) => setRole(e.target.value)}
                                                options={[
                                                    { value: 'USER', label: 'User' },
                                                    { value: 'SUPERADMIN', label: 'Superadmin' }
                                                ]}
                                            />
                                        </div>
                                    </div>

                                    {role === 'USER' && (
                                        <div className="space-y-6 pt-6 border-t border-zinc-50">
                                            <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest px-1">Privilege Assignment</p>
                                            <div className="grid grid-cols-3 gap-4">
                                                <PermissionToggle checked={canCreate} onChange={setCanCreate} label="Create" />
                                                <PermissionToggle checked={canEdit} onChange={setCanEdit} label="Edit" />
                                                <PermissionToggle checked={canDelete} onChange={setCanDelete} label="Delete" />
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-6">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-5 bg-black text-white rounded-2xl font-medium text-xs uppercase tracking-[0.3em] shadow-2xl shadow-black/20 hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-50"
                                        >
                                            {loading ? 'Processing...' : editUser ? 'Update Matrix' : 'Establish Entity'}
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

const PermissionToggle = ({ checked, onChange, label }) => (
    <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all ${checked ? 'bg-black border-black text-white shadow-xl' : 'bg-gray-50 border-transparent text-zinc-400'}`}
    >
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
        {checked && <ShieldCheckIcon className="w-4 h-4 text-white" />}
    </button>
);

export default TeamUserModal;

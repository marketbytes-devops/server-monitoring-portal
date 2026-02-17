import React, { useEffect, useState } from 'react';
import { UserGroupIcon, PlusSmallIcon, TrashIcon, ShieldCheckIcon, KeyIcon } from '@heroicons/react/24/outline';
import { useToast } from '../components/Toast';
import { getTeam, deleteTeamMember } from '../services/api';
import { getAuth } from '../services/auth';
import TeamUserModal from '../components/TeamUserModal';

const Team = () => {
    const { addToast } = useToast();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const auth = getAuth();

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const res = await getTeam();
            setMembers(res.data);
        } catch (error) {
            addToast("Failed to fetch team registry.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Terminate this entity's access?")) return;
        try {
            await deleteTeamMember(id);
            setMembers(prev => prev.filter(m => m.id !== id));
            addToast("Entity terminated from system logs.", "info");
        } catch (error) {
            addToast("Termination failed. Privilege check required.", "error");
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleInvite = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-4xl font-medium text-black uppercase leading-none tracking-tighter">
                        Team<span className="text-zinc-300">.</span>Force
                    </h1>
                    <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-[0.3em]">Authorized personnel directory</p>
                </div>
                {auth.isSuperAdmin && (
                    <button
                        onClick={handleInvite}
                        className="flex items-center space-x-2 bg-black text-white px-6 py-3 rounded-2xl font-medium text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-black/10 hover:bg-zinc-800 active:scale-95 transition-all"
                    >
                        <PlusSmallIcon className="w-4 h-4" />
                        <span>Invite Member</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {members.map(member => (
                    <div key={member.email} className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-black/2 border border-black/5 flex flex-col items-center text-center group hover:border-black/20 hover:-translate-y-1 transition-all duration-500 relative">
                        {auth.isSuperAdmin && member.role !== 'SUPERADMIN' && (
                            <button
                                onClick={() => handleDelete(member.id)}
                                className="absolute top-8 right-8 p-2 text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        )}

                        <div className={`w-20 h-20 rounded-4xl flex items-center justify-center text-2xl font-medium mb-6 shadow-xl shadow-black/20 group-hover:rotate-12 transition-transform duration-500 ${member.role === 'SUPERADMIN' ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-400'}`}>
                            {member.email.charAt(0).toUpperCase()}
                        </div>

                        <h3 className="text-xl font-medium text-black uppercase tracking-tight">{member.username}</h3>
                        <div className="flex items-center space-x-2 mt-2 mb-6">
                            <span className={`px-3 py-1 text-[8px] font-bold uppercase tracking-widest rounded-full ${member.role === 'SUPERADMIN' ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                                {member.role}
                            </span>
                        </div>

                        <p className="text-xs text-zinc-500 font-medium mb-8">{member.email}</p>

                        <div className="w-full space-y-4 pt-6 border-t border-zinc-50">
                            <p className="text-[9px] font-medium text-zinc-300 uppercase tracking-widest text-left px-2">Privilege Map</p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                <PermissionBadge active={member.can_create || member.role === 'SUPERADMIN'} label="CTR" />
                                <PermissionBadge active={member.can_edit || member.role === 'SUPERADMIN'} label="EDT" />
                                <PermissionBadge active={member.can_delete || member.role === 'SUPERADMIN'} label="DEL" />
                                <PermissionBadge active={true} label="VIEW" />
                            </div>
                        </div>

                        {auth.isSuperAdmin && (
                            <div className="mt-8 flex space-x-2 w-full">
                                <button
                                    onClick={() => handleEdit(member)}
                                    className="flex-1 py-3 bg-gray-50 rounded-2xl text-[9px] uppercase tracking-widest text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all font-bold"
                                >
                                    Modify Matrix
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <TeamUserModal
                isOpen={isModalOpen}
                closeModal={() => setIsModalOpen(false)}
                onUserCreated={fetchMembers}
                editUser={editingUser}
            />
        </div>
    );
};

const PermissionBadge = ({ active, label }) => (
    <div className={`px-2 py-1 rounded-md text-[8px] tracking-tighter ${active ? 'bg-zinc-900 text-white font-bold' : 'bg-zinc-50 text-zinc-200 font-medium'}`}>
        {label}
    </div>
);

export default Team;

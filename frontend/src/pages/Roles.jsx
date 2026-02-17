import React, { useState } from 'react';
import { LockClosedIcon, ShieldCheckIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { getAuth } from '../services/auth';

const Roles = () => {
    const auth = getAuth();

    const roleDefinitions = [
        {
            title: 'Superadmin',
            key: 'SUPERADMIN',
            description: 'Full system authorization. Can manage all entities, roles, and core infrastructure.',
            permissions: ['View All', 'Create Everything', 'Edit All Entities', 'Terminate Any Access', 'Manage Roles'],
            color: 'bg-black text-white'
        },
        {
            title: 'Standard User',
            key: 'USER',
            description: 'Standard operational access. Permissions are granularly assigned during synchronization.',
            permissions: ['View Monitors', 'Custom Assignment (CTR/EDT/DEL)'],
            color: 'bg-zinc-50 text-zinc-900 border border-black/5'
        }
    ];

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <div className="space-y-3">
                <div className="flex items-center space-x-3 text-[10px] font-medium text-black tracking-[0.3em] uppercase">
                    <div className="w-10 h-px bg-black"></div>
                    <span>Access Hierarchy Matrix</span>
                </div>
                <h1 className="text-6xl font-medium text-black uppercase leading-none tracking-tighter">
                    Security<span className="text-zinc-300">.</span>Roles
                </h1>
                <p className="text-[10px] font-normal text-zinc-600 uppercase tracking-[0.4em]">Defined system privilege containers</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {roleDefinitions.map((role) => (
                    <div key={role.key} className={`rounded-[3rem] p-12 transition-all duration-500 shadow-2xl shadow-black/2 border border-black/5 ${role.color}`}>
                        <div className="flex items-center justify-between mb-8">
                            <div className="w-14 h-14 bg-current opacity-10 rounded-2xl flex items-center justify-center">
                                <ShieldCheckIcon className="w-8 h-8" />
                            </div>
                            <span className="text-[10px] font-bold tracking-[0.4em] opacity-40 uppercase">Class {role.key.charAt(0)}</span>
                        </div>

                        <h2 className="text-3xl font-medium uppercase tracking-tight mb-4">{role.title}</h2>
                        <p className={`text-sm leading-relaxed mb-10 opacity-70`}>{role.description}</p>

                        <div className="space-y-4">
                            <p className="text-[9px] font-bold uppercase tracking-widest opacity-40 mb-2">Capability Map</p>
                            {role.permissions.map((perm, idx) => (
                                <div key={idx} className="flex items-center space-x-3">
                                    <CheckCircleIcon className="w-4 h-4 opacity-50" />
                                    <span className="text-[11px] font-medium tracking-wide uppercase">{perm}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-zinc-50 rounded-4xl p-10 flex items-start space-x-6 border border-black/5">
                <InformationCircleIcon className="w-8 h-8 text-black opacity-20 shrink-0" />
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-black">Granular Control Override</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed max-w-3xl font-medium">
                        While roles define the base container, individual personnel can be assigned specific operational capabilities (Create, Edit, Delete) during the synchronization process in the <span className="text-black underline cursor-pointer" onClick={() => window.location.href = '/team'}>Team management panel</span>.
                        Superadmins always possess complete system parity.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Roles;

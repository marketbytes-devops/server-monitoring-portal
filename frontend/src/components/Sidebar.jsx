import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { getAuth } from '../services/auth';
import {
    Squares2X2Icon,
    ShieldExclamationIcon,
    SignalIcon,
    ClockIcon,
    UsersIcon,
    ChartBarIcon,
    UserGroupIcon,
    LockClosedIcon,
    UserIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isCollapsed }) => {
    const [auth, setAuth] = useState(getAuth());

    useEffect(() => {
        setAuth(getAuth());
    }, []);

    const navGroups = [
        {
            title: 'Core',
            items: [
                { name: 'Dashboard', path: '/', icon: Squares2X2Icon },
                { name: 'Monitors', path: '/monitors', icon: ChartBarIcon },
            ]
        },
        {
            title: 'Infrastructure',
            items: [
                { name: 'Incidents', path: '/incidents', icon: ShieldExclamationIcon },
                { name: 'Status Pages', path: '/status-pages', icon: SignalIcon },
            ]
        },
        {
            title: 'Operations',
            items: [
                { name: 'Alert Contacts', path: '/alert-contacts', icon: UsersIcon },
                { name: 'Maintenance', path: '/maintenance', icon: ClockIcon },
            ]
        },
        // Only show Management for Superadmin
        ...(auth.isSuperAdmin ? [{
            title: 'Management',
            items: [
                { name: 'Team', path: '/team', icon: UserGroupIcon },
            ]
        }] : [])
    ];

    const bottomItems = [
        ...(auth.isSuperAdmin ? [{ name: 'User Roles', path: '/roles', icon: LockClosedIcon }] : []),
        { name: 'Profile', path: '/profile', icon: UserIcon },
    ];

    return (
        <aside className={`${isCollapsed ? 'w-24' : 'w-72'} h-screen sidebar-noir border-r border-white/5 flex flex-col transition-all duration-500 shadow-2xl overflow-hidden relative`}>
            {/* Logo Area */}
            <div className={`h-24 flex items-center ${isCollapsed ? 'justify-center' : 'px-8'} border-b border-white/5`}>
                <div className="flex items-center space-x-3 group cursor-pointer">
                    <div className="w-10 h-10 bg-white text-black flex items-center justify-center font-medium text-xl rounded-xl shadow-lg shadow-white/10 group-hover:rotate-12 transition-transform duration-500 shrink-0">
                        MB
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col animate-in fade-in duration-500">
                            <span className="text-lg font-medium tracking-tight text-white leading-none">
                                MarketBytes
                            </span>
                            <span className="text-[10px] text-zinc-500 font-normal uppercase tracking-widest mt-1">
                                Monitoring.System
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-10 no-scrollbar">
                {navGroups.map((group, idx) => (
                    <div key={idx} className="space-y-4">
                        {group.title && !isCollapsed && (
                            <h3 className="px-4 text-[9px] font-medium text-zinc-400 uppercase tracking-[0.3em] flex items-center justify-between animate-in fade-in duration-500">
                                {group.title}
                            </h3>
                        )}
                        <div className="space-y-2">
                            {group.items.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    title={isCollapsed ? item.name : ''}
                                    className={({ isActive }) =>
                                        `flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-3.5 text-sm font-medium rounded-2xl transition-all duration-500 group ${isActive
                                            ? 'sidebar-item-active-noir'
                                            : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                        }`
                                    }
                                >
                                    <item.icon className={`w-5 h-5 ${isCollapsed ? 'mr-0' : 'mr-3'} group-hover:scale-110 transition-transform duration-500`} />
                                    {!isCollapsed && <span className="tracking-tight animate-in fade-in duration-500 whitespace-nowrap">{item.name}</span>}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t border-white/5 space-y-2">
                {bottomItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        title={isCollapsed ? item.name : ''}
                        className={({ isActive }) =>
                            `flex items-center w-full ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-3.5 text-sm font-medium rounded-2xl transition-all group ${isActive
                                ? 'sidebar-item-active-noir'
                                : 'text-zinc-500 hover:text-white hover:bg-white/5'
                            }`
                        }
                    >
                        <item.icon className={`w-5 h-5 ${isCollapsed ? 'mr-0' : 'mr-3'} group-hover:scale-110 transition-transform duration-500`} />
                        {!isCollapsed && <span className="tracking-tight animate-in fade-in duration-500 whitespace-nowrap">{item.name}</span>}
                    </NavLink>
                ))}
            </div>
        </aside>
    );
};

export default Sidebar;

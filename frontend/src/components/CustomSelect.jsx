import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const CustomSelect = ({
    label,
    options,
    value,
    onChange,
    name,
    className = "",
    dark = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const activeOption = options.find(opt => opt.value === value) || options[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (val) => {
        onChange({ target: { name, value: val } });
        setIsOpen(false);
    };

    return (
        <div className={`space-y-3 ${className}`} ref={dropdownRef}>
            {label && (
                <label className={`text-[10px] font-bold uppercase tracking-widest px-1 ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    {label}
                </label>
            )}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-sm font-medium transition-all duration-300 outline-none border ${dark
                            ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                            : 'bg-zinc-50 border-black/5 text-black hover:bg-white hover:shadow-lg'
                        } ${isOpen ? (dark ? 'bg-white/10' : 'bg-white shadow-lg') : ''}`}
                >
                    <span className="truncate">{activeOption?.label || activeOption?.value}</span>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className={`absolute z-50 w-full mt-2 rounded-2xl shadow-2xl border p-2 animate-in fade-in slide-in-from-top-2 duration-300 ${dark
                            ? 'bg-zinc-900 border-white/5 text-white'
                            : 'bg-white border-black/5 text-black'
                        }`}>
                        <div className="max-h-60 overflow-y-auto custom-scrollbar">
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleSelect(option.value)}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 ${option.value === value
                                            ? (dark ? 'bg-white text-black font-bold' : 'bg-black text-white font-bold')
                                            : (dark ? 'hover:bg-white/5' : 'hover:bg-zinc-50')
                                        }`}
                                >
                                    {option.label || option.value}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomSelect;

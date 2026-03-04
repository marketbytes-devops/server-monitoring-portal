import React, { useState, useRef, useEffect } from 'react';
import { CalendarIcon, ClockIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const CustomDateTimePicker = ({ label, value, onChange, name, dark = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
    const dropdownRef = useRef(null);

    // Parse current value
    const selectedDate = value ? new Date(value) : null;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleDateClick = (day) => {
        const newDate = new Date(viewDate);
        newDate.setDate(day);

        // Preserve time if already exists
        if (selectedDate) {
            newDate.setHours(selectedDate.getHours());
            newDate.setMinutes(selectedDate.getMinutes());
        } else {
            newDate.setHours(12);
            newDate.setMinutes(0);
        }

        updateValue(newDate);
    };

    const handleTimeChange = (type, val) => {
        const newDate = selectedDate ? new Date(selectedDate) : new Date(viewDate);
        if (type === 'hour') newDate.setHours(parseInt(val));
        if (type === 'minute') newDate.setMinutes(parseInt(val));
        updateValue(newDate);
    };

    const updateValue = (date) => {
        // Format to ISO-like string that datetime-local inputs like or just keep as Date
        // But the parent expects a string usually for form data
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
        const formatted = localDate.toISOString().slice(0, 16);
        onChange({ target: { name, value: formatted } });
    };

    const renderCalendar = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const totalDays = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month);
        const days = [];

        // Padding for previous month
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`pad-${i}`} className="h-8 w-8"></div>);
        }

        for (let d = 1; d <= totalDays; d++) {
            const isSelected = selectedDate &&
                selectedDate.getDate() === d &&
                selectedDate.getMonth() === month &&
                selectedDate.getFullYear() === year;
            const isToday = new Date().getDate() === d &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

            days.push(
                <button
                    key={d}
                    type="button"
                    onClick={() => handleDateClick(d)}
                    className={`h-8 w-8 flex items-center justify-center rounded-lg text-[10px] font-bold transition-all ${isSelected
                        ? (dark ? 'bg-white text-black' : 'bg-black text-white')
                        : isToday
                            ? 'border border-black/10 text-black'
                            : 'hover:bg-zinc-100 dark:hover:bg-white/5 text-inherit'
                        }`}
                >
                    {d}
                </button>
            );
        }

        return days;
    };

    return (
        <div className="space-y-3" ref={dropdownRef}>
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
                    <div className="flex items-center space-x-3">
                        <CalendarIcon className="w-4 h-4 opacity-50" />
                        <span>{value ? new Date(value).toLocaleString() : 'Set Date & Time'}</span>
                    </div>
                </button>

                {isOpen && (
                    <div className={`absolute z-50 mt-4 p-8 rounded-[2.5rem] shadow-2xl border animate-in fade-in zoom-in-95 duration-300 w-[360px] ${dark ? 'bg-zinc-950 border-white/10 text-white' : 'bg-white border-black/5 text-black'
                        }`}>
                        {/* Month Selector */}
                        <div className="flex items-center justify-between mb-8">
                            <button type="button" onClick={handlePrevMonth} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                                <ChevronLeftIcon className="w-4 h-4" />
                            </button>
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400">
                                {viewDate.toLocaleString('default', { month: 'long' })} <span className="text-white ml-1">{viewDate.getFullYear()}</span>
                            </h4>
                            <button type="button" onClick={handleNextMonth} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                                <ChevronRightIcon className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-2 mb-8">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                <div key={d} className="h-8 w-8 flex items-center justify-center text-[7px] font-bold text-zinc-600 uppercase tracking-widest">
                                    {d}
                                </div>
                            ))}
                            {renderCalendar()}
                        </div>

                        {/* Time Selector */}
                        <div className="pt-8 border-t border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                    <ClockIcon className="w-3.5 h-3.5 text-zinc-500" />
                                    <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-zinc-500">Configure Pulse Time</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-center space-x-6 bg-white/2 p-4 rounded-2xl border border-white/5">
                                <div className="flex flex-col items-center">
                                    <span className="text-[7px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Hour</span>
                                    <select
                                        className="bg-transparent text-xl font-medium tracking-tighter outline-none cursor-pointer appearance-none text-center min-w-[40px] hover:text-blue-400 transition-colors"
                                        value={selectedDate ? selectedDate.getHours() : 12}
                                        onChange={(e) => handleTimeChange('hour', e.target.value)}
                                    >
                                        {[...Array(24)].map((_, i) => (
                                            <option key={i} value={i} className="bg-zinc-950">{i.toString().padStart(2, '0')}</option>
                                        ))}
                                    </select>
                                </div>
                                <span className="text-zinc-700 font-light text-xl mt-4">:</span>
                                <div className="flex flex-col items-center">
                                    <span className="text-[7px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Minute</span>
                                    <select
                                        className="bg-transparent text-xl font-medium tracking-tighter outline-none cursor-pointer appearance-none text-center min-w-[40px] hover:text-blue-400 transition-colors"
                                        value={selectedDate ? selectedDate.getMinutes() : 0}
                                        onChange={(e) => handleTimeChange('minute', e.target.value)}
                                    >
                                        {[...Array(60)].map((_, i) => (
                                            <option key={i} value={i} className="bg-zinc-950">{i.toString().padStart(2, '0')}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="w-full mt-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.4em] transition-all bg-white text-black hover:bg-zinc-200 shadow-xl shadow-white/5 active:scale-95"
                        >
                            Confirm Pulse
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomDateTimePicker;

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts([{ id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 3000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`flex items-center w-full max-w-xs p-4 rounded-lg shadow-lg border transition-all duration-300 transform translate-y-0 opacity-100 ${toast.type === 'success' ? 'bg-white border-green-100 text-gray-800' :
                            toast.type === 'error' ? 'bg-white border-red-100 text-gray-800' :
                                'bg-white border-blue-100 text-gray-800'
                            }`}
                        role="alert"
                    >
                        <div className={`inline-flex items-center justify-center shrink-0 w-8 h-8 rounded-lg ${toast.type === 'success' ? 'text-green-500 bg-green-100' :
                            toast.type === 'error' ? 'text-red-500 bg-red-100' :
                                'text-blue-500 bg-blue-100'
                            }`}>
                            {toast.type === 'success' && <CheckCircleIcon className="w-5 h-5" />}
                            {toast.type === 'error' && <XCircleIcon className="w-5 h-5" />}
                            {toast.type === 'info' && <InformationCircleIcon className="w-5 h-5" />}
                        </div>
                        <div className="ml-3 text-sm font-normal">{toast.message}</div>
                        <button
                            type="button"
                            className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8"
                            onClick={() => removeToast(toast.id)}
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

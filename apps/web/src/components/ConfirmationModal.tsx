import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Konfirmasi',
    cancelText = 'Batal',
    isDestructive = false,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative z-20 w-full max-w-[400px] flex flex-col bg-[#111122] rounded-xl border border-[#333366] shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-in-up">
                <div className="p-6">
                    <h3 className="text-white text-xl font-bold leading-tight tracking-[-0.015em] mb-2">{title}</h3>
                    <p className="text-[#9292c8] text-sm leading-relaxed">{message}</p>
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-[#333366] bg-[#151525]">
                    <button onClick={onClose} className="px-5 h-10 flex items-center justify-center rounded-lg border border-[#333366] bg-transparent text-white text-sm font-medium hover:bg-[#242447] transition-colors focus:ring-2 focus:ring-[#333366]">
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-5 h-10 flex items-center justify-center rounded-lg text-white text-sm font-bold shadow-lg transition-all focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#111122] ${isDestructive ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500' : 'bg-primary hover:bg-primary-dark focus:ring-primary'}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
